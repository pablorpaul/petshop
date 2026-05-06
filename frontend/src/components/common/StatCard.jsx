export default function StatCard({ title, value, icon, trend }) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <p className="stat-card__title">{title}</p>
        <strong className="stat-card__value">{value}</strong>
        {trend ? <span className="stat-card__trend">{trend}</span> : null}
      </div>
    </article>
  );
}
