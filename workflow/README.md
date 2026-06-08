# Workflow

## Import Instructions

1. In n8n, click **Settings** (top right) → **Import from File**
2. Select `leadops_workflow.json`
3. The workflow imports with all node structure intact
4. Re-configure credentials (see `docs/SETUP.md`)

## Export Instructions (to update this file)

When you make changes to the workflow in n8n:

1. Open the workflow
2. Three-dot menu → **Download**
3. Replace `leadops_workflow.json` with the downloaded file
4. Commit to git

## What the JSON Contains

The workflow export includes:
- All node configurations and positions
- Node connections and routing
- Expression logic (references to `$json` fields)
- IF condition thresholds

**Does NOT include:**
- Credentials (never exported by n8n for security reasons)
- Webhook URLs (regenerated per n8n instance)
- Environment-specific settings

## Notes on Sharing

The workflow JSON is safe to share publicly — it contains no secrets.
Before committing, verify the JSON does not contain any API keys, passwords, or personal email addresses embedded in node configurations.
