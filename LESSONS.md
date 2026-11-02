# Lessons Learned

The things that tripped me up in each phase, why they happened, and what I did about them.

## Phase 0: Prerequisites

_Mostly installs and account setup, nothing worth writing down yet._

## Phase 1: Backstage Core

- **Check the Node version first.** My shell defaulted to Node 26, but Backstage 1.56 only supports 22 or 24. On 26 the backend can't load `better-sqlite3`, so it crashes at startup, and the browser only shows _"Failed to sign in as a guest"_. I learned that an auth error in the UI can simply mean nothing is running on `:7007`, so that's now the first thing I check. `idp/.nvmrc` pins Node 24.
- **`app-config.local.yaml` sits on top of `app-config.yaml`, it doesn't replace it.** I renamed the base file to the local name and got that same sign-in error, because Backstage always expects `app-config.yaml` to exist. The local file should only hold what's different. One catch: objects merge key by key, but arrays like `integrations.github` and `catalog.locations` get replaced completely.
- **Neon's pooled host doesn't work with one schema per plugin.** I used the `-pooler` host and got migration errors saying the same tables both _"already exist"_ and _"do not exist"_, with tables landing in the wrong schemas. The pooler (PgBouncer in transaction mode) doesn't keep each connection's `search_path`, so plugins were overwriting each other's setup. Switching to the direct host fixed it. I also set `pluginDivisionMode: schema`, because otherwise Backstage tries to create a separate database for every plugin.
- **My connection was too slow for Node's default connect timeout.** The backend got stuck on _"Backend has not started yet"_ and every Neon connection failed with `ETIMEDOUT`, always after about 750 ms. Node gives each address only 250 ms to connect, and my connection to eu-central-1 was taking around 400 ms. `setDefaultAutoSelectFamilyAttemptTimeout(2000)` in `packages/backend/src/index.ts` fixed it. Now when a failure takes exactly the same time on every attempt, I suspect a client timeout before I blame the network.
- **Auth config changes need a restart.** Backstage only reads `auth.providers` at startup, so saving the file isn't enough.
- **Hiding the guest button doesn't remove guest access.** `/api/auth/guest/refresh` keeps issuing tokens until the guest provider module is gone from the backend, so I removed it from there too.
- **GitHub sign-in needs a matching User in the catalog.** `usernameMatchingUserEntityName` has nothing to match until org users are imported. I used `dangerouslyAllowSignInWithoutUserInCatalog` as a temporary bridge and removed it once the import was working.
- **A GitHub App only works where it's installed.** I picked my personal account (`1zyik`) as the repo owner and got _"No token available for host: github.com"_, because the app is only installed on `1zyik-platform`. The template form can no longer pick anything else.
- **Saving new GitHub App permissions doesn't apply them.** It only sends a request to the org owner. Until I accepted it on the installation page, tokens kept the old permissions and I kept getting _"Resource not accessible by integration"_. Creating repos needs **Administration: write**, and pushing `.github/workflows/*` needs **Workflows**, which turned out to be separate from Actions.
- **Changing a template doesn't update the repos it already created.** Each generated repo owns its `catalog-info.yaml`, so I had to fix the owner on `test-1` in that repo directly.

## Phase 2: Templates

- **Giving templates their own repo was worth it, just not for the reason I expected.** I was worried that lots of templates would bloat the repo and Docker image, but `node-service` is only 40 KB, so size was never the real problem. The real win is how much simpler everything around templates became:
  - **Adding a template is just a commit.** Before, every new template meant a config change, an image rebuild and a redeploy of the whole portal. Now I push a folder and it shows up on its own. A test template appeared about 2 minutes after I pushed it, with no restart.
  - **The portal and the templates move separately.** I can improve a template without touching Backstage, and upgrade Backstage without touching templates.
  - **Changes are easy to review and undo.** Templates have their own history and PRs, and fixing a bad change only takes a revert, not a new portal release.
  - **Other people can contribute.** Anyone adding a template only needs to know that repo, not how the portal is built.
  - **The one thing to watch:** merging to `main` makes a template live immediately, so PR review matters more.
- **TechDocs couldn't build in Docker on my Fedora machine.** With SELinux enforcing, the container couldn't read the folders Backstage shared with it (_"Path '/output' is not readable"_), because Backstage doesn't mount them with `:z`. The same build worked with `:z`, which told me the docs were fine and the problem was the host. I switched to `runIn: local` with MkDocs installed through `pipx`, rather than weakening SELinux for every container.
- **Reading repos needs the GitHub App's `Commit statuses` permission.** Creating repos worked fine, so the _"403 Forbidden"_ on the Docs tab surprised me. Backstage calls the commit status API before downloading docs or scanning a repo with a wildcard. GitHub's `x-accepted-github-permissions` response header named exactly what was missing, so I'll check that header first next time.
- **The Docker build context doesn't automatically put files in the image.** The backend Dockerfile only copies what it lists, so a template stored in the portal repo can load locally and still be missing from the image without its own `COPY` line.
- **Editing `catalog.locations` while the backend runs can leave a false error.** My new location failed with _"not of an allowed kind for that location"_ even though its rules allowed `Template`. A backend restart cleared it, so now I restart before I start debugging.
- **Each `fetch:template` needs its own `targetPath`.** All steps share one workspace, so without separate folders `publish:github` would also have pushed the GitOps manifest into the service repo.
- **Only `${{ }}` gets substituted in a skeleton.** Helm's `{{ }}` passes through untouched, which was a relief. GitHub Actions also uses `${{ }}`, so workflow files will need `copyWithoutTemplating`. Prettier can't parse Helm templates either, so I keep it away from skeletons.
- **`npm ci` means the skeleton needs its own lockfile.** I generate it once and replace the name fields with `${{ values.name }}`.
