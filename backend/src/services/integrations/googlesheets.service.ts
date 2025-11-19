import { google } from 'googleapis';

export class GoogleSheetsService {
  private getAuth() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    return oauth2Client;
  }

  async appendRow(
    spreadsheetId: string,
    range: string,
    values: string[]
  ): Promise<void> {
    const auth = this.getAuth();
    if (!auth) {
      throw new Error('Google Sheets not configured');
    }

    const sheets = google.sheets({ version: 'v4', auth });

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
    } catch (error: any) {
      // Handle rate limiting
      if (error.code === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 1;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return this.appendRow(spreadsheetId, range, values);
      }
      throw error;
    }
  }

  async syncSurveyResponse(
    spreadsheetId: string,
    email: string,
    responses: { questionId: string; hubspotProperty: string; value: string | string[] }[]
  ): Promise<void> {
    try {
      // Prepare row data: email + all response values
      const rowData = [email, ...responses.map((r) => {
        return Array.isArray(r.value) ? r.value.join(', ') : r.value;
      })];

      await this.appendRow(spreadsheetId, 'Sheet1!A:Z', rowData);
    } catch (error) {
      console.error('Google Sheets sync error:', error);
      // Don't throw - we don't want to block survey completion
    }
  }
}

