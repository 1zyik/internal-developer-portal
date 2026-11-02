const express = require('express');
const client = require('prom-client');

const port = process.env.PORT || ${{ values.port }};

client.collectDefaultMetrics();

const app = express();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const server = app.listen(port, () => {
  console.log(`${{ values.name }} listening on port ${port}`);
});

// Node ignores SIGTERM when running as PID 1, so Kubernetes would otherwise
// wait out the whole termination grace period on every rollout
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
