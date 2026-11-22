import { useState, useEffect } from 'react'

const STATUSES = ['ALL', 'SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'APPROVED', 'REJECTED']

function Dashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/requests')
      if (res.status === 401) {
        throw new Error('Not authorised (401). The WSO2 token may have expired.')
      }
      if (res.status === 429) {
        throw new Error('Too many requests (429). Please wait a minute and try again.')
      }
      if (!res.ok) {
        throw new Error('The server returned an error (' + res.status + ').')
      }
      setRows(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const shown = rows
    .filter((r) => filter === 'ALL' || r.status === filter)
    .sort((a, b) => b.id - a.id)

  return (
    <div className="sr-card sr-track">
      <h2>Officer dashboard</h2>
      <div className="sr-row">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All statuses' : s}
            </option>
          ))}
        </select>
        <button className="sr-btn sr-btn-inline" type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="sr-msg sr-error">{error}</div>}

      {!error && !loading && shown.length === 0 && (
        <p className="sr-sub">No requests to show.</p>
      )}

      {shown.length > 0 && (
        <div className="sr-tablewrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.citizenName}</td>
                  <td>{r.type}</td>
                  <td>
                    <span className="sr-badge">{r.status}</span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard

