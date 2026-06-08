# Google Sheets CRM — Column Schema

This document defines the structure of the CRM Google Sheet that n8n writes to.

## Sheet Name: `Leads`

| Column | Header | Type | Source | Description |
|--------|--------|------|--------|-------------|
| A | `Timestamp` | DateTime | Apps Script | ISO8601 timestamp of form submission |
| B | `Name` | String | Form | Prospect's full name |
| C | `Email` | String | Form | Prospect's email address |
| D | `Company` | String | Form | Prospect's company name |
| E | `Use Case` | String | Form | What they're looking for |
| F | `Budget Range` | String | Form | Self-reported budget |
| G | `Timeline` | String | Form | When they need a solution |
| H | `Lead Score` | Number (1-10) | Gemini AI | AI-assessed qualification score |
| I | `Lead Category` | Enum | Gemini AI | `hot`, `warm`, or `cold` |
| J | `Qualification Reason` | String | Gemini AI | AI explanation of the score |
| K | `Email Subject` | String | Gemini AI | Subject line used in outreach email |
| L | `Email Sent` | Boolean | n8n | Whether the outreach email was delivered |
| M | `Alert Sent` | Boolean | n8n | Whether a hot lead alert was fired |
| N | `Processed At` | DateTime | n8n | When the n8n workflow completed |

## Hot Lead Threshold

By default, any lead with `Lead Score >= 7` triggers the Hot Lead Alert email.

This threshold is controlled by the IF node in the n8n workflow.
To change it: open the IF node → update the left value expression to your preferred threshold.
