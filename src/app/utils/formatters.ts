/**
 * Format a file size given as a byte-count string into a human-readable string.
 * Returns '—' for missing, empty, or non-finite inputs.
 *
 * Examples:
 *   formatBytes('1024')    → '1.0KB'
 *   formatBytes('10240')   → '10KB'
 *   formatBytes('500')     → '500B'
 */
export const formatBytes = (bytes?: string): string => {
  if (!bytes) return '—';
  const size = Number(bytes);
  if (!Number.isFinite(size)) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)}${units[unitIndex]}`;
};

/**
 * Format an ISO date string into a locale-aware medium date + short time string.
 * Returns '—' for missing, empty, or unparseable inputs.
 *
 * Examples:
 *   formatDateTime('2024-04-15T10:30:00Z')  → '2024/04/15 10:30'  (ja-JP)
 *   formatDateTime(undefined)               → '—'
 */
export const formatDateTime = (value?: string, locale = 'ja-JP'): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
};
