import React, { useEffect, useRef, useState } from 'react';
import './ProfilePhotoUploader.css';
import uploadIcon from '../../assets/icons/image-upload-icon.svg';
import defaultAvatar from '../../assets/images/profile-avatar.png';
import { useFeedback } from '../feedback/feedbackContext';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

/**
 * Profil fotoğrafı yükleme.
 *
 * Yükleme daha önce devre dışıydı: User.Avatar kolonu MaxLength(500) idi ve
 * base64 veri URL'i sığmıyordu. Kolon text'e genişletildikten sonra
 * (20260813140000_ExpandUserAvatarToText) fotoğraf gerçekten kaydediliyor.
 */
const ProfilePhotoUploader = ({ initialSrc, onSave, saving = false }) => {
  const { notify } = useFeedback();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(initialSrc || defaultAvatar);
  const [dataUrl, setDataUrl] = useState(null);

  // Profil sonradan yüklendiğinde önizleme de güncellensin; kullanıcının
  // seçtiği yeni fotoğraf varsa ona dokunulmuyor.
  useEffect(() => {
    if (!dataUrl) setPreview(initialSrc || defaultAvatar);
  }, [initialSrc, dataUrl]);

  const handlePick = () => fileRef.current?.click();

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    // Girdi hemen sıfırlanıyor; aksi halde aynı dosya ikinci kez seçilemiyor.
    event.target.value = '';
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
      notify('Yalnızca PNG veya JPG yükleyebilirsiniz.', 'warning');
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      notify('En fazla 2MB dosya yükleyebilirsiniz.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setDataUrl(reader.result);
    };
    reader.onerror = () => notify('Görsel okunamadı.', 'error');
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!dataUrl) return;
    await onSave?.(dataUrl);
    setDataUrl(null);
  };

  const handleReset = () => {
    setDataUrl(null);
    setPreview(initialSrc || defaultAvatar);
  };

  return (
    <div className="pp-card">
      <div className="pp-avatar-wrap">
        <img src={preview} alt="Profil fotoğrafı" className="pp-avatar" />
      </div>
      <div className="pp-actions">
        <button type="button" className="pp-upload-btn" onClick={handlePick}>
          <img src={uploadIcon} alt="" />
          <span>Fotoğraf Yükle</span>
        </button>
        {dataUrl && (
          <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={saving}>
            Geri Al
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!dataUrl || saving}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleChange}
        hidden
      />
      <p className="pp-hint">PNG veya JPG, en fazla 2MB. Kare görsel önerilir.</p>
    </div>
  );
};

export default ProfilePhotoUploader;
