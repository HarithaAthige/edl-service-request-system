import { useState } from 'react'

async function getJson(url) {
  const res = await fetch(url)
  if (res.status === 401) {
    throw new Error('Not authorised (401). The WSO2 token may have expired.')
  }
  if (res.status === 429) {
    throw new Error('Too many requests (429). Please wait a minute and try again.')
  }
  if (res.status === 404) {
    throw new Error('No request found with that number.')
  }
  if (!res.ok) {
    throw new Error('The server returned an error (' + res.status + ').')
  }
  return res.json()
}

function Track() {
  const [id, setId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [request, setRequest] = useState(null)
  const [history, setHistory] = useState([])

  async function lookup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRequest(null)
    setHistory([])
    try {
      const n = id.trim()
      const [r, h] = await Promise.all([
        getJson('/api/requests/' + n),
        getJson('/api/requests/' + n + '/history'),
      ])
      setRequest(r)
      setHistory(h)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sr-card sr-track">
      <h2>Track a request</h2>
      <form onSubmit={lookup} className="sr-row">
        <input
          type="number"
          min="1"
          placeholder="Request number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button className="sr-btn sr-btn-inline" type="submit" disabled={loading}>
          {loading ? 'Looking up...' : 'Track'}
        </button>
      </form>

      {error && <div className="sr-msg sr-error">{error}</div>}

      {request && (
        <div className="sr-summary">
          <p>
            Request <strong>{request.id}</strong> for {request.citizenName}
          </p>
          <p>
            Current status: <span className={'sr-badge sr-st-' + request.status}>{request.status}</span>
          </p>
          <ol className="sr-timeline">
            {history.map((h) => (
              <li key={h.id} className={'sr-tl-' + h.status}>
                <strong>{h.status}</strong>
                {h.reason ? ' - ' + h.reason : ''}
                <div className="sr-time">{new Date(h.changedAt).toLocaleString()}</div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default Track

