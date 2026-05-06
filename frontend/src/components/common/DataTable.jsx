export default function DataTable({ columns, items, actions, emptyState }) {
  if (!items.length) {
    return emptyState;
  }

  return (
    <div className="data-view">
      <div className="table-wrapper desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {actions ? <th>Acoes</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(item) : item[column.key]}</td>
                ))}
                {actions ? <td><div className="table-actions">{actions(item)}</div></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-only cards-list">
        {items.map((item) => (
          <article key={item.id} className="mobile-card">
            <div className="mobile-card__content">
              {columns.map((column) => (
                <div key={column.key} className="mobile-card__row">
                  <span>{column.label}</span>
                  <strong>{column.render ? column.render(item) : item[column.key]}</strong>
                </div>
              ))}
            </div>
            {actions ? <div className="table-actions">{actions(item)}</div> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
