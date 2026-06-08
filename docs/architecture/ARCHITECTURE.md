# System Architecture — Deep Dive

## Design Principles

1. **Event-driven, not polling** — The webhook fires exactly once per form submission. No scheduled jobs checking for new rows.
2. **Single responsibility per node** — Each n8n node does one thing. Gemini generates; Sheets stores; Gmail sends.
3. **Fail loudly** — n8n's error workflow catches failures so no lead is silently dropped.
4. **Stateful by default** — Every lead and AI output is persisted before any delivery action.

---

## Sequence Diagram

```
User          Form          Sheets        Apps Script     n8n             Gemini         Gmail
 │             │              │               │             │                │              │
 │──submit────▶│              │               │             │                │              │
 │             │──append─────▶│               │             │                │              │
 │             │              │──onFormSubmit▶│             │                │              │
 │             │              │               │──POST──────▶│                │              │
 │             │              │               │             │──analyze lead─▶│              │
 │             │              │               │             │◀──score+email──│              │
 │             │              │               │             │──write row─────────────────▶Sheets
 │             │              │               │             │──send email────────────────────▶│
 │             │              │               │             │                │              │
 │             │              │               │             │──IF score≥7?   │              │
 │             │              │               │             │──alert email───────────────────▶│
 │◀────────────────────────────────────────────────────────────────────────email delivered──│
```

---

## Component Specifications

### Google Forms → Google Sheets
- Native integration — no code required
- Appends a new row on each submission
- Trigger: `onFormSubmit` event in Apps Script

### Google Apps Script
- **Role**: Bridge between Sheets events and n8n
- **Why not a direct Sheets → webhook?**: Sheets doesn't natively POST to webhooks. Apps Script fills this gap.
- **Execution context**: Runs server-side on Google's infrastructure
- **Failure mode**: If webhook is unreachable, Apps Script logs the error. Future improvement: retry logic + DLQ.

### n8n Webhook Node
- **Mode**: Production (persistent URL, survives workflow edits)
- **Method**: HTTP POST
- **Auth**: None (protected by obscurity of URL + future improvement: HMAC signature validation)
- **Timeout**: n8n's default 300s — more than sufficient

### Gemini AI Agent Node
- **Model**: Gemini Pro (configurable)
- **Prompt strategy**: Structured JSON output enforcement via system prompt
- **Output parsing**: n8n JSON parse node extracts fields
- **Failure mode**: If Gemini returns malformed JSON, workflow catches the error

### IF Routing Node
- **Condition**: `lead_score >= threshold` (default: 7)
- **True branch**: Hot Lead Alert email
- **False branch**: No additional action (lead already in CRM)

### Google Sheets Write Node
- **Auth**: Service Account (not OAuth — more reliable for server-to-server)
- **Operation**: Append row
- **Columns**: See `config/sheets_schema.md`

### Gmail SMTP Nodes
- **Node 1** (always runs): Personalized customer confirmation
- **Node 2** (conditional): Hot lead sales alert
- **Auth**: App Password (not OAuth — avoids token expiry issues in production)

---

## Security Considerations

| Surface | Current State | Recommended Improvement |
|---------|--------------|------------------------|
| Webhook URL | Obscured URL | Add HMAC signature validation in Apps Script |
| Service Account JSON | Local / n8n credentials vault | Rotate keys every 90 days |
| Gmail App Password | n8n credentials vault | Monitor for unauthorized access in Google Account |
| Gemini API Key | n8n credentials vault | Set API key restrictions by IP in Google Cloud |
| Form inputs | Passed directly to Gemini | Sanitize/truncate inputs before AI processing |

---

## Scalability Analysis

| Dimension | Current Capacity | Bottleneck |
|-----------|-----------------|-----------|
| Lead volume | ~50-100/day | Gmail send limits (500/day free, 2000/day Workspace) |
| Latency | < 10 seconds | Gemini API response time (~2-3s) |
| Concurrent leads | Limited by n8n plan | n8n Cloud Starter: 5 concurrent executions |
| Storage | Unlimited | Google Sheets: 10M cells per sheet |

### Scaling Path
- **100-500 leads/day**: Current stack handles this with n8n Starter
- **500-5000 leads/day**: Upgrade to n8n Pro + SendGrid for email
- **5000+ leads/day**: Move to self-hosted n8n + dedicated SMTP + Redis queue

---

## Observability

Currently tracked in n8n execution history:
- Execution start/end time
- Per-node input/output data
- Error messages and stack traces

Future improvements:
- Structured logging to a dedicated Sheets tab or external logging service
- Alert on execution failures (n8n Error Workflow)
- Weekly lead pipeline summary email
