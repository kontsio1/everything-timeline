/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */

const authorityUrl: string = import.meta.env.VITE_AUTHORITY_URL ?? '';
const tenantId: string = import.meta.env.VITE_TENANT_ID ?? '';

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID ?? '',
    authority: `${authorityUrl}/${tenantId}/`,
    redirectUri: window.location.origin ?? '/',
    postLogoutRedirectUri: window.location.origin ?? '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    'api://46b6051f-c5cc-45ff-b0f1-80d622010d66/access_as_user',
  ],
};
