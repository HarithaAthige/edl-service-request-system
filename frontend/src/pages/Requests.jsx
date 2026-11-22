import { useState } from 'react'
import { STATUSES, label, fmt, typeName } from '../lib'
import Badge from '../Badge'

function Requests({ requests, error, loading, onRefresh, onOpen }) {
  const [filter, setFilter] = useState('ALL')
  const rows = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter)

  return (
    <section className="card">
      <div className="bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{label(s)}</option>
          ))}
        </select>
        <button className="btn ghost" onClick={onRefresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        <span className="muted">{rows.length} shown</span>
      </div>

      {error && <div className="msg err">{error}</div>}

      <div className="wrap">
        <table className="tbl">
          <thead>
            <tr><th>No.</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} tabIndex={0} onClick={() => onOpen(r.id)} onKeyDown={(e) => e.key === 'Enter' && onOpen(r.id)}>
                <td>{r.id}</td>
                <td>{r.citizenName}</td>
                <td>{typeName(r.type)}</td>
                <td><Badge status={r.status} /></td>
                <td>{fmt(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!error && !loading && rows.length === 0 && (
        <p className="empty">{requests.length ? 'No requests with this status.' : 'No requests yet. Use New request to submit one.'}</p>
      )}
      <p className="muted hint">Select a row to see its history.</p>
    </section>
  )
}

export default Requests
