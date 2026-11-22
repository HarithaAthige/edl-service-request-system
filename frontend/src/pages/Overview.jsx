import { STATUSES, label, fmt, typeName } from '../lib'
import Badge from '../Badge'

function Donut({ counts, total }) {
  const r = 42
  const C = 2 * Math.PI * r
  let off = 0
  return (
    <svg viewBox="0 0 120 120" className="donut" role="img" aria-label="Requests by status">
      <circle cx="60" cy="60" r={r} className="donut-bg" />
      {STATUSES.map((s) => {
        const len = total ? (counts[s] / total) * C : 0
        const el =
          len > 0 ? (
            <circle key={s} cx="60" cy="60" r={r} fill="none" strokeWidth="14" style={{ stroke: 'var(--st-' + s + ')' }} strokeDasharray={len + ' ' + (C - len)} strokeDashoffset={-off} transform="rotate(-90 60 60)" />
          ) : null
        off += len
        return el
      })}
      <text x="60" y="60" textAnchor="middle" className="donut-n">{total}</text>
      <text x="60" y="75" textAnchor="middle" className="donut-l">requests</text>
    </svg>
  )
}

function Overview({ requests, error, loading, onRefresh, onOpen }) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, requests.filter((r) => r.status === s).length]))
  const total = requests.length
  const active = counts.SUBMITTED + counts.UNDER_VERIFICATION + counts.VERIFIED
  const stats = [
    ['Total requests', total, 'var(--accent)'],
    ['In progress', active, 'var(--st-VERIFIED)'],
    ['Approved', counts.APPROVED, 'var(--st-APPROVED)'],
    ['Rejected', counts.REJECTED, 'var(--st-REJECTED)'],
  ]

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: d.toDateString(), name: d.toLocaleDateString([], { weekday: 'short' }), n: 0 }
  })
  requests.forEach((r) => {
    const d = days.find((x) => x.key === new Date(r.createdAt).toDateString())
    if (d) d.n++
  })
  const max = Math.max(1, ...days.map((d) => d.n))

  return (
    <>
      {error && (
        <div className="msg err">
          {error}{' '}
          <button className="btn ghost small" onClick={onRefresh} disabled={loading}>Try again</button>
        </div>
      )}

      <div className="stats">
        {stats.map(([name, n, c]) => (
          <div className="stat" key={name} style={{ '--c': c }}>
            <b>{n}</b>
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="cols">
        <section className="card">
          <h2>Requests by status</h2>
          {total === 0 ? (
            <p className="empty">No requests yet. Submit one from New request.</p>
          ) : (
            <div className="donut-row">
              <Donut counts={counts} total={total} />
              <ul className="legend">
                {STATUSES.map((s) => (
                  <li key={s}>
                    <i style={{ background: 'var(--st-' + s + ')' }} />
                    {label(s)}
                    <b>{counts[s]}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Requests received, last 7 days</h2>
          <svg viewBox="0 0 280 150" className="bars" role="img" aria-label="Requests per day">
            <line x1="0" y1="120" x2="280" y2="120" className="axis" />
            {days.map((d, i) => {
              const h = (d.n / max) * 90
              return (
                <g key={d.key}>
                  <rect x={12 + i * 38} y={120 - h} width="26" height={h} rx="4" className="bar-rect" />
                  {d.n > 0 && <text x={25 + i * 38} y={114 - h} textAnchor="middle" className="bar-n">{d.n}</text>}
                  <text x={25 + i * 38} y="138" textAnchor="middle" className="bar-l">{d.name}</text>
                </g>
              )
            })}
          </svg>
        </section>
      </div>

      <section className="card">
        <h2>Latest requests</h2>
        {requests.length === 0 ? (
          <p className="empty">Nothing to show yet.</p>
        ) : (
          <ul className="recent">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id}>
                <button onClick={() => onOpen(r.id)}>
                  <span className="rid">#{r.id}</span>
                  <span className="rname">{r.citizenName}<small>{typeName(r.type)}</small></span>
                  <Badge status={r.status} />
                  <span className="rtime">{fmt(r.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default Overview
