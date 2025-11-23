/**
 * HubSpot Account Configuration
 * Manages tokens and configuration for multiple HubSpot accounts (Minimal and Hoomy)
 */

export type HubSpotAccount = 'minimal' | 'hoomy';

export interface HubSpotAccountConfig {
  account: HubSpotAccount;
  dealsToken: string;
  searchToken: string;
  contactsToken: string;
  associationsToken: string;
  magicLinkToken: string;
  baseURL?: string;
}

const HUBSPOT_BASE_URL = 'https://api.hubapi.com';

/**
 * Get HubSpot account configuration
 * @param account - The account identifier ('minimal' or 'hoomy')
 * @returns Configuration object with all tokens for the account
 */
export function getHubSpotAccountConfig(account: HubSpotAccount): HubSpotAccountConfig {
  if (account === 'minimal') {
    return {
      account: 'minimal',
      // All tokens should be set in environment variables
      dealsToken: process.env.HUBSPOT_MINIMAL_TOKEN_DEALS || '',
      searchToken: process.env.HUBSPOT_MINIMAL_TOKEN_SEARCH || '',
      contactsToken: process.env.HUBSPOT_MINIMAL_TOKEN_CONTACTS || '',
      associationsToken: process.env.HUBSPOT_MINIMAL_TOKEN_ASSOCIATIONS || '',
      magicLinkToken: process.env.HUBSPOT_MINIMAL_TOKEN_MAGIC_LINK || '',
      baseURL: HUBSPOT_BASE_URL,
    };
  } else if (account === 'hoomy') {
    return {
      account: 'hoomy',
      // Placeholder tokens - to be configured later
      dealsToken: process.env.HUBSPOT_HOOMY_TOKEN_DEALS || '',
      searchToken: process.env.HUBSPOT_HOOMY_TOKEN_SEARCH || '',
      contactsToken: process.env.HUBSPOT_HOOMY_TOKEN_CONTACTS || '',
      associationsToken: process.env.HUBSPOT_HOOMY_TOKEN_ASSOCIATIONS || '',
      magicLinkToken: process.env.HUBSPOT_HOOMY_TOKEN_MAGIC_LINK || '',
      baseURL: HUBSPOT_BASE_URL,
    };
  }

  throw new Error(`Unknown HubSpot account: ${account}`);
}

/**
 * Check if an account is configured (has at least one token)
 * @param account - The account identifier
 * @returns true if account has at least one token configured
 */
export function isAccountConfigured(account: HubSpotAccount): boolean {
  const config = getHubSpotAccountConfig(account);
  return !!(
    config.dealsToken ||
    config.searchToken ||
    config.contactsToken ||
    config.associationsToken ||
    config.magicLinkToken
  );
}

