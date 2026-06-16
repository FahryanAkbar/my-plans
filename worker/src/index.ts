import * as dotenv from 'dotenv';
dotenv.config();

import { Worker, Job } from 'bullmq';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import * as https from 'https';
import { URL } from 'url';

// --- CONFIGURATION ---
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const influxUrl = process.env.INFLUXDB_URL || 'http://localhost:8086';
const influxToken = process.env.INFLUXDB_TOKEN || 'monitoring_admin_token_secret';
const influxOrg = process.env.INFLUXDB_ORG || 'my-plans';
const influxBucket = process.env.INFLUXDB_BUCKET || 'monitoring';

console.log('[Worker] Starting monitoring worker...');
console.log(`[Worker] Redis Host: ${redisHost}:${redisPort}`);
console.log(`[Worker] InfluxDB URL: ${influxUrl}, Bucket: ${influxBucket}`);

// --- INITIALIZE INFLUXDB ---
const influxDB = new InfluxDB({ url: influxUrl, token: influxToken });
const writeApi = influxDB.getWriteApi(influxOrg, influxBucket, 'ms');

// --- HELPERS ---

/**
 * Checks the SSL certificate of the target URL.
 */
function checkSslCertificate(
  urlStr: string,
  timeoutMs: number,
): Promise<{ valid: boolean; daysRemaining?: number; error?: string }> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(urlStr);
      if (parsedUrl.protocol !== 'https:') {
        return resolve({ valid: true }); // No SSL check needed for non-HTTPS
      }

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname,
        method: 'GET',
        rejectUnauthorized: false, // Set false to inspect invalid/expired certs
        timeout: timeoutMs,
        agent: false, // Force a new TLS handshake every time to retrieve the peer certificate
        headers: {
          Connection: 'close',
        },
      };

      const req = https.request(options, (res) => {
        const socket = res.socket as any;
        const cert = socket.getPeerCertificate();

        if (!cert || Object.keys(cert).length === 0) {
          return resolve({ valid: false, error: 'Could not retrieve SSL certificate' });
        }

        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const now = new Date();

        const isExpired = now > validTo || now < validFrom;
        const daysRemaining = Math.max(
          0,
          Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        );

        // Check if the connection is authorized and not expired
        const isAuthorized = socket.authorized;

        resolve({
          valid: isAuthorized && !isExpired,
          daysRemaining,
          error: isAuthorized ? undefined : (socket.authorizationError || 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'),
        });
      });

      req.on('error', (err) => {
        resolve({ valid: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false, error: 'SSL check timeout' });
      });

      req.end();
    } catch (err: any) {
      resolve({ valid: false, error: err.message });
    }
  });
}

/**
 * Pings the target URL and measures latency.
 */
async function pingTarget(
  url: string,
  timeoutMs: number,
): Promise<{ isUp: boolean; latency: number; statusCode: number; errorMessage?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = process.hrtime.bigint();
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MyPlans-Monitoring-Worker/1.0',
      },
    });

    const endTime = process.hrtime.bigint();
    const latency = Number(endTime - startTime) / 1_000_000; // nanoseconds to milliseconds

    clearTimeout(timer);

    return {
      isUp: response.status >= 200 && response.status < 400,
      latency: Math.round(latency),
      statusCode: response.status,
    };
  } catch (err: any) {
    clearTimeout(timer);
    const endTime = process.hrtime.bigint();
    const latency = Number(endTime - startTime) / 1_000_000;

    let errMsg = err.message || 'Unknown network error';
    if (err.name === 'AbortError') {
      errMsg = 'Request Timeout';
    }

    return {
      isUp: false,
      latency: Math.round(latency),
      statusCode: 0,
      errorMessage: errMsg,
    };
  }
}

// --- SETUP BULLMQ WORKER ---
const worker = new Worker(
  'monitoring-queue',
  async (job: Job) => {
    const { configId, projectId, url, timeout, expectedStatus, checkSsl } = job.data;
    console.log(`[Worker] Job ${job.id} -> Checking target: ${url} (Config: ${configId})`);

    const timeoutMs = timeout || 30000;
    const expected = expectedStatus || 200;

    // 1. Perform HTTP Ping and Latency check
    const pingResult = await pingTarget(url, timeoutMs);

    // 2. Perform SSL Check (only if URL is HTTPS and checkSsl option is enabled)
    let sslValid = true;
    let sslDaysRemaining: number | undefined;
    let sslError: string | undefined;

    if (url.startsWith('https:') && checkSsl !== false) {
      const sslResult = await checkSslCertificate(url, timeoutMs);
      sslValid = sslResult.valid;
      sslDaysRemaining = sslResult.daysRemaining;
      sslError = sslResult.error;
    }

    // 3. Final validation (override isUp if status code does not match expected status code)
    let isUp = pingResult.isUp;
    let errorMsg = pingResult.errorMessage;

    if (isUp && pingResult.statusCode !== expected) {
      isUp = false;
      errorMsg = `Status code mismatch. Expected ${expected}, got ${pingResult.statusCode}`;
    }

    if (!sslValid) {
      isUp = false;
      errorMsg = errorMsg ? `${errorMsg} | SSL Error: ${sslError || 'Invalid'}` : `SSL Error: ${sslError || 'Invalid'}`;
    }

    console.log(
      `[Worker] Result for ${url} -> isUp: ${isUp}, Latency: ${pingResult.latency}ms, Status: ${pingResult.statusCode}, SSL Valid: ${sslValid}${errorMsg ? ` | Error: ${errorMsg}` : ''}`,
    );

    // 4. Save metrics as data point in InfluxDB
    try {
      const point = new Point('http_checks')
        .tag('projectId', projectId)
        .tag('configId', configId)
        .tag('url', url)
        .tag('status', isUp ? 'success' : 'failed')
        .floatField('latency', pingResult.latency)
        .intField('statusCode', pingResult.statusCode)
        .booleanField('isUp', isUp)
        .booleanField('sslValid', sslValid)
        .stringField('errorMessage', errorMsg || '');

      if (sslDaysRemaining !== undefined) {
        point.intField('sslDaysRemaining', sslDaysRemaining);
      }

      writeApi.writePoint(point);
      await writeApi.flush();
      console.log(`[Worker] Metric written to InfluxDB for ${url}`);
    } catch (dbErr: any) {
      console.error(`[Worker] Failed to write metric to InfluxDB: ${dbErr.message}`);
    }
  },
  {
    connection: {
      host: redisHost,
      port: redisPort,
    },
    concurrency: 5, // Process up to 5 pings concurrently (komputasi paralel!)
  },
);

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

worker.on('error', (err) => {
  console.error(`[Worker] Queue error: ${err.message}`);
});

// --- GRACEFUL SHUTDOWN ---
const shutdown = async (signal: string) => {
  console.log(`[Worker] Received ${signal}. Shutting down worker...`);
  try {
    await worker.close();
    await writeApi.close();
    console.log('[Worker] Graceful shutdown complete.');
    process.exit(0);
  } catch (err: any) {
    console.error(`[Worker] Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
