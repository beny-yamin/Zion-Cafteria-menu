/**
 * Canonical helper for customer-facing QR destinations.
 * Strict guarantee: Customer-facing QR codes will ALWAYS use the deployed production URL
 * and will NEVER output localhost, 127.0.0.1, or any development URL.
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

export const getTableQrUrl = (tableNumber: number): string => {
  const base = getQrBaseUrl();
  return tableNumber > 0 ? `${base}/menu?table=${tableNumber}` : `${base}/menu`;
};
