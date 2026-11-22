import { useState } from 'react'
import { api, label } from '../lib'

const EMPTY = { type: 'NEW_CONNECTION', citizenName: '', nic: '', phone: '', address: '', description: '' }

function Field({ name, full, children }) {
  return (
    <label className={'fld' + (full ? ' full' : '')}>
      <span>{name}</span>
      {children}
    </label>
  )
}

function NewRequest({ onCreated, onOpen }) {
  const [f, setF] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setDone(null)
    try {
      const r = await api('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })
      setDone(r)
      setF(EMPTY)
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cols2">
      <section className="card">
        <h2>Request details</h2>
        <form className="form" onSubmit={submit}>
          <Field name="Request type" full>
            <select value={f.type} onChange={set('type')}>
              <option value="NEW_CONNECTION">New electricity connection</option>
            </select>
          </Field>
          <Field name="Full name" full>
            <input value={f.citizenName} onChange={set('citizenName')} required />
          </Field>
          <Field name="NIC number">
            <input value={f.nic} onChange={set('nic')} required />
          </Field>
          <Field name="Phone number">
            <input value={f.phone} onChange={set('phone')} inputMode="tel" required />
          </Field>
          <Field name="Address" full>
            <input value={f.address} onChange={set('address')} required />
          </Field>
          <Field name="Description" full>
            <textarea rows="4" value={f.description} onChange={set('description')} />
          </Field>
          <div className="full">
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit request'}</button>
          </div>
        </form>
        {error && <div className="msg err">{error}</div>}
        {done && (
          <div className="msg ok">
            Request submitted. Your request number is <strong>{done.id}</strong>. Current status: <strong>{label(done.status)}</strong>.{' '}
            <button className="btn ghost small" onClick={() => onOpen(done.id)}>Track this request</button>
          </div>
        )}
      </section>

      <aside className="card">
        <h2>What happens next</h2>
        <ol className="steps">
          <li><b>Received</b>Your request is saved and gets a request number.</li>
          <li><b>Verified</b>The NIC, phone number and address are checked.</li>
          <li><b>Approved or rejected</b>Valid requests are approved. Invalid ones are rejected with a reason.</li>
        </ol>
      </aside>
    </div>
  )
}

export default NewRequest
