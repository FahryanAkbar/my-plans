import type { PingResult } from '../types.js';

const USER_AGENT = 'MyPlans-Monitoring-Worker/1.0';

export async function pingTarget(url: string, timeoutMs: number): Promise<PingResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = process.hrtime.bigint();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    const latency = elapsedMs(startTime);
    const contentLength = response.headers.get('content-length');

    return {
      isUp: response.status >= 200 && response.status < 400,
      latency,
      statusCode: response.status,
      pageSize: contentLength ? Number.parseInt(contentLength, 10) : 0,
    };
  } catch (error) {
    const err = error as Error & { name?: string };
    return {
      isUp: false,
      latency: elapsedMs(startTime),
      statusCode: 0,
      errorMessage: err.name === 'AbortError' ? 'Request Timeout' : err.message || 'Unknown network error',
      pageSize: 0,
    };
  } finally {
    clearTimeout(timer);
  }
}

function elapsedMs(startTime: bigint): number {
  return Math.round(Number(process.hrtime.bigint() - startTime) / 1_000_000);
}
