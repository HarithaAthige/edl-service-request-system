import { label } from './lib'

export default function Badge({ status }) {
  return (
    <span className="badge" style={{ '--c': 'var(--st-' + status + ')' }}>
      {label(status)}
    </span>
  )
}
