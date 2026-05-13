import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

/**
 * Singleton MSAL instance — kept in its own file to avoid circular dependencies
 * between index.tsx and api.ts.
 */
export const msalInstance = new PublicClientApplication(msalConfig);

