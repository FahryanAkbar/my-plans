import { Worker, type Job } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import { config } from './config.js';
import { runMonitoringCheck } from './checks/monitoring-check.js';
import { closeBrowser } from './checks/puppeteer-check.js';
import { WorkerHeartbeat } from './heartbeat.js';
import { createWriteApi, writeMonitoringMetric } from './metrics.js';
import type { MonitoringJobData } from './types.js';

console.log('[Worker] Starting monitoring worker...');
console.log(`[Worker] Redis Host: ${config.redis.host}:${config.redis.port}`);
console.log(`[Worker] InfluxDB URL: ${config.influx.url}, Bucket: ${config.influx.bucket}`);
console.log(
  `[Worker] Queue: ${config.worker.queueName}, Concurrency: ${config.worker.concurrency}`,
);

const redisClient = new IORedis(config.redis);
const writeApi = createWriteApi();

let activeJobsCount = 0;
const heartbeat = new WorkerHeartbeat(redisClient, () => activeJobsCount);
heartbeat.start();

const worker = new Worker<MonitoringJobData>(
  config.worker.queueName,
  async (job: Job<MonitoringJobData>) => {
    activeJobsCount++;

    try {
      const jobData = normalizeJobData(job.data);
      const engine = jobData.engine ?? 'HTTP';
      const networkProfile = jobData.networkProfile ?? 'WIFI';

      console.log(
        `[Worker] Job ${job.id} -> Checking target: ${jobData.url} (Config: ${jobData.configId}, Engine: ${engine}, Profile: ${networkProfile})`,
      );

      const result = await runMonitoringCheck(jobData);

      console.log(
        `[Worker] Result for ${jobData.url} -> isUp: ${result.isUp}, Latency: ${result.ping.latency}ms, Status: ${result.ping.statusCode}, SSL Valid: ${result.ssl.valid}${result.errorMessage ? ` | Error: ${result.errorMessage}` : ''}`,
      );

      await writeMonitoringMetric(writeApi, jobData, result);
      console.log(`[Worker] Metric written to InfluxDB for ${jobData.url}`);
    } catch (error) {
      const err = error as Error;
      console.error(`[Worker] Job ${job.id} processing error: ${err.message}`);
      throw err;
    } finally {
      activeJobsCount--;
    }
  },
  {
    connection: config.redis,
    concurrency: config.worker.concurrency,
  },
);

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

worker.on('error', (err) => {
  console.error(`[Worker] Queue error: ${err.message}`);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`[Worker] Received ${signal}. Shutting down worker...`);
  heartbeat.stop();

  try {
    await worker.close();
    await writeApi.close();
    await closeBrowser();
    await heartbeat.remove();
    await redisClient.quit();
    console.log('[Worker] Graceful shutdown complete.');
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error(`[Worker] Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

function normalizeJobData(data: MonitoringJobData): MonitoringJobData {
  return {
    ...data,
    timeout: data.timeout ?? config.worker.defaultTimeoutMs,
    expectedStatus: data.expectedStatus ?? config.worker.defaultExpectedStatus,
    engine: data.engine ?? 'HTTP',
    networkProfile: data.networkProfile ?? 'WIFI',
  };
}
