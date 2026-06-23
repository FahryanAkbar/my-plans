# My Plans Worker

BullMQ worker for website monitoring jobs. It reads jobs from Redis, checks targets with HTTP fetch or Puppeteer, validates SSL, and writes metrics to InfluxDB.

## Local Development

```bash
npm install
npm run dev
```

Use `worker/.env` for local values. The Docker Compose development service uses `worker/Dockerfile` and runs the watcher.

## Production Build

```bash
npm ci
npm run build
npm start
```

For VPS deployment, use `worker/Dockerfile.prod`. It builds TypeScript into `dist/`, installs production dependencies only in the runtime image, and includes the shared libraries Puppeteer needs on Debian slim.

## Required Environment

Copy `.env.example` to `.env` on the server and replace secrets:

```bash
cp .env.example .env
```

At minimum, set Redis and InfluxDB values:

- `REDIS_HOST`
- `REDIS_PORT`
- `INFLUXDB_URL`
- `INFLUXDB_TOKEN`
- `INFLUXDB_ORG`
- `INFLUXDB_BUCKET`

Optional runtime tuning:

- `WORKER_CONCURRENCY`
- `DEFAULT_TIMEOUT_MS`
- `HEARTBEAT_INTERVAL_MS`
- `HEARTBEAT_TTL_SECONDS`
- `PUPPETEER_EXECUTABLE_PATH`
