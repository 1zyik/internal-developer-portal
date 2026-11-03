# Internal Developer Portal (IDP) with Backstage

A self-hosted Internal Developer Portal built on [Backstage](https://backstage.io). Software templates, kept in their own [repo](https://github.com/1zyik-platform/backstage-templates), scaffold new repos into a GitHub org, data lives in Postgres, and the portal deploys to Kubernetes and Oracle Cloud.

## Stack

Backstage · GitHub ([1zyik-platform](https://github.com/1zyik-platform)) · GitHub Actions · GHCR · Postgres (Neon) · Docker · Kubernetes (kind/k3d) · Helm · Terraform · Oracle Cloud

## Progress

| Phase                 | Status  |
| --------------------- | ------- |
| 0. Prerequisites      | ✅ Done |
| 1. Backstage Core     | ✅ Done |
| 2. Templates          | ✅ Done |
| 3. CI/CD and Security | ✅ Done |

See [checklist.md](checklist.md) for task-level details and [LESSONS.md](LESSONS.md) for issues hit along the way.

## Getting Started

Requires Node 24, Yarn, MkDocs (`pipx install mkdocs && pipx inject mkdocs mkdocs-techdocs-core`), a Neon Postgres database, and a GitHub OAuth App and GitHub App on the org.

1. Install: `cd idp && nvm use && yarn install`
2. Create `idp/app-config.local.yaml` (git-ignored) with:
   - `backend.database`: Neon **direct** endpoint (not `-pooler`), `pluginDivisionMode: schema`, `ssl.require: true`
   - `auth.providers.github.development`: OAuth App `clientId` and `clientSecret`, callback `http://localhost:7007/api/auth/github/handler/frame`
   - `techdocs.generator.runIn: local`: Docker builds fail on hosts with SELinux enforcing
   - `integrations.github[0].apps`: `$include` the credentials file from `yarn backstage-cli create-github-app 1zyik-platform`, with the app installed on the org (all repos). It needs Administration, Contents, Pull requests and Workflows (write), plus Members and Commit statuses (read)
3. Run: `yarn start`, open http://localhost:3000 and sign in with GitHub (org members only). Sign-in asks for `repo` and `workflow`, because templates publish as you

For CI to update `gitops`, generated services need a GitHub App installed on `gitops` only (Contents: write), with `GITOPS_APP_CLIENT_ID` as an org variable and `GITOPS_APP_PRIVATE_KEY` as an org secret, both available to public repos.

## License

See [LICENSE](LICENSE).
