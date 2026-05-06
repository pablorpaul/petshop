import { getStatusLabel } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{getStatusLabel(status)}</span>;
}
