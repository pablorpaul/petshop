import Button from './Button';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal--sm" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="modal__footer">
          <Button variant="ghost" onClick={onCancel}> {cancelLabel} </Button>
          <Button variant={confirmVariant} loading={loading} onClick={onConfirm}> {confirmLabel} </Button>
        </div>
      </div>
    </div>
  );
}
