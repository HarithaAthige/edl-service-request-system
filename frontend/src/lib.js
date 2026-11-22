const MSG = {
  401: 'Not authorised (401). The WSO2 token may have expired.',
  429: 'Too many requests (429). Please wait a minute and try again.',
  404: 'No request found with that number.',
}

export async function api(url, opts) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(MSG[res.status] || 'The server returned an error (' + res.status + ').')
  return res.json()
}

export async function fetchTrack(n) {
  const [request, history] = await Promise.all([
    api('/api/requests/' + n),
    api('/api/requests/' + n + '/history'),
  ])
  return { request, history }
}

export const STATUSES = ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'APPROVED', 'REJECTED']
export const label = (s) => String(s).charAt(0) + String(s).slice(1).toLowerCase().replace(/_/g, ' ')
export const TYPES = { NEW_CONNECTION: 'New electricity connection' }
export const typeName = (t) => TYPES[t] || label(t)
export const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
