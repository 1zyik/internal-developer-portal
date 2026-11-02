# ${{ values.name }}

${{ values.description }}

## Endpoints

| Path       | Description                   |
| ---------- | ----------------------------- |
| `/health`  | Returns `{"status":"ok"}`     |
| `/metrics` | Prometheus metrics            |

## Run locally

```bash
npm install
npm start
```

The service listens on port ${{ values.port }}. Set `PORT` to override it.

## Deploy

The Helm chart is in `deploy/`. Argo CD deploys it from the `gitops` repo using `apps/${{ values.name }}.yaml`.
