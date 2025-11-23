/**
 * HubSpot Client Utility
 * Provides axios-based clients for different HubSpot operations per account
 * Supports multiple accounts (Minimal and Hoomy) with separate token configurations
 */

import axios from 'axios';
import { getHubSpotAccountConfig, HubSpotAccount } from '../config/hubspotAccounts';

interface HubSpotClients {
  dealsClient: ReturnType<typeof axios.create>;
  contactsClient: ReturnType<typeof axios.create>;
  associationsClient: ReturnType<typeof axios.create>;
  magicLinkClient: ReturnType<typeof axios.create>;
  searchClient: ReturnType<typeof axios.create>;
}

// Cache clients per account
const clientCache = new Map<HubSpotAccount, HubSpotClients>();

/**
 * Get HubSpot clients for a specific account
 * Creates and caches separate axios instances for different operations
 * @param account - The HubSpot account identifier ('minimal' or 'hoomy')
 * @returns Object with axios instances for different operations
 */
export function getHubSpotClients(account: HubSpotAccount = 'minimal'): HubSpotClients | null {
  // Return cached clients if available
  if (clientCache.has(account)) {
    return clientCache.get(account)!;
  }

  const config = getHubSpotAccountConfig(account);
  const baseURL = config.baseURL || 'https://api.hubapi.com';

  // Create separate axios instances for different operations
  // This matches the approach from the reference file
  const clients: HubSpotClients = {
    dealsClient: axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.dealsToken}`,
        'Content-Type': 'application/json',
      },
    }),

    contactsClient: axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.contactsToken || config.searchToken}`,
        'Content-Type': 'application/json',
      },
    }),

    associationsClient: axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.associationsToken || config.searchToken}`,
        'Content-Type': 'application/json',
      },
    }),

    magicLinkClient: axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.magicLinkToken || config.searchToken}`,
        'Content-Type': 'application/json',
      },
    }),

    searchClient: axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.searchToken}`,
        'Content-Type': 'application/json',
      },
    }),
  };

  // Cache the clients
  clientCache.set(account, clients);

  return clients;
}

/**
 * Get a specific client for an operation
 * @param account - The HubSpot account identifier
 * @param clientType - Type of client needed
 * @returns Axios instance for the specified operation
 */
export function getHubSpotClient(
  account: HubSpotAccount = 'minimal',
  clientType: 'deals' | 'contacts' | 'associations' | 'magicLink' | 'search' = 'contacts'
): ReturnType<typeof axios.create> | null {
  const clients = getHubSpotClients(account);
  if (!clients) {
    return null;
  }

  switch (clientType) {
    case 'deals':
      return clients.dealsClient;
    case 'contacts':
      return clients.contactsClient;
    case 'associations':
      return clients.associationsClient;
    case 'magicLink':
      return clients.magicLinkClient;
    case 'search':
      return clients.searchClient;
    default:
      return clients.contactsClient;
  }
}

/**
 * Clear client cache for an account (useful for testing or reconfiguration)
 * @param account - The account to clear cache for, or undefined to clear all
 */
export function clearHubSpotClientCache(account?: HubSpotAccount): void {
  if (account) {
    clientCache.delete(account);
  } else {
    clientCache.clear();
  }
}

/**
 * Legacy function for backward compatibility
 * Returns contacts client for the specified account
 * @deprecated Use getHubSpotClient() with explicit clientType instead
 */
export function getHubSpotClientLegacy(account: HubSpotAccount = 'minimal'): any {
  const clients = getHubSpotClients(account);
  if (!clients) {
    return null;
  }

  // Return a wrapper that mimics the @hubspot/api-client interface
  // This allows existing code to continue working
  return {
    crm: {
      contacts: {
        basicApi: {
          create: async (data: any) => {
            const response = await clients.contactsClient.post('/crm/v3/objects/contacts', data);
            return response.data;
          },
          update: async (contactId: string, data: any) => {
            const response = await clients.contactsClient.patch(`/crm/v3/objects/contacts/${contactId}`, data);
            return response.data;
          },
        },
        associationsApi: {
          getAll: async (contactId: string, toObjectType: string) => {
            const response = await clients.associationsClient.get(
              `/crm/v4/objects/contacts/${contactId}/associations/${toObjectType}`
            );
            return response.data;
          },
        },
      },
      properties: {
        coreApi: {
          getAll: async (objectType: string) => {
            const response = await clients.searchClient.get(`/crm/v3/properties/${objectType}`);
            return response.data;
          },
        },
      },
    },
  };
}
