import { config } from '../config.js';
import type { MonitoringJobData, MonitoringResult, SslCheckResult } from '../types.js';
import { pingTarget } from './http-check.js';
import { pingTargetWithPuppeteer } from './puppeteer-check.js';
import { checkSslCertificate } from './ssl-check.js';

export async function runMonitoringCheck(jobData: MonitoringJobData): Promise<MonitoringResult> {
  const timeoutMs = jobData.timeout ?? config.worker.defaultTimeoutMs;
  const expectedStatus = jobData.expectedStatus ?? config.worker.defaultExpectedStatus;
  const engine = jobData.engine ?? 'HTTP';
  const networkProfile = jobData.networkProfile ?? 'WIFI';

  const ping =
    engine === 'PUPPETEER'
      ? await pingTargetWithPuppeteer(jobData.url, networkProfile, timeoutMs)
      : await pingTarget(jobData.url, timeoutMs);

  const ssl = await runSslCheckIfNeeded(jobData, timeoutMs);
  const validation = validateResult(ping.isUp, ping.statusCode, expectedStatus, ssl);
  const errorMessage = validation.errorMessage ?? ping.errorMessage;

  const result: MonitoringResult = {
    isUp: validation.isUp,
    ping,
    ssl,
  };

  if (errorMessage) {
    result.errorMessage = errorMessage;
  }

  return result;
}

async function runSslCheckIfNeeded(
  jobData: MonitoringJobData,
  timeoutMs: number,
): Promise<SslCheckResult> {
  if (!jobData.url.startsWith('https:') || jobData.checkSsl === false) {
    return { valid: true };
  }

  return checkSslCertificate(jobData.url, timeoutMs);
}

function validateResult(
  isUp: boolean,
  statusCode: number,
  expectedStatus: number,
  ssl: SslCheckResult,
): { isUp: boolean; errorMessage?: string } {
  const errors: string[] = [];

  if (isUp && statusCode !== expectedStatus) {
    errors.push(`Status code mismatch. Expected ${expectedStatus}, got ${statusCode}`);
  }

  if (!ssl.valid) {
    errors.push(`SSL Error: ${ssl.error || 'Invalid'}`);
  }

  const result: { isUp: boolean; errorMessage?: string } = {
    isUp: isUp && errors.length === 0,
  };

  if (errors.length > 0) {
    result.errorMessage = errors.join(' | ');
  }

  return result;
}
