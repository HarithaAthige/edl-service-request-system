import { useEffect, useState } from 'react'
import { fetchTrack, label, fmt, typeName } from '../lib'
import Badge from '../Badge'

function TrackPage({ initialId }) {
  const [id, setId] = useState(initialId)
  const [state, setState] = useState({ loading: Boolean(initialId), error: '', data: null })

  useEffect(() => {
    if (!initialId) return
    let live = true
    fetchTrack(initialId)
      .then((data) => live && setState({ loading: false, error: '', data }))
      .catch((e) => live && setState({ loading: false, error: e.message, data: null }))
    return () => {
      live = false
    }
  }, [initialId])

  async function lookup(e) {
    e.preventDefault()
    setState({ loading: true, error: '', data: null })
    try {
      setState({ loading: false, error: '', data: await fetchTrack(id.trim()) })
    } catch (err) {
      setState({ loading: false, error: err.message, data: null })
    }
  }

  const { loading, error, data } = state

  return (
    <section className="card narrow">
      <form onSubmit={lookup} className="bar">
        <input type="number" min="1" placeholder="Request number" value={id} onChange={(e) => setId(e.target.value)} required />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Looking up...' : 'Track'}</button>
      </form>

      {error && <div className="msg err">{error}</div>}
      {!data && !error && !loading && <p className="empty">Enter a request number to see its status and history.</p>}

      {data && (
        <>
          <div className="summary">
            <div>
              <h2>Request #{data.request.id}</h2>
              <p className="muted">{data.request.citizenName} - {typeName(data.request.type)}</p>
            </div>
            <Badge status={data.request.status} />
          </div>
          <ol className="tl">
            {data.history.map((h) => (
              <li key={h.id} style={{ '--c': 'var(--st-' + h.status + ')' }}>
                <strong>{label(h.status)}</strong>
                {h.reason ? ' - ' + h.reason : ''}
                <div className="muted">{fmt(h.changedAt)}</div>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}

export default TrackPage
