import { getHubSpotClients, getHubSpotClient } from '../../utils/hubspotClient';
import { HubSpotAccount } from '../../config/hubspotAccounts';
import axios from 'axios';

export interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  objectType: 'contacts' | 'deals' | 'companies';
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

interface CachedProperties {
  properties: HubSpotProperty[];
  lastSync: Date;
}

// Per-account cache (in production, use Redis or similar)
const propertiesCache = new Map<HubSpotAccount, CachedProperties>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export class HubSpotService {
  /**
   * Fetch all HubSpot properties from multiple object types
   * @param account - The HubSpot account to fetch properties from
   * @returns Array of properties from contacts, deals, and companies
   */
  async fetchHubSpotProperties(account: HubSpotAccount = 'minimal'): Promise<HubSpotProperty[]> {
    const clients = getHubSpotClients(account);
    if (!clients) {
      console.warn(`HubSpot client not configured for account: ${account}. Returning empty properties array.`);
      return [];
    }

    // Check cache first
    const cached = propertiesCache.get(account);
    if (cached) {
      const cacheAge = Date.now() - cached.lastSync.getTime();
      if (cacheAge < CACHE_DURATION) {
        return cached.properties;
      }
    }

    try {
      // Fetch properties from all object types in parallel
      const [contactsResponse, dealsResponse, companiesResponse] = await Promise.allSettled([
        clients.searchClient.get('/crm/v3/properties/contacts'),
        clients.searchClient.get('/crm/v3/properties/deals'),
        clients.searchClient.get('/crm/v3/properties/companies'),
      ]);

      const allProperties: HubSpotProperty[] = [];

      // Process contacts properties
      if (contactsResponse.status === 'fulfilled') {
        const contactsProps = (contactsResponse.value.data as any)?.results || [];
        allProperties.push(
          ...contactsProps.map((prop: any) => ({
            name: prop.name,
            label: prop.label,
            type: prop.type,
            objectType: 'contacts' as const,
            description: prop.description || '',
            options: prop.options?.map((opt: any) => ({
              label: opt.label,
              value: opt.value,
            })),
          }))
        );
      } else {
        console.warn(`Failed to fetch contacts properties for ${account}:`, contactsResponse.reason);
      }

      // Process deals properties
      if (dealsResponse.status === 'fulfilled') {
        const dealsProps = (dealsResponse.value.data as any)?.results || [];
        allProperties.push(
          ...dealsProps.map((prop: any) => ({
            name: prop.name,
            label: prop.label,
            type: prop.type,
            objectType: 'deals' as const,
            description: prop.description || '',
            options: prop.options?.map((opt: any) => ({
              label: opt.label,
              value: opt.value,
            })),
          }))
        );
      } else {
        console.warn(`Failed to fetch deals properties for ${account}:`, dealsResponse.reason);
      }

      // Process companies properties
      if (companiesResponse.status === 'fulfilled') {
        const companiesProps = (companiesResponse.value.data as any)?.results || [];
        allProperties.push(
          ...companiesProps.map((prop: any) => ({
            name: prop.name,
            label: prop.label,
            type: prop.type,
            objectType: 'companies' as const,
            description: prop.description || '',
            options: prop.options?.map((opt: any) => ({
              label: opt.label,
              value: opt.value,
            })),
          }))
        );
      } else {
        console.warn(`Failed to fetch companies properties for ${account}:`, companiesResponse.reason);
      }

      // Update cache
      propertiesCache.set(account, {
        properties: allProperties,
        lastSync: new Date(),
      });

      return allProperties;
    } catch (error: any) {
      // If cache exists but fetch fails, return cached data
      const cached = propertiesCache.get(account);
      if (cached) {
        console.warn(`HubSpot API error for ${account}, returning cached properties:`, error.message);
        return cached.properties;
      }
      // If no cache and API fails, return empty array instead of throwing
      console.error(`HubSpot API error for ${account} and no cache available:`, error.message);
      return [];
    }
  }

  /**
   * Find contact by email
   * @param email - Contact email
   * @param account - HubSpot account to use
   * @returns Contact ID or null
   */
  async findContactByEmail(email: string, account: HubSpotAccount = 'minimal'): Promise<string | null> {
    const clients = getHubSpotClients(account);
    if (!clients) {
      throw new Error(`HubSpot client not configured for account: ${account}`);
    }

    try {
      // Try to get contact by email
      const response = await clients.contactsClient.get(`/crm/v3/objects/contacts/${email}?idProperty=email`);
      return (response.data as any)?.id || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Contact doesn't exist, create it
        return await this.createContact(email, account);
      }
      throw error;
    }
  }

  /**
   * Create a new contact
   * @param email - Contact email
   * @param account - HubSpot account to use
   * @returns Contact ID
   */
  async createContact(email: string, account: HubSpotAccount = 'minimal'): Promise<string> {
    const clients = getHubSpotClients(account);
    if (!clients) {
      throw new Error(`HubSpot client not configured for account: ${account}`);
    }

    try {
      const response = await clients.contactsClient.post('/crm/v3/objects/contacts', {
        properties: {
          email,
        },
      });
      return (response.data as any)?.id || '';
    } catch (error: any) {
      // If contact already exists, try to get it
      if (error.response?.status === 409) {
        const contactId = await this.findContactByEmail(email, account);
        if (!contactId) {
          throw new Error(`Failed to find or create contact for ${email}`);
        }
        return contactId;
      }
      throw error;
    }
  }

  /**
   * Update contact properties
   * @param contactId - Contact ID
   * @param properties - Properties to update
   * @param account - HubSpot account to use
   */
  async updateContactProperties(
    contactId: string,
    properties: Record<string, string>,
    account: HubSpotAccount = 'minimal'
  ): Promise<void> {
    const clients = getHubSpotClients(account);
    if (!clients) {
      throw new Error(`HubSpot client not configured for account: ${account}`);
    }

    try {
      await clients.contactsClient.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties,
      });
    } catch (error: any) {
      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers?.['retry-after'] || 1;
        await new Promise((resolve) => setTimeout(resolve, parseInt(retryAfter) * 1000));
        // Retry once
        return this.updateContactProperties(contactId, properties, account);
      }
      throw error;
    }
  }

  /**
   * Sync survey response to HubSpot
   * @param email - Contact email
   * @param responses - Form responses with HubSpot property mappings
   * @param account - HubSpot account to use
   */
  /**
   * Sync survey response to HubSpot
   * @param email - Contact email
   * @param responses - Survey responses with HubSpot property mappings
   * @param account - HubSpot account to use
   * @param targetType - 'contact' | 'deal' - determines if syncing to contact or deal
   * @param targetId - Specific HubSpot contact/deal ID to sync to (if provided, skips email lookup)
   */
  async syncSurveyResponse(
    email: string,
    responses: { questionId: string; hubspotProperty: string; value: string | string[] }[],
    account: HubSpotAccount = 'minimal',
    targetType?: 'contact' | 'deal' | null,
    targetId?: string | null
  ): Promise<void> {
    try {
      const properties: Record<string, string> = {};
      responses.forEach((response) => {
        // Convert array to comma-separated string if needed
        const value = Array.isArray(response.value)
          ? response.value.join(', ')
          : response.value;
        properties[response.hubspotProperty] = value;
      });

      // If targetId is provided, use it directly
      if (targetId && targetType) {
        if (targetType === 'contact') {
          await this.updateContactProperties(targetId, properties, account);
        } else if (targetType === 'deal') {
          await this.updateDealProperties(targetId, properties, account);
        }
        return;
      }

      // Otherwise, find contact by email (default behavior)
      const contactId = await this.findContactByEmail(email, account);
      if (contactId) {
        await this.updateContactProperties(contactId, properties, account);
      }
    } catch (error) {
      console.error(`HubSpot sync error for account ${account}:`, error);
      // Don't throw - we don't want to block survey completion
    }
  }

  /**
   * Update deal properties
   * @param dealId - HubSpot deal ID
   * @param properties - Properties to update
   * @param account - HubSpot account to use
   */
  async updateDealProperties(dealId: string, properties: Record<string, string>, account: HubSpotAccount = 'minimal'): Promise<void> {
    const clients = getHubSpotClients(account);
    if (!clients) {
      throw new Error(`HubSpot client not configured for account: ${account}`);
    }

    try {
      await clients.dealsClient.patch(`/crm/v3/objects/deals/${dealId}`, {
        properties,
      });
    } catch (error: any) {
      console.error('Error updating deal properties:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get property types mapping
   * @param account - HubSpot account to use
   * @returns Record of property name to type
   */
  async getPropertyTypes(account: HubSpotAccount = 'minimal'): Promise<Record<string, string>> {
    const properties = await this.fetchHubSpotProperties(account);
    const types: Record<string, string> = {};
    properties.forEach((prop) => {
      types[prop.name] = prop.type;
    });
    return types;
  }

  /**
   * Clear cache for a specific account or all accounts
   * @param account - Account to clear cache for, or undefined to clear all
   */
  clearCache(account?: HubSpotAccount): void {
    if (account) {
      propertiesCache.delete(account);
    } else {
      propertiesCache.clear();
    }
  }
}
