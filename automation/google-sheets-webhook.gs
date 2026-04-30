const SHEET_NAME = 'QuantumAiBusiness Events'

function doPost(event) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('QAB_WEBHOOK_SECRET') || ''
  const suppliedSecret = event.parameter.secret || ''

  if (expectedSecret && suppliedSecret !== expectedSecret) {
    return jsonOutput({ ok: false, error: 'Invalid webhook secret' })
  }

  const lock = LockService.getScriptLock()
  lock.waitLock(10000)

  try {
    const payload = JSON.parse(event.postData.contents || '{}')
    const sheet = getEventSheet()
    sheet.appendRow([
      new Date(),
      payload.event_type || '',
      payload.action_mode || '',
      payload.source || '',
      payload.target || '',
      payload.contact_email || '',
      payload.package || '',
      payload.amount || '',
      payload.lead_score || '',
      payload.lead_route || '',
      shorten(JSON.stringify(payload.payload || payload, null, 2)),
    ])

    return jsonOutput({ ok: true })
  } catch (error) {
    return jsonOutput({ ok: false, error: error.message })
  } finally {
    lock.releaseLock()
  }
}

function getEventSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = spreadsheet.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'received_at',
      'event_type',
      'action_mode',
      'source',
      'target',
      'contact_email',
      'package',
      'amount',
      'lead_score',
      'lead_route',
      'payload_json',
    ])
    sheet.setFrozenRows(1)
  }

  return sheet
}

function shorten(value) {
  const text = String(value || '')
  return text.length > 45000 ? `${text.slice(0, 45000)}...TRUNCATED` : text
}

function jsonOutput(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON)
}
