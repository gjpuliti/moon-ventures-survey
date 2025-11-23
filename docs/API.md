# API Documentation

Complete API reference for the Internal Forms Management Platform.

## Base URL

- Development: `http://localhost:3001`
- Production: (configure in environment)

## Authentication

Most admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Public Endpoints

### Get Form by Slug

Get a published form configuration by its slug.

**Endpoint:** `GET /api/forms/:slug`

**Response:**
```json
{
  "id": "uuid",
  "name": "Form Name",
  "slug": "form-slug",
  "isActive": true,
  "isPublished": true,
  "branding": {
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#171717",
    "secondaryColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "textColor": "#000000"
  },
  "steps": [
    {
      "id": "uuid",
      "order": 1,
      "name": "Step Name",
      "description": "Step description",
      "questions": [
        {
          "id": "uuid",
          "order": 1,
          "text": "Question text",
          "type": "text",
          "isRequired": true,
          "options": null,
          "parentQuestionId": null,
          "conditionValue": null,
          "nestingLevel": 0
        }
      ]
    }
  ]
}
```

### Submit Form Response

Submit responses for a form step.

**Endpoint:** `POST /api/survey/response`

**Request Body:**
```json
{
  "email": "user@example.com",
  "formId": "uuid", // or "surveyId" for backward compatibility
  "stepNumber": 1,
  "responses": [
    {
      "questionId": "uuid",
      "value": "answer" // or ["answer1", "answer2"] for checkbox
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "currentStep": 2,
  "isCompleted": false
}
```

### Get Resume Data

Get incomplete form data for a user.

**Endpoint:** `GET /api/survey/resume/:email`

**Query Parameters:**
- `formId` (optional): Form ID
- `surveyId` (optional): Survey ID (legacy)

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "formId": "uuid",
  "currentStep": 2,
  "isCompleted": false,
  "responses": [
    {
      "questionId": "uuid",
      "value": "answer"
    }
  ]
}
```

## Admin Endpoints

### Forms

#### List Forms

**Endpoint:** `GET /api/admin/forms`

**Query Parameters:**
- `status` (optional): `draft` | `published` | `archived`
- `type` (optional): Form type filter
- `search` (optional): Search in name and description

**Response:** Array of form objects

#### Get Form by ID

**Endpoint:** `GET /api/admin/forms/:id`

**Response:** Form object with steps and questions

#### Create Form

**Endpoint:** `POST /api/admin/forms`

**Request Body:**
```json
{
  "name": "Form Name",
  "type": "post_purchase",
  "description": "Form description",
  "branding": {},
  "settings": {}
}
```

#### Update Form

**Endpoint:** `PUT /api/admin/forms/:id`

**Request Body:** Partial form object

#### Delete Form

**Endpoint:** `DELETE /api/admin/forms/:id`

**Response:** `{ "success": true }`

#### Duplicate Form

**Endpoint:** `POST /api/admin/forms/:id/duplicate`

**Request Body:**
```json
{
  "name": "New Form Name"
}
```

#### Publish Form

**Endpoint:** `POST /api/admin/forms/:id/publish`

**Response:** Updated form object

#### Unpublish Form

**Endpoint:** `POST /api/admin/forms/:id/unpublish`

**Response:** Updated form object

### Questions

#### List Questions

**Endpoint:** `GET /api/admin/questions`

**Query Parameters:**
- `formId` (optional): Filter by form ID

**Response:** Array of question objects

#### Create Question

**Endpoint:** `POST /api/admin/questions`

**Request Body:**
```json
{
  "stepId": "uuid",
  "order": 1,
  "text": "Question text",
  "type": "text",
  "options": ["option1", "option2"], // for dropdown/checkbox
  "isRequired": true,
  "hubspotProperty": "property_name",
  "parentQuestionId": "uuid", // optional
  "conditionValue": "value" // optional, string or array
}
```

#### Update Question

**Endpoint:** `PUT /api/admin/questions/:id`

**Request Body:** Partial question object

#### Delete Question

**Endpoint:** `DELETE /api/admin/questions/:id`

#### Reorder Questions

**Endpoint:** `PUT /api/admin/questions/reorder`

**Request Body:**
```json
{
  "updates": [
    { "id": "uuid", "order": 1 },
    { "id": "uuid", "order": 2 }
  ]
}
```

### Steps

#### List Steps

**Endpoint:** `GET /api/admin/steps`

**Query Parameters:**
- `formId` (optional): Filter by form ID

#### Create Step

**Endpoint:** `POST /api/admin/steps`

**Request Body:**
```json
{
  "formId": "uuid",
  "order": 1,
  "name": "Step Name",
  "description": "Step description"
}
```

### Analytics

#### Get Form Analytics

**Endpoint:** `GET /api/admin/forms/:formId/analytics`

**Response:**
```json
{
  "overview": {
    "views": 100,
    "starts": 80,
    "completions": 60,
    "completionRate": 75,
    "averageTime": 120,
    "dropOffRate": 25
  },
  "timeSeries": {
    "daily": [],
    "weekly": [],
    "monthly": []
  },
  "devices": {
    "mobile": 40,
    "tablet": 20,
    "desktop": 40
  }
}
```

#### Export Responses

**Endpoint:** `GET /api/admin/forms/:formId/analytics/export`

**Query Parameters:**
- `format`: `csv` | `json`

**Response:** File download

### Integrations

#### Get HubSpot Properties

**Endpoint:** `GET /api/admin/integrations/hubspot/properties`

**Response:** Array of HubSpot property objects

## Error Responses

All endpoints may return error responses:

**Status Code:** `400` | `401` | `404` | `500`

**Response:**
```json
{
  "error": "Error message",
  "details": {} // optional
}
```

## Rate Limiting

- Survey endpoints: 100 requests per 15 minutes
- Admin endpoints: 50 requests per 15 minutes

