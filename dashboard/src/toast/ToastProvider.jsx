import { createContext, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

function normalizeToast(input, tone) {
  if (typeof input === 'string') {
    return {
      title: input,
      tone
    };
  }

  return {
    duration: 3600,
    tone,
    ...input
  };
}

function buildToastId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(() => {
    return () => {
      for (const timeoutId of timersRef.current.values()) {
        window.clearTimeout(timeoutId);
      }

      timersRef.current.clear();
    };
  }, []);

  function dismissToast(id) {
    const timeoutId = timersRef.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(input, tone = 'neutral') {
    const toast = {
      id: buildToastId(),
      duration: 3600,
      ...normalizeToast(input, tone)
    };

    setToasts((current) => [...current, toast].slice(-4));

    if (typeof window !== 'undefined') {
      const timeoutId = window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration);

      timersRef.current.set(toast.id, timeoutId);
    }

    return toast.id;
  }

  return (
    <ToastContext.Provider
      value={{
        dismissToast,
        error: (input) => pushToast(input, 'danger'),
        info: (input) => pushToast(input, 'neutral'),
        showToast: pushToast,
        success: (input) => pushToast(input, 'success')
      }}
    >
      {children}

      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.tone}`} key={toast.id} role="status">
            <div className="toast-copy">
              <strong>{toast.title}</strong>
              {toast.description ? <p>{toast.description}</p> : null}
            </div>

            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 5L15 15" />
                <path d="M15 5L5 15" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }

  return context;
}
