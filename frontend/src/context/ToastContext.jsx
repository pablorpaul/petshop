﻿import { createContext, useCallback, useMemo, useState } from 'react';

export const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message, tone = 'info') => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const success = useCallback((message) => pushToast(message, 'success'), [pushToast]);
  const error = useCallback((message) => pushToast(message, 'error'), [pushToast]);
  const info = useCallback((message) => pushToast(message, 'info'), [pushToast]);

  const value = useMemo(
    () => ({
      success,
      error,
      info,
      removeToast,
      toasts,
    }),
    [error, info, removeToast, success, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
