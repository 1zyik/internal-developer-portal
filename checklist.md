# IDP with Backstage: Checklist

## Phase 0: Prerequisites

| S/N | Task Description                                                                                                         | Status             | Remarks                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------------------------------------------- |
| 1   | Install dependencies needed for project (>= Node 20 LTS, Yarn, Docker, kubectl, kind or k3d, Terraform, Helm and gh CLI) | :white_check_mark: |                                                     |
| 2   | GitHub (Create personal organization so templates can create repos automatically)                                        | :white_check_mark: | [1zyik-platform](https://github.com/1zyik-platform) |
| 3   | Cloud Account (Free Tier should suffice)                                                                                 | :white_check_mark: | Using Oracle Cloud for this                         |
| 4   | Postgres DB (Optional but free tier should suffice)                                                                      | :white_check_mark: | Created free PostgresDB account with neon           |

## Phase 1: Backstage Core

| S/N | Task Description                                           | Status             | Remarks                                                |
| --- | ---------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| 1   | Scaffold the app and run locally                           | :white_check_mark: | Backstage 1.56.0 in `idp/`, runs on Node 24 (`.nvmrc`) |
| 2   | Provision PostgresDB and switch apps DB                    | :white_check_mark: | Neon direct endpoint (not pooler), schema per plugin   |
| 3   | Create GitHub OAuth App and add to config                  | :white_check_mark: | GitHub-only sign-in, guest provider removed            |
| 4   | Create GitHub App or PAT with `repo` and `workflow` scopes | :white_check_mark: | GitHub App installed on org (all repos)                |
| 5   | Configure Backstage Catalog and enable GitHub discovery    | :white_check_mark: | Repo discovery + org users/teams, example data removed |
| 6   | Commit changes to idp service                              | :white_check_mark: | README + [LESSONS.md](LESSONS.md) updated              |

## Phase 2: Templates

All paths are under `idp/templates/node-service/`, inside the Docker build context so `file` locations also resolve in the image.

| S/N | Task Description                                                                                                        | Status | Remarks                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| 1   | Create the GitOps repo in `1zyik-platform`                                                                              |        | `1zyik-platform/gitops`, target of the PR step (task 4)                           |
| 2   | `template.yaml`: inputs `name`, `owner`, `description`, `port`                                                          |        | `owner` via `OwnerPicker`, `allowedOwners: [1zyik-platform]` on `RepoUrlPicker`   |
| 3   | `template.yaml` steps: `fetch:template` → `publish:github` → `catalog:register`                                         |        |                                                                                   |
| 4   | `template.yaml` step: open a PR to the GitOps repo                                                                      |        | `publish:github:pull-request` adds an Argo CD `Application` at `apps/<name>.yaml` |
| 5   | `skeleton/`: Node.js Express app with `/health` and `/metrics` (`prom-client`)                                          |        | Listens on `port`                                                                 |
| 6   | `skeleton/Dockerfile`: multi-stage, non-root user                                                                       |        |                                                                                   |
| 7   | `skeleton/catalog-info.yaml` with annotations `github.com/project-slug`, `backstage.io/techdocs-ref`, `argocd/app-name` |        |                                                                                   |
| 8   | `skeleton/mkdocs.yml` and `skeleton/docs/index.md` for TechDocs                                                         |        | TechDocs builds in Docker (`runIn: docker`)                                       |
| 9   | `skeleton/deploy/`: Helm chart                                                                                          |        | `port` input sets the container and Service ports                                 |
| 10  | `skeleton/.github/workflows/ci.yaml`                                                                                    |        | Next phase                                                                        |
| 11  | Register the template in `catalog.locations`                                                                            |        | `app-config.yaml` and `app-config.production.yaml`                                |
| 12  | Test: create a service from the UI, confirm the repo exists and appears in the catalog                                  |        | Also check the GitOps PR, `/health` and `/metrics`                                |
