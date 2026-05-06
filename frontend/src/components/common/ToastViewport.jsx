import { useToast } from '../../hooks/useToast';

export default function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast--${toast.tone}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
