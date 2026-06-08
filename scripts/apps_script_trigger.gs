/**
 * LeadOps AI CRM — Google Apps Script Webhook Dispatcher
 *
 * Deploy this in the Google Sheet that receives Form responses.
 * Set an onFormSubmit trigger to call onFormSubmit().
 *
 * Setup:
 *  1. Extensions → Apps Script → paste this file
 *  2. Replace WEBHOOK_URL with your n8n Production Webhook URL
 *  3. Triggers → Add Trigger → onFormSubmit → From spreadsheet → On form submit
 */

const WEBHOOK_URL = "YOUR_N8N_PRODUCTION_WEBHOOK_URL_HERE";

function onFormSubmit(e) {
  try {
    const namedValues = e.namedValues;

    // Build payload from form fields — update keys to match your form questions
    const payload = {
      name:         getField(namedValues, "Full Name"),
      email:        getField(namedValues, "Email Address"),
      company:      getField(namedValues, "Company Name"),
      use_case:     getField(namedValues, "What are you looking for?"),
      budget_range: getField(namedValues, "Budget Range"),
      timeline:     getField(namedValues, "Timeline"),
      timestamp:    new Date().toISOString(),
    };

    const options = {
      method:      "post",
      contentType: "application/json",
      payload:     JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);

    Logger.log("Webhook response: " + response.getResponseCode());
    Logger.log("Response body: " + response.getContentText());

  } catch (error) {
    Logger.log("Error dispatching webhook: " + error.toString());
    // Optional: send an alert email on failure
    // MailApp.sendEmail("your@email.com", "LeadOps Webhook Error", error.toString());
  }
}

/**
 * Safely extract a single value from namedValues.
 * namedValues[key] is an array — take first element, trim whitespace.
 */
function getField(namedValues, key) {
  const val = namedValues[key];
  if (!val || val.length === 0) return "";
  return val[0].toString().trim();
}
