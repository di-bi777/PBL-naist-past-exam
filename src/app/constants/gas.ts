import { GAS_PROXY_PATH, GAS_PROXY_TARGET } from '../../../config/gas';

const defaultEndpoint = import.meta.env.DEV ? GAS_PROXY_PATH : GAS_PROXY_TARGET;

export const GAS_ENDPOINT =
  (import.meta.env.VITE_GAS_ENDPOINT as string | undefined) ?? defaultEndpoint;

export const GAS_DB_ENDPOINT =
  (import.meta.env.VITE_GAS_DB_ENDPOINT as string | undefined) ?? GAS_ENDPOINT;
