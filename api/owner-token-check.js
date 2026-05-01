import { handleOptions, jsonResponse, setCors, verifyOwnerToken } from './_shared.js'

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (!['GET', 'POST'].includes(req.method)) {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  if (!verifyOwnerToken(req)) {
    jsonResponse(res, 401, { ok: false, valid: false, error: 'Owner action token is missing or invalid' })
    return
  }

  jsonResponse(res, 200, { ok: true, valid: true })
}
