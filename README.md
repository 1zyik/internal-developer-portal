# Internal Developer Portal (IDP) with Backstage

A self-hosted Internal Developer Portal built on [Backstage](https://backstage.io). Software templates scaffold new repos into a GitHub org, data lives in Postgres, and the portal deploys to Kubernetes and Oracle Cloud.

## Stack

Backstage · GitHub ([1zyik-platform](https://github.com/1zyik-platform)) · Postgres (Neon) · Docker · Kubernetes (kind/k3d) · Helm · Terraform · Oracle Cloud

## Progress

| Phase             | Status         |
| ----------------- | -------------- |
| 0. Prerequisites  | ✅ Done        |
| 1. Backstage Core | ✅ Done        |
| 2. Templates      | 🚧 In progress |

See [checklist.md](checklist.md) for task-level details and [LESSONS.md](LESSONS.md) for issues hit along the way.

## Getting Started

Requires Node 24, Yarn, a Neon Postgres database, and a GitHub OAuth App and GitHub App on the org.

1. Install: `cd idp && nvm use && yarn install`
2. Create `idp/app-config.local.yaml` (git-ignored) with:
   - `backend.database`: Neon **direct** endpoint (not `-pooler`), `pluginDivisionMode: schema`, `ssl.require: true`
   - `auth.providers.github.development`: OAuth App `clientId` and `clientSecret`, callback `http://localhost:7007/api/auth/github/handler/frame`
   - `integrations.github[0].apps`: `$include` the credentials file from `yarn backstage-cli create-github-app 1zyik-platform`, with the app installed on the org (all repos)
3. Run: `yarn start`, open http://localhost:3000 and sign in with GitHub (org members only)

## License

See [LICENSE](LICENSE).
