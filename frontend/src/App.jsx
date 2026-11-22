import { useState } from 'react'
import './form.css'
import Track from './Track.jsx'

const EMPTY = {
  type: 'NEW_CONNECTION',
  citizenName: '',
  nic: '',
  phone: '',
  address: '',
  description: '',
}

function App() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCreated(null)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.status === 401) {
        throw new Error('Not authorised (401). The WSO2 token may have expired.')
      }
      if (res.status === 429) {
        throw new Error('Too many requests (429). Please wait a minute and try again.')
      }
      if (!res.ok) {
        throw new Error('The server returned an error (' + res.status + ').')
      }
      const data = await res.json()
      setCreated(data)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="sr-page">
      <div className="sr-card">
        <h1>Apply for a service</h1>
        <p className="sr-sub">Submit a new service request.</p>

        <form onSubmit={submit}>
          <div className="sr-field">
            <label htmlFor="type">Request type</label>
            <select id="type" name="type" value={form.type} onChange={update}>
              <option value="NEW_CONNECTION">New electricity connection</option>
            </select>
          </div>

          <div className="sr-field">
            <label htmlFor="citizenName">Full name</label>
            <input id="citizenName" name="citizenName" value={form.citizenName} onChange={update} required />
          </div>

          <div className="sr-field">
            <label htmlFor="nic">NIC number</label>
            <input id="nic" name="nic" value={form.nic} onChange={update} required />
          </div>

          <div className="sr-field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" value={form.phone} onChange={update} required />
          </div>

          <div className="sr-field">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={form.address} onChange={update} required />
          </div>

          <div className="sr-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="3" value={form.description} onChange={update} />
          </div>

          <button className="sr-btn" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit request'}
          </button>
        </form>

        {error && <div className="sr-msg sr-error">{error}</div>}

        {created && (
          <div className="sr-msg sr-ok">
            Request submitted. Your request number is <strong>{created.id}</strong>.
            Current status: <strong>{created.status}</strong>.
          </div>
        )}
      </div>
      <Track />
    </main>
  )
}

export default App

