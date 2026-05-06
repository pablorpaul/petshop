export default function FormModal({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
