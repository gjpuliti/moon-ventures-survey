import { Client } from '@hubspot/api-client';

let hubspotClient: Client | null = null;

export function getHubSpotClient(): Client | null {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) {
    console.warn('HUBSPOT_API_KEY not configured');
    return null;
  }

  if (!hubspotClient) {
    hubspotClient = new Client({ accessToken: apiKey });
  }

  return hubspotClient;
}

