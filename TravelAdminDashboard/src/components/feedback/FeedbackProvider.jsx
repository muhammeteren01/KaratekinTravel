import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackContext } from './feedbackContext';
import './Feedback.css';

/**
 * Panel geri bildirimi tek yerden: bildirimler ve onay diyaloğu.
 *
 * Önceden 44 yerde window.alert, 12 yerde window.confirm kullanılıyordu.
 * Tarayıcı diyalogları sayfayı kilitliyor, panelin görünümüyle hiç
 * uyuşmuyor ve mesaj uzunsa okunaksız hale geliyordu.
 *
 * notify(mesaj, tip)  → sağ üstte kendiliğinden kapanan bildirim
 * confirm({...})      → Promise<boolean> döndüren onay diyaloğu
 */

const TOAST_DURATION = 4500;

const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const idRef = useRef(0);
  const confirmButtonRef = useRef(null);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message, type = 'info') => {
    if (!message) return;
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, message: String(message), type }]);
    setTimeout(() => dismiss(id), TOAST_DURATION);
  }, [dismiss]);

  /**
   * @returns {Promise<boolean>} kullanıcı onayladıysa true
   */
  const confirm = useCallback((options) => {
    const config = typeof options === 'string' ? { message: options } : (options || {});
    return new Promise((resolve) => {
      setDialog({
        title: config.title || 'Emin misiniz?',
        message: config.message || '',
        confirmLabel: config.confirmLabel || 'Evet, devam et',
        cancelLabel: config.cancelLabel || 'Vazgeç',
        danger: Boolean(config.danger),
        resolve,
      });
    });
  }, []);

  const closeDialog = useCallback((result) => {
    setDialog((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  // Diyalog açıkken Escape kapatsın ve odak onay düğmesine gitsin.
  useEffect(() => {
    if (!dialog) return undefined;

    confirmButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeDialog(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dialog, closeDialog]);

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fb-toasts" role="region" aria-live="polite" aria-label="Bildirimler">
        {toasts.map((toast) => (
          <div key={toast.id} className={`fb-toast fb-toast--${toast.type}`}>
            <span className="fb-toast-message">{toast.message}</span>
            <button
              type="button"
              className="fb-toast-close"
              onClick={() => dismiss(toast.id)}
              aria-label="Bildirimi kapat"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {dialog && (
        <div className="fb-dialog-backdrop" onClick={() => closeDialog(false)}>
          <div
            className="fb-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="fb-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="fb-dialog-title" id="fb-dialog-title">{dialog.title}</h2>
            {dialog.message && <p className="fb-dialog-message">{dialog.message}</p>}
            <div className="fb-dialog-actions">
              <button type="button" className="fb-btn fb-btn-secondary" onClick={() => closeDialog(false)}>
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                ref={confirmButtonRef}
                className={`fb-btn ${dialog.danger ? 'fb-btn-danger' : 'fb-btn-primary'}`}
                onClick={() => closeDialog(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;
