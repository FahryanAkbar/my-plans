import * as dotenv from 'dotenv';
dotenv.config();

import { Worker, Job } from 'bullmq';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import * as https from 'https';
import { URL } from 'url';
import puppeteer, { Browser } from 'puppeteer';

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
): Promise<{ isUp: boolean; latency: number; statusCode: number; errorMessage?: string; timings?: null; pageSize?: number }> {
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

    const contentLength = response.headers.get('content-length');
    const pageSize = contentLength ? parseInt(contentLength, 10) : 0;

    return {
      isUp: response.status >= 200 && response.status < 400,
      latency: Math.round(latency),
      statusCode: response.status,
      pageSize,
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
      pageSize: 0,
    };
  }
}

// --- PUPPETEER NETWORK EMULATION CONFIG ---
const THROTTLING_PROFILES: Record<string, { latency: number; download: number; upload: number }> = {
  WIFI: {
    latency: 0,
    download: -1,
    upload: -1,
  },
  NETWORK_4G: {
    latency: 20,
    download: (4 * 1024 * 1024) / 8, // 4 Mbps
    upload: (3 * 1024 * 1024) / 8, // 3 Mbps
  },
  NETWORK_3G: {
    latency: 300,
    download: (500 * 1024) / 8, // 500 Kbps
    upload: (256 * 1024) / 8, // 256 Kbps
  },
  FAST_3G: {
    latency: 150,
    download: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
    upload: (750 * 1024) / 8, // 750 Kbps
  },
};

let globalBrowser: Browser | null = null;

async function getBrowserInstance(): Promise<Browser> {
  if (!globalBrowser) {
    globalBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('[Worker] Puppeteer browser initialized.');
  }
  return globalBrowser;
}

/**
 * Pings target using Puppeteer browser navigation with simulated network throttling.
 */
async function pingTargetWithPuppeteer(
  url: string,
  profileName: string,
  timeoutMs: number,
): Promise<{
  isUp: boolean;
  latency: number;
  statusCode: number;
  errorMessage?: string;
  timings?: { dns: number; tcp: number; tls: number; ttfb: number; download: number } | null;
  pageSize?: number;
}> {
  let page;
  try {
    const browser = await getBrowserInstance();
    page = await browser.newPage();
    await page.setCacheEnabled(false);

    const client = await page.target().createCDPSession();
    await client.send('Network.enable');

    const profile = THROTTLING_PROFILES[profileName] || THROTTLING_PROFILES['WIFI'] || {
      latency: 0,
      download: -1,
      upload: -1,
    };
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: profile.latency,
      downloadThroughput: profile.download,
      uploadThroughput: profile.upload,
    });

    const startTime = process.hrtime.bigint();
    const response = await page.goto(url, {
      waitUntil: 'load',
      timeout: timeoutMs,
    });
    const endTime = process.hrtime.bigint();

    const latency = Number(endTime - startTime) / 1_000_000;
    const statusCode = response ? response.status() : 0;
    const isUp = statusCode >= 200 && statusCode < 400;

    // Extract navigation timings
    let timings = null;
    try {
      timings = await page.evaluate(() => {
        const [t] = performance.getEntriesByType('navigation') as any[];
        if (!t) return null;

        const dns = Math.max(0, Math.round(t.domainLookupEnd - t.domainLookupStart));
        const secureConnect = t.secureConnectionStart || 0;
        const tcp = secureConnect > 0
          ? Math.max(0, Math.round(secureConnect - t.connectStart))
          : Math.max(0, Math.round(t.connectEnd - t.connectStart));
        const tls = secureConnect > 0
          ? Math.max(0, Math.round(t.connectEnd - secureConnect))
          : 0;
        const ttfb = Math.max(0, Math.round(t.responseStart - t.requestStart));
        const loadEnd = t.loadEventEnd || t.responseEnd;
        const download = Math.max(0, Math.round(loadEnd - t.responseStart));

        return { dns, tcp, tls, ttfb, download };
      });
    } catch (e) {
      console.error('[Worker] Failed to extract performance timings:', e);
    }

    // Extract page size (total network transfer size in bytes)
    let pageSize = 0;
    try {
      pageSize = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as any[];
        const resourceSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const [nav] = performance.getEntriesByType('navigation') as any[];
        const docSize = nav ? (nav.transferSize || 0) : 0;
        return resourceSize + docSize;
      });
    } catch (e) {
      console.error('[Worker] Failed to extract page size:', e);
    }

    return {
      isUp,
      latency: Math.round(latency),
      statusCode,
      timings,
      pageSize,
    };
  } catch (err: any) {
    let errMsg = err.message || 'Unknown browser navigation error';
    if (err.name === 'TimeoutError' || errMsg.includes('timeout')) {
      errMsg = 'Request Timeout';
    }
    return {
      isUp: false,
      latency: timeoutMs,
      statusCode: 0,
      errorMessage: errMsg,
      pageSize: 0,
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeErr: any) {
        console.error('[Worker] Error closing Puppeteer page:', closeErr.message);
      }
    }
  }
}

// --- SETUP BULLMQ WORKER ---
const worker = new Worker(
  'monitoring-queue',
  async (job: Job) => {
    const {
      configId,
      projectId,
      url,
      timeout,
      expectedStatus,
      checkSsl,
      engine,
      networkProfile,
    } = job.data;
    console.log(
      `[Worker] Job ${job.id} -> Checking target: ${url} (Config: ${configId}, Engine: ${engine || 'HTTP'}, Profile: ${networkProfile || 'WIFI'})`,
    );

    const timeoutMs = timeout || 30000;
    const expected = expectedStatus || 200;

    // 1. Perform Network measurement check (HTTP Fetch or Puppeteer Chrome Throttling)
    let pingResult;
    if (engine === 'PUPPETEER') {
      pingResult = await pingTargetWithPuppeteer(url, networkProfile || 'WIFI', timeoutMs);
    } else {
      pingResult = await pingTarget(url, timeoutMs);
    }

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
        .tag('engine', engine || 'HTTP')
        .tag('networkProfile', networkProfile || 'WIFI')
        .floatField('latency', pingResult.latency)
        .intField('statusCode', pingResult.statusCode)
        .booleanField('isUp', isUp)
        .booleanField('sslValid', sslValid)
        .stringField('errorMessage', errorMsg || '');

      if (sslDaysRemaining !== undefined) {
        point.intField('sslDaysRemaining', sslDaysRemaining);
      }

      if (pingResult.pageSize !== undefined) {
        point.intField('pageSize', pingResult.pageSize);
      }

      if (pingResult.timings) {
        point.floatField('dnsTime', pingResult.timings.dns)
          .floatField('tcpTime', pingResult.timings.tcp)
          .floatField('tlsTime', pingResult.timings.tls)
          .floatField('ttfbTime', pingResult.timings.ttfb)
          .floatField('downloadTime', pingResult.timings.download);
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
    if (globalBrowser) {
      await globalBrowser.close();
      console.log('[Worker] Puppeteer browser instance closed.');
    }
    console.log('[Worker] Graceful shutdown complete.');
    process.exit(0);
  } catch (err: any) {
    console.error(`[Worker] Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
