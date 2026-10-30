# IDP with Backstage: Checklist

## Phase 0: Prerequisites

| S/N | Task Description                                                                                                         | Status             | Remarks                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------------------------------------------- |
| 1   | Install dependencies needed for project (>= Node 20 LTS, Yarn, Docker, kubectl, kind or k3d, Terraform, Helm and gh CLI) | :white_check_mark: |                                                     |
| 2   | GitHub (Create personal organization so templates can create repos automatically)                                        | :white_check_mark: | [1zyik-platform](https://github.com/1zyik-platform) |
| 3   | AWS Account (Free Tier should suffice)                                                                                   | :white_check_mark: |                                                     |
| 4   | Postgres DB (Optional but free tier should suffice)                                                                      | :white_check_mark: | Created free PostgresDB account with neon           |

## Phase 1: Backstage Core

| S/N | Task Description                                           | Status             | Remarks                                                |
| --- | ---------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| 1   | Scaffold the app and run locally                           | :white_check_mark: | Backstage 1.56.0 in `idp/`, runs on Node 24 (`.nvmrc`) |
| 2   | Provision PostgresDB and switch apps DB                    |                    |                                                        |
| 3   | Create GitHub OAuth App and add to config                  |                    |                                                        |
| 4   | Create GitHub App or PAT with `repo` and `workflow` scopes |                    |                                                        |
| 5   | Configure Backstage Catalog and enable GitHub discovery    |                    |                                                        |
| 6   | Commit changes to idp service                              |                    |                                                        |
