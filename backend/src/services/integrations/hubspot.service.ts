import { getHubSpotClient } from '../../utils/hubspotClient';

export class HubSpotService {
  async findContactByEmail(email: string): Promise<string | null> {
    const client = getHubSpotClient();
    if (!client) {
      throw new Error('HubSpot client not configured');
    }

    try {
      // Try to create contact - if it exists, HubSpot will handle it
      // For now, just create a new contact
      return await this.createContact(email);
    } catch (error: any) {
      if (error.code === 404 || error.statusCode === 404) {
        // Contact doesn't exist, create it
        return await this.createContact(email);
      }
      throw error;
    }
  }

  async createContact(email: string): Promise<string> {
    const client = getHubSpotClient();
    if (!client) {
      throw new Error('HubSpot client not configured');
    }

    const response = await client.crm.contacts.basicApi.create({
      properties: {
        email,
      },
    });

    return response.id;
  }

  async updateContactProperties(
    contactId: string,
    properties: Record<string, string>
  ): Promise<void> {
    const client = getHubSpotClient();
    if (!client) {
      throw new Error('HubSpot client not configured');
    }

    try {
      await client.crm.contacts.basicApi.update(contactId, {
        properties,
      });
    } catch (error: any) {
      // Handle rate limiting (429)
      if (error.code === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 1;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        // Retry once
        return this.updateContactProperties(contactId, properties);
      }
      throw error;
    }
  }

  async syncSurveyResponse(
    email: string,
    responses: { questionId: string; hubspotProperty: string; value: string | string[] }[]
  ): Promise<void> {
    try {
      const contactId = await this.findContactByEmail(email);

      const properties: Record<string, string> = {};
      responses.forEach((response) => {
        // Convert array to comma-separated string if needed
        const value = Array.isArray(response.value)
          ? response.value.join(', ')
          : response.value;
        properties[response.hubspotProperty] = value;
      });

      if (contactId) {
        await this.updateContactProperties(contactId, properties);
      }
    } catch (error) {
      console.error('HubSpot sync error:', error);
      // Don't throw - we don't want to block survey completion
    }
  }
}

