import puppeteer, { type Browser, type Page } from 'puppeteer';
import { config } from '../config.js';
import type { NavigationTimings, PingResult } from '../types.js';

const THROTTLING_PROFILES: Record<string, { latency: number; download: number; upload: number }> = {
  WIFI: { latency: 0, download: -1, upload: -1 },
  NETWORK_4G: {
    latency: 20,
    download: (4 * 1024 * 1024) / 8,
    upload: (3 * 1024 * 1024) / 8,
  },
  NETWORK_3G: {
    latency: 300,
    download: (500 * 1024) / 8,
    upload: (256 * 1024) / 8,
  },
  FAST_3G: {
    latency: 150,
    download: (1.5 * 1024 * 1024) / 8,
    upload: (750 * 1024) / 8,
  },
};

let browserInstance: Browser | null = null;

export async function getBrowserInstance(): Promise<Browser> {
  if (!browserInstance) {
    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    if (config.puppeteer.executablePath) {
      launchOptions.executablePath = config.puppeteer.executablePath;
    }

    browserInstance = await puppeteer.launch(launchOptions);
    console.log('[Worker] Puppeteer browser initialized.');
  }

  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (!browserInstance) {
    return;
  }

  await browserInstance.close();
  browserInstance = null;
  console.log('[Worker] Puppeteer browser instance closed.');
}

export async function pingTargetWithPuppeteer(
  url: string,
  profileName: string,
  timeoutMs: number,
): Promise<PingResult> {
  let page: Page | undefined;

  try {
    const browser = await getBrowserInstance();
    page = await browser.newPage();
    await page.setCacheEnabled(false);
    await emulateNetwork(page, profileName);

    const startTime = process.hrtime.bigint();
    const response = await page.goto(url, {
      waitUntil: 'load',
      timeout: timeoutMs,
    });
    const latency = Math.round(Number(process.hrtime.bigint() - startTime) / 1_000_000);
    const statusCode = response ? response.status() : 0;

    return {
      isUp: statusCode >= 200 && statusCode < 400,
      latency,
      statusCode,
      timings: await extractTimings(page),
      pageSize: await extractPageSize(page),
    };
  } catch (error) {
    const err = error as Error & { name?: string };
    const isTimeout = err.name === 'TimeoutError' || err.message?.toLowerCase().includes('timeout');

    return {
      isUp: false,
      latency: timeoutMs,
      statusCode: 0,
      errorMessage: isTimeout ? 'Request Timeout' : err.message || 'Unknown browser navigation error',
      pageSize: 0,
    };
  } finally {
    if (page) {
      await page.close().catch((error: Error) => {
        console.error('[Worker] Error closing Puppeteer page:', error.message);
      });
    }
  }
}

async function emulateNetwork(page: Page, profileName: string): Promise<void> {
  const client = await page.target().createCDPSession();
  const profile = THROTTLING_PROFILES[profileName] ?? THROTTLING_PROFILES.WIFI;

  if (!profile) {
    throw new Error('Missing default WIFI throttling profile');
  }

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.latency,
    downloadThroughput: profile.download,
    uploadThroughput: profile.upload,
  });
}

async function extractTimings(page: Page): Promise<NavigationTimings | null> {
  try {
    return await page.evaluate(() => {
      const [t] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (!t) {
        return null;
      }

      const secureConnect = t.secureConnectionStart || 0;
      return {
        dns: Math.max(0, Math.round(t.domainLookupEnd - t.domainLookupStart)),
        tcp:
          secureConnect > 0
            ? Math.max(0, Math.round(secureConnect - t.connectStart))
            : Math.max(0, Math.round(t.connectEnd - t.connectStart)),
        tls: secureConnect > 0 ? Math.max(0, Math.round(t.connectEnd - secureConnect)) : 0,
        ttfb: Math.max(0, Math.round(t.responseStart - t.requestStart)),
        download: Math.max(0, Math.round((t.loadEventEnd || t.responseEnd) - t.responseStart)),
      };
    });
  } catch (error) {
    console.error('[Worker] Failed to extract performance timings:', error);
    return null;
  }
}

async function extractPageSize(page: Page): Promise<number> {
  try {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const resourceSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return resourceSize + (navigation?.transferSize || 0);
    });
  } catch (error) {
    console.error('[Worker] Failed to extract page size:', error);
    return 0;
  }
}
