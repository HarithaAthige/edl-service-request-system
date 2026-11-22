import { useCallback, useEffect, useState } from 'react'
import './styles.css'
import { api } from './lib'
import Overview from './pages/Overview'
import NewRequest from './pages/NewRequest'
import TrackPage from './pages/TrackPage'
import Requests from './pages/Requests'

const ICONS = {
  overview: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  new: 'M12 5v14M5 12h14',
  track: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
}

const TABS = [
  ['overview', 'Overview', 'How requests are moving through the system'],
  ['new', 'New request', 'Apply for a service'],
  ['track', 'Track a request', 'Look up a request and see its history'],
  ['list', 'All requests', 'Every request, newest first'],
]

function App() {
  const [tab, setTab] = useState('overview')
  const [trackId, setTrackId] = useState('')
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(
    () =>
      api('/api/requests')
        .then((d) => {
          setRequests(Array.isArray(d) ? [...d].sort((a, b) => b.id - a.id) : [])
          setError('')
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const refresh = () => {
    setLoading(true)
    fetchAll()
  }
  const open = (id) => {
    setTrackId(String(id))
    setTab('track')
  }

  const [, title, sub] = TABS.find((t) => t[0] === tab)
  const state = loading ? 'Checking' : error ? 'Problem' : 'Online'
  const stateText = { Checking: 'Checking gateway', Problem: 'Needs attention', Online: 'Gateway online' }[state]
  const shared = { requests, error, loading, onRefresh: refresh, onOpen: open }

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <img src="/logo.png" alt="" />
          <div>
            <b>ServFlow</b>
            <span>Service Request System</span>
          </div>
        </div>
        <nav className="navs" aria-label="Main">
          {TABS.map(([id, name]) => (
            <button
              key={id}
              className={'nav' + (tab === id ? ' on' : '')}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[id]} />
              </svg>
              {name}
            </button>
          ))}
        </nav>
        <div className="side-foot">Kafka + WSO2 API Manager</div>
      </aside>

      <main className="main">
        <header className="top">
          <div>
            <h1>{title}</h1>
            <p>{sub}</p>
          </div>
          <span className={'chip ' + state}>{stateText}</span>
        </header>
        {tab === 'overview' && <Overview {...shared} />}
        {tab === 'new' && <NewRequest onCreated={refresh} onOpen={open} />}
        {tab === 'track' && <TrackPage key={trackId} initialId={trackId} />}
        {tab === 'list' && <Requests {...shared} />}
      </main>
    </div>
  )
}

export default App
