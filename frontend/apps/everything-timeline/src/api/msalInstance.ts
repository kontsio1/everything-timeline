import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

/**
 * Singleton MSAL instance — kept in its own file to avoid circular dependencies.
 * `msalReady` is the single initialization promise consumed by both main.tsx and api.ts.
 * initialize() and handleRedirectPromise() are called exactly once here.
 */
export const msalInstance = new PublicClientApplication(msalConfig);

export const msalReady: Promise<void> = msalInstance
  .initialize()
  .then(() => msalInstance.handleRedirectPromise())
  .then((response) => {
    if (response?.account) {
      msalInstance.setActiveAccount(response.account);
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }
  });
