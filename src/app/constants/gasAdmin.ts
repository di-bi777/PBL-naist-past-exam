const DEFAULT_NETLIFY_FUNCTIONS_BASE = 'https://lucent-syrniki-9cfdd9.netlify.app';
const netlifyBase =
  (import.meta.env.VITE_NETLIFY_FUNCTIONS_BASE as string | undefined)?.trim() ||
  DEFAULT_NETLIFY_FUNCTIONS_BASE;
const normalizedBase = netlifyBase.replace(/\/+$/, '');
const hasValidBase = Boolean(normalizedBase);
const proxyBase = hasValidBase ? `${normalizedBase}/.netlify/functions/gas-proxy` : undefined;

const buildRoute = (route: 'drive' | 'approve' | 'reject' | 'db') =>
  proxyBase ? `${proxyBase}?route=${route}` : undefined;

export const GAS_DRIVE_ENDPOINT = buildRoute('drive');
export const GAS_APPROVE_ENDPOINT = buildRoute('approve');
export const GAS_REJECT_ENDPOINT = buildRoute('reject');
export const GAS_DB_ENDPOINT = buildRoute('db');
