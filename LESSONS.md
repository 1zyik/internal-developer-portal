# Lessons Learned

Challenges hit in each phase, what caused them, and the fix.

## Phase 0: Prerequisites

_Nothing notable recorded._

## Phase 1: Backstage Core

- **Use a supported Node version.** On Node 26 the backend crashed at startup (`better-sqlite3` was built for a different `NODE_MODULE_VERSION`), and the frontend only showed _"Failed to sign in as a guest"_. Backstage 1.56 supports Node 22 or 24, so `idp/.nvmrc` pins 24. If the UI shows an auth error, first check whether the backend on `:7007` is actually up.
- **`app-config.local.yaml` adds to `app-config.yaml`, it doesn't replace it.** Renaming the base file broke startup because `app-config.yaml` is always loaded. The local file is merged on top: objects merge key by key, but arrays (e.g. `integrations.github`, `catalog.locations`) are replaced entirely.
- **Neon's pooled endpoint breaks schema-per-plugin.** Migrations failed with tables that both _"already exist"_ and _"do not exist"_, scattered across the wrong schemas. Neon's pooler (PgBouncer, transaction mode) doesn't keep each connection's `search_path`. Use the direct endpoint. Also set `pluginDivisionMode: schema`; the default creates a separate database per plugin.
- **Node gives each address only 250 ms to connect.** On a slow link (around 400 ms to eu-central-1), every Neon connection failed with `ETIMEDOUT` after a consistent ~750 ms and the backend sat at _"Backend has not started yet"_. Fixed with `setDefaultAutoSelectFamilyAttemptTimeout(2000)` in `packages/backend/src/index.ts`. A failure that always takes the same time is usually a client-side timeout, not the network.
- **Auth config is only read at startup.** Changes to `auth.providers` need a backend restart.
- **Removing guest sign-in means removing the backend module too.** Hiding the button isn't enough: `/api/auth/guest/refresh` keeps issuing tokens until the guest provider module is removed from the backend.
- **The sign-in resolver needs a matching User in the catalog.** `usernameMatchingUserEntityName` only works once GitHub org users are imported. `dangerouslyAllowSignInWithoutUserInCatalog` was a temporary bridge and was removed after GitHub org ingestion was added.
- **A GitHub App only works where it is installed.** Choosing the personal account (`1zyik`) as the repo owner failed with _"No token available for host: github.com"_ because the app is installed only on `1zyik-platform`. Templates now set `allowedOwners`.
- **New GitHub App permissions must be accepted on the installation.** Saving them on the app only sends a request to the org owner; until it's accepted, tokens keep the old set (_"Resource not accessible by integration"_). Creating repos needs **Administration: write**. Pushing `.github/workflows/*` needs **Workflows**, which is a different permission from Actions.
- **A generated repo's `catalog-info.yaml` is the source of truth.** Changing the template doesn't update repos it already created; existing repos have to be edited directly.
