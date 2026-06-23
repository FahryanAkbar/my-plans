import * as dotenv from 'dotenv';

dotenv.config();

const parseInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInteger(process.env.REDIS_PORT, 6379),
  },
  influx: {
    url: process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN || 'monitoring_admin_token_secret',
    org: process.env.INFLUXDB_ORG || 'my-plans',
    bucket: process.env.INFLUXDB_BUCKET || 'monitoring',
  },
  worker: {
    queueName: process.env.QUEUE_NAME || 'monitoring-queue',
    concurrency: parseInteger(process.env.WORKER_CONCURRENCY, 5),
    defaultTimeoutMs: parseInteger(process.env.DEFAULT_TIMEOUT_MS, 30000),
    defaultExpectedStatus: parseInteger(process.env.DEFAULT_EXPECTED_STATUS, 200),
    heartbeatIntervalMs: parseInteger(process.env.HEARTBEAT_INTERVAL_MS, 10000),
    heartbeatTtlSeconds: parseInteger(process.env.HEARTBEAT_TTL_SECONDS, 15),
  },
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  },
} as const;
