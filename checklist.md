# IDP with Backstage: Checklist

## Phase 0: Prerequisites

| S/N | Task Description                                                                                           | Status             | Remarks                                             |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------- |
| 1   | Install the tools the project needs: Node 24, Yarn, Docker, kubectl, k3d, Terraform, Helm and the `gh` CLI | :white_check_mark: |                                                     |
| 2   | Create a GitHub organization so templates have somewhere to create repos                                   | :white_check_mark: | [1zyik-platform](https://github.com/1zyik-platform) |
| 3   | Set up a free-tier cloud account to deploy to later                                                        | :white_check_mark: | Using Oracle Cloud for this                         |
| 4   | Set up a free Postgres database so Backstage's data survives restarts                                      | :white_check_mark: | Created free PostgresDB account with neon           |

## Phase 1: Backstage Core

| S/N | Task Description                                                              | Status             | Remarks                                                |
| --- | ----------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| 1   | Generate the Backstage app and get it running locally                         | :white_check_mark: | Backstage 1.56.0 in `idp/`, runs on Node 24 (`.nvmrc`) |
| 2   | Move Backstage from its in-memory database to Postgres on Neon                | :white_check_mark: | Neon direct endpoint (not pooler), schema per plugin   |
| 3   | Add "Sign in with GitHub" using a GitHub OAuth App                            | :white_check_mark: | GitHub-only sign-in, guest provider removed            |
| 4   | Give Backstage its own GitHub access so it can read repos and create new ones | :white_check_mark: | GitHub App installed on org (all repos)                |
| 5   | Fill the catalog automatically from the org's repos, members and teams        | :white_check_mark: | Repo discovery + org users/teams, example data removed |
| 6   | Commit the Phase 1 work and write up the setup steps in the README            | :white_check_mark: | README + [LESSONS.md](LESSONS.md) updated              |

## Phase 2: Templates

Templates live in [`backstage-templates`](https://github.com/1zyik-platform/backstage-templates), under `templates/<name>/`. Backstage scans that repo, so adding a template doesn't need a rebuild.

| S/N | Task Description                                                                                               | Status             | Remarks                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Create a `gitops` repo to hold each service's deployment manifest                                              | :white_check_mark: | `1zyik-platform/gitops`, target of the PR step (task 4)                                                                        |
| 2   | Build the template's form to ask for a service name, owning team, description and port                         | :white_check_mark: | `owner` via `OwnerPicker`; repo always created in `1zyik-platform`, so no `RepoUrlPicker`                                      |
| 3   | Make the template generate the code, create the GitHub repo and register the service in the catalog            | :white_check_mark: |                                                                                                                                |
| 4   | Make the template open a PR on `gitops`, so a new service gets reviewed before it deploys                      | :white_check_mark: | Built-in `publish:github:pull-request` adds an Argo CD `Application` at `apps/<name>.yaml`                                     |
| 5   | Write the starter Express app, with `/health` to check it's up and `/metrics` for Prometheus                   | :white_check_mark: | Listens on `port`; `/metrics` serves default Node metrics                                                                      |
| 6   | Write a multi-stage Dockerfile that keeps the image small and doesn't run as root                              | :white_check_mark: | Runs as `node` (UID 1000)                                                                                                      |
| 7   | Write the service's `catalog-info.yaml`, linking it to its GitHub repo, docs and Argo CD app                   | :white_check_mark: |                                                                                                                                |
| 8   | Add starter docs so each service gets a Docs page in Backstage                                                 | :white_check_mark: | Docs tab works with `runIn: local` (task 13)                                                                                   |
| 9   | Write a Helm chart so each service can be deployed to Kubernetes                                               | :white_check_mark: | `port` input sets the container and Service ports; not yet deployed to a cluster                                               |
| 10  | Add a GitHub Actions CI workflow to the starter code (next phase)                                              |                    | Next phase                                                                                                                     |
| 11  | Add the template to `catalog.locations` so it shows up on the Create page                                      | :white_check_mark: | One `url` location with a wildcard, in `app-config.yaml` and `app-config.production.yaml`                                      |
| 12  | Try it for real: create a service from the UI, then check the repo and catalog entry exist                     | :white_check_mark: | `hello-service`: repo, catalog entry and GitOps PR confirmed; PR left unmerged                                                 |
| 13  | Fix the Docs tab on my machine, where SELinux blocks the TechDocs Docker build                                 | :white_check_mark: | `runIn: local` with MkDocs from `pipx`; docs built for `hello-service` and `hello-service-2`                                   |
| 14  | Move templates into their own GitHub repo, so adding one doesn't need a Backstage rebuild                      | :white_check_mark: | `node-service` moved and `idp/templates/` removed; a test template appeared and disappeared in about 2 minutes with no restart |
| 15  | Give the GitHub App the `Commit statuses` read permission, so Backstage can read docs and templates from repos | :white_check_mark: | GitHub returned 403 without it                                                                                                 |
