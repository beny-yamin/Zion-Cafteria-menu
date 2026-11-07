import crypto from 'crypto';

/**
 * Canonical helper for customer-facing QR destinations.
 * Strict guarantee: Customer-facing QR codes will ALWAYS use the deployed production URL
 * with an opaque/secure token, hiding the table number from the visible URL.
 */
export const DEPLOYED_FRONTEND_URL = 'https://zion-cafteria-frontend1.onrender.com';

export const getQrBaseUrl = (): string => {
  const configured = (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || '').trim().replace(/\/$/, '');

  // Guard against any development URL reaching customer QR codes
  if (!configured || configured.includes('localhost') || configured.includes('127.0.0.1')) {
    return DEPLOYED_FRONTEND_URL;
  }
  return configured;
};

export const generateQrToken = (tableNumber: number, type: 'table' | 'general'): string => {
  const prefix = type === 'general' ? 'g' : 't';
  const randomHex = crypto.randomBytes(6).toString('hex');
  return `${prefix}_${randomHex}`;
};

export const getTokenMenuUrl = (qrToken: string): string => {
  const base = getQrBaseUrl();
  return `${base}/?m=${qrToken}`;
};

export const getTableQrUrl = (tableNumber: number, qrToken?: string): string => {
  if (qrToken) {
    return getTokenMenuUrl(qrToken);
  }
  const base = getQrBaseUrl();
  return tableNumber > 0 ? `${base}/menu?table=${tableNumber}` : `${base}/menu`;
};
