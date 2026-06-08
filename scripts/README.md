# Scripts

## apps_script_trigger.gs

**Purpose**: Google Apps Script that listens for form submissions and dispatches the lead payload to the n8n webhook.

**Deployment**:
1. Open your Google Sheet
2. Extensions → Apps Script
3. Paste contents of `apps_script_trigger.gs`
4. Update `WEBHOOK_URL` to your n8n production webhook URL
5. Save → Triggers → Add `onFormSubmit` trigger

**Customization**:
- Update the field names in `getField()` calls to match your exact Google Form question text
- The field names are case-sensitive and must be exact matches

**Logging**:
- `Logger.log()` output is visible in Apps Script → Executions
- Check here first if the webhook is not receiving data
