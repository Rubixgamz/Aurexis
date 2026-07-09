const SHEET_NAME = "WaitinglistI ";

function doPost(event) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getActiveSheet();
  const data = getSubmissionData_(event);

  ensureHeaderRow_(sheet);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.fullName || "",
    data.email || "",
    data.joiningAs || "",
    data.country || "",
    data.reason || ""
  ]);

  return jsonResponse_({ ok: true });
}

function doGet() {
  return jsonResponse_({ ok: true, message: "Aurexis waitlist endpoint is live." });
}

function ensureHeaderRow_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Submitted At",
      "Full Name",
      "Email",
      "Joining As",
      "Country",
      "Reason"
    ]);
  }
}

function getSubmissionData_(event) {
  if (!event || !event.postData || !event.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(event.postData.contents);
  } catch (error) {
    return event.parameter || {};
  }
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
