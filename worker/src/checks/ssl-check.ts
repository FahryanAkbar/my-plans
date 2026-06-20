import * as https from 'https';
import { URL } from 'url';
import type { SslCheckResult } from '../types.js';

export function checkSslCertificate(urlStr: string, timeoutMs: number): Promise<SslCheckResult> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(urlStr);
      if (parsedUrl.protocol !== 'https:') {
        resolve({ valid: true });
        return;
      }

      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname,
          method: 'GET',
          rejectUnauthorized: false,
          timeout: timeoutMs,
          agent: false,
          headers: {
            Connection: 'close',
          },
        },
        (res) => {
          const socket = res.socket as typeof res.socket & {
            authorized?: boolean;
            authorizationError?: string;
            getPeerCertificate?: () => { valid_to?: string; valid_from?: string };
          };
          const cert = socket.getPeerCertificate?.();

          if (!cert || Object.keys(cert).length === 0 || !cert.valid_to || !cert.valid_from) {
            resolve({ valid: false, error: 'Could not retrieve SSL certificate' });
            return;
          }

          const validTo = new Date(cert.valid_to);
          const validFrom = new Date(cert.valid_from);
          const now = new Date();
          const isExpired = now > validTo || now < validFrom;
          const daysRemaining = Math.max(
            0,
            Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          );

          const result: SslCheckResult = {
            valid: Boolean(socket.authorized) && !isExpired,
            daysRemaining,
          };

          if (!socket.authorized) {
            result.error = socket.authorizationError || 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
          }

          resolve(result);
        },
      );

      req.on('error', (err) => resolve({ valid: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false, error: 'SSL check timeout' });
      });
      req.end();
    } catch (error) {
      const err = error as Error;
      resolve({ valid: false, error: err.message });
    }
  });
}
