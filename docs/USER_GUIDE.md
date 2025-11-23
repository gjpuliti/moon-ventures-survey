# User Guide

Complete guide for using the Internal Forms Management Platform.

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Enter your credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

### Dashboard Overview

The Forms Dashboard (`/admin/forms`) shows all your forms with:
- Form name and description
- Status indicators (Draft, Published, Archived)
- Response counts
- Quick actions menu (Edit, Duplicate, Publish, Archive)

## Creating a Form

1. Click **"+ New Form"** on the Forms Dashboard
2. Enter a form name
3. You'll be redirected to the Form Editor

## Form Editor

The Form Editor has 5 tabs:

### Settings Tab

- **Form Name**: Change the form name
- **Description**: Add a description
- **Form Type**: Select from predefined types
- **Publication Status**: Publish or unpublish the form
- **Form Slug**: Auto-generated URL-friendly identifier
- **Public URL**: Copy the public link to share

### Steps Tab

Steps organize your form into sections.

**Adding a Step:**
1. Click **"+ Add Step"**
2. Enter step name and optional description
3. Set the order number
4. Click **Save**

**Editing/Deleting:**
- Click **Edit** to modify a step
- Click **Delete** to remove (must delete questions first)

### Questions Tab

**Adding a Question:**
1. Select the step from the dropdown
2. Click **"+ Add Question"**
3. Fill in:
   - Question text
   - Question type
   - Options (for dropdown/checkbox)
   - Required status
   - HubSpot property mapping
4. Configure conditional logic (optional)
5. Click **Save**

**Question Types:**
- **Text**: Single-line text input
- **Text Area**: Multi-line text input
- **Dropdown**: Single selection from options
- **Checkbox**: Multiple selections
- **Date**: Date picker
- **Email**: Email validation
- **Phone**: Phone number input
- **Number**: Numeric input
- **Rating**: 1-5 star rating
- **NPS**: 0-10 Net Promoter Score

**Conditional Logic:**
- Select a parent question
- Choose the answer value(s) that trigger this question
- Visual flow shows the condition hierarchy
- Maximum nesting level: 3

**Reordering Questions:**
- Drag questions by the handle icon
- Order saves automatically

### Branding Tab

Customize the form appearance:

- **Logo URL**: Add your company logo
- **Primary Color**: Main text/heading color
- **Secondary Color**: Button/action color
- **Background Color**: Form background
- **Text Color**: Body text color

Changes appear in the live preview on the right.

### Preview Tab

See how the form looks to users:
- Switch between Mobile, Tablet, and Desktop views
- Preview updates in real-time as you make changes

## Conditional Logic

Conditional logic shows questions based on previous answers.

**Example:**
1. Question 1: "Do you own a car?" (Dropdown: Yes/No)
2. Question 2: "What brand?" (Condition: Show when Question 1 = "Yes")

**Setting Up:**
1. In the Questions tab, edit a question
2. Scroll to "Conditional Logic" section
3. Select parent question
4. Choose trigger value(s)
5. Save

**Visual Flow:**
The editor shows the condition hierarchy:
```
Parent Question → Condition Value → Current Question
```

## HubSpot Integration

### Mapping Questions to Properties

1. Go to **Integrations** (`/admin/integrations`)
2. Select a form
3. For each question, choose a HubSpot property
4. Mappings save automatically

### Auto-Discovery

The system automatically fetches available HubSpot properties. Make sure your HubSpot API key is configured in environment variables.

## Analytics

### Viewing Analytics

1. Go to Forms Dashboard
2. Click **Analytics** on a form card, or
3. Navigate to `/admin/forms/[id]/analytics`

### Metrics Explained

- **Views**: Number of times form was accessed
- **Starts**: Number of form submissions started
- **Completions**: Number of completed submissions
- **Completion Rate**: Percentage of starts that completed
- **Average Time**: Average time to complete (seconds)
- **Drop-Off Rate**: Percentage who started but didn't complete

### Exporting Data

1. Go to Analytics page
2. Click **Export CSV** or **Export JSON**
3. File downloads automatically

## Publishing Forms

1. In Form Editor, go to **Settings** tab
2. Click **Publish** button
3. Form becomes publicly accessible at `/survey/[slug]`

**Unpublishing:**
- Click **Unpublish** to make form unavailable
- Existing responses are preserved

## Sharing Forms

1. In Form Editor Settings tab, click **Copy URL**
2. Share the link: `https://yourdomain.com/survey/[slug]?email=user@example.com`
3. Email parameter pre-fills the email field

## Best Practices

1. **Test Before Publishing**: Use Preview tab to test the form
2. **Use Descriptive Names**: Clear form and step names help users
3. **Keep Steps Focused**: Don't put too many questions in one step
4. **Test Conditional Logic**: Verify conditional questions work as expected
5. **Mobile Testing**: Always preview on mobile view
6. **HubSpot Mapping**: Map all important questions for better data tracking

## Troubleshooting

**Form not showing publicly:**
- Check if form is published (Settings tab)
- Verify form is active (not archived)

**Conditional logic not working:**
- Ensure parent question is answered
- Check condition values match exactly
- Verify nesting level is under 3

**Analytics not updating:**
- Allow a few minutes for data to process
- Check if form has received responses

