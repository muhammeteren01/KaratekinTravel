import React, { useEffect, useRef, useState } from 'react';
import './ReportModal.css';

// context: 'general' | 'chat'
const ReportModal = ({ open, onClose, onSubmit, review, context = 'general', chatName, submitting = false }) => {
  const [category, setCategory] = useState('wrong_info');
  const [otherCategory, setOtherCategory] = useState('');
  const [details, setDetails] = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setCategory('wrong_info');
      setOtherCategory('');
      setDetails('');
    }
  }, [open, review]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  const disabled = category === 'other' ? otherCategory.trim().length === 0 || details.trim().length === 0 : details.trim().length === 0;

  const submit = () => {
    const payload = {
      reviewId: review?.id,
      tour: review?.tour,
      category: category === 'other' ? otherCategory.trim() : category,
      details: details.trim(),
      createdAt: new Date().toISOString(),
    };
    onSubmit?.(payload);
  };

  const nameInitial = (chatName || '?').charAt(0).toUpperCase();
  const isChat = context === 'chat';

  return (
    <div className="rm-overlay" ref={overlayRef} role="dialog" aria-modal="true" aria-labelledby="rm-title" onClick={handleOverlayClick}>
      <div className="rm-modal" onClick={(e)=>e.stopPropagation()}>
        <div className="rm-header">
          <div className="rm-head-left">
            {isChat && (
              <div className="rm-avatar" aria-hidden>{nameInitial}</div>
            )}
            <h3 id="rm-title">
              {isChat && chatName ? <><span className="rm-name">“{chatName}”</span> Sohbeti İçin Şikayetinizi Bildiriniz</> : 'Şikayetinizi Bildiriniz'}
            </h3>
          </div>
          <button className="rm-close" onClick={onClose} aria-label="Kapat">
            <img src="/icons/close-icon.svg" alt="Kapat" />
          </button>
        </div>
        <p className="rm-desc">Lütfen şikayet sebebinizi aşağıdaki kategorilerden belirtiniz. Şikayet sebebiniz kategorilerde bulunmuyorsa “Diğer” seçeneği ile kategori belirleyiniz.</p>

        <div className="rm-grid">
          <label className="rm-radio">
            <input type="radio" name="rm-cat" value="wrong_info" checked={category==='wrong_info'} onChange={()=>setCategory('wrong_info')} />
            <span className="rm-control" />
            <span className="rm-text">Firmamız Hakkında Yanlış Bilgi</span>
          </label>

          <label className="rm-radio">
            <input type="radio" name="rm-cat" value="abuse" checked={category==='abuse'} onChange={()=>setCategory('abuse')} />
            <span className="rm-control" />
            <span className="rm-text">Küfür/Hakaret İçeren Cümle</span>
          </label>
        </div>

        <div className="rm-grid rm-grid-other">
          <label className="rm-radio">
            <input type="radio" name="rm-cat" value="other" checked={category==='other'} onChange={()=>setCategory('other')} />
            <span className="rm-control" />
            <span className="rm-text">Diğer</span>
          </label>

          <input 
            type="text" 
            className="rm-input" 
            placeholder="Şikayet Kategorisi Tuşlayınız..." 
            disabled={category!=='other'}
            value={otherCategory}
            onChange={(e)=>setOtherCategory(e.target.value)}
          />
        </div>

        <div className="rm-label">Şikayetinizi detaylı bir şekilde açıklayınız.</div>
        <textarea 
          className="rm-textarea" 
          rows={6} 
          placeholder="Şikayetiniz..."
          value={details}
          onChange={(e)=>setDetails(e.target.value)}
        />

        <div className="rm-actions">
          <button className="rm-submit" disabled={disabled || submitting} onClick={submit}>
            {submitting ? 'Gönderiliyor...' : 'Şikayeti Bildir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
