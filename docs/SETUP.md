# Setup Guide

Complete step-by-step instructions to deploy LeadOps AI CRM from scratch.

---

## Prerequisites

Before starting, ensure you have:

- [ ] n8n instance running (self-hosted or n8n Cloud)
- [ ] Google account with access to:
  - Google Forms
  - Google Sheets
  - Google Apps Script
  - Gmail
- [ ] Google Cloud project with billing enabled
- [ ] Gemini API key from [Google AI Studio](https://aistudio.google.com/)

---

## Step 1 — Google Cloud Setup

### 1a. Enable APIs
In [Google Cloud Console](https://console.cloud.google.com/):
1. Enable **Google Sheets API**
2. Enable **Gmail API**
3. Enable **Gemini API** (via AI Studio or Cloud)

### 1b. Create a Service Account
1. IAM & Admin → Service Accounts → Create Service Account
2. Name it `leadops-service-account`
3. Role: `Editor` (for Sheets access)
4. Create and download the JSON key file
5. Keep this file secure — never commit it to git

### 1c. Share Sheets with Service Account
- Open your Google Sheet
- Share with the service account email (e.g., `leadops-service-account@your-project.iam.gserviceaccount.com`)
- Give **Editor** access

---

## Step 2 — Google Form + Sheet Setup

1. Create a new Google Form with these fields (names must match exactly):
   - `Full Name` (Short answer)
   - `Email Address` (Short answer)
   - `Company Name` (Short answer)
   - `What are you looking for?` (Paragraph)
   - `Budget Range` (Multiple choice or Short answer)
   - `Timeline` (Multiple choice or Short answer)

2. Link the form to a Google Sheet:
   - Responses tab → Link to Sheets → Create new sheet
   - Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

3. Add a second sheet tab named `Leads` — this is where n8n will write CRM data.

---

## Step 3 — Deploy Apps Script

1. In your Google Sheet: Extensions → Apps Script
2. Delete the default content
3. Paste the contents of `scripts/apps_script_trigger.gs`
4. Replace `YOUR_N8N_PRODUCTION_WEBHOOK_URL_HERE` with your n8n webhook URL (get this in Step 5)
5. Save the script (Ctrl+S)
6. Set the trigger:
   - Left sidebar → Triggers (clock icon)
   - Add Trigger
   - Function: `onFormSubmit`
   - Event source: From spreadsheet
   - Event type: On form submit
   - Save
7. Authorize the script when prompted

---

## Step 4 — n8n Workflow Import

1. Download `workflow/leadops_workflow.json`
2. Open n8n → Settings (top right) → Import workflow
3. Select the JSON file
4. The workflow will import with all nodes

---

## Step 5 — Configure n8n Credentials

In n8n: Settings → Credentials → Add Credential

### Gemini API
- Type: `Google Gemini(PaLM) Api`
- API Key: your key from Google AI Studio

### Gmail SMTP
- Type: `SMTP`
- Host: `smtp.gmail.com`
- Port: `465` (SSL) or `587` (TLS)
- Username: your Gmail address
- Password: [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)

### Google Sheets
- Type: `Google Sheets OAuth2` or `Service Account`
- Upload your service account JSON key

---

## Step 6 — Configure the Workflow Nodes

After import, update these nodes:

| Node | What to Update |
|------|----------------|
| **Webhook** | Copy the Production URL → paste into Apps Script |
| **Google Sheets (Write)** | Set your CRM Sheet ID and `Leads` tab name |
| **IF** | Verify threshold expression: `{{ $json.lead_score }} >= 7` |
| **Gmail — Customer Email** | Set `From` address to your Gmail |
| **Gmail — Alert Email** | Set `To` address to your sales/personal email |

---

## Step 7 — Activate and Test

1. In n8n: toggle the workflow to **Active**
2. Submit a test entry via your Google Form
3. Watch the n8n execution log in real-time
4. Verify:
   - [ ] Execution completes without errors
   - [ ] Customer email received in the test inbox
   - [ ] Lead row appears in the `Leads` sheet
   - [ ] Hot Lead Alert received (if score ≥ 7)

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Webhook not triggered | Apps Script trigger not set | Re-add `onFormSubmit` trigger |
| 401 on Sheets write | Service account not shared on Sheet | Share sheet with service account email |
| Gemini returns empty | Prompt format mismatch | Check node expression syntax in n8n |
| Email not delivered | App Password incorrect | Regenerate Gmail App Password |
| No hot lead alert | Score below threshold | Submit a test lead with high-intent answers |
