import React, { useRef, useState } from 'react';
import './ProfilePhotoUploader.css';
import uploadIcon from '../../assets/icons/image-upload-icon.svg';
import defaultAvatar from '../../assets/images/profile-avatar.png';
import { useFeedback } from '../feedback/feedbackContext';

/**
 * disabledReason verildiğinde "Kaydet" devre dışı kalır ve sebep gösterilir.
 * Avatar için gerçek bir yükleme ucu yok (User.Avatar MaxLength(500), base64 sığmaz),
 * bu yüzden buton çalışıyormuş gibi görünmemeli.
 */
const ProfilePhotoUploader = ({ initialSrc = defaultAvatar, onSave, disabledReason = '' }) => {
  const { notify } = useFeedback();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(initialSrc);
  const [file, setFile] = useState(null);

  const handlePick = () => fileRef.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Simple size guard 2MB
    if (f.size > 2 * 1024 * 1024) {
      notify('En fazla 2MB dosya yükleyebilirsiniz.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
    setFile(f);
  };

  const handleSave = () => {
    if (onSave) onSave(file, preview);
  };

  return (
    <div className="pp-card">
      <div className="pp-avatar-wrap">
        <img src={preview} alt="Profil" className="pp-avatar" />
      </div>
      <div className="pp-actions">
        <button type="button" className="pp-upload-btn" onClick={handlePick}>
          <img src={uploadIcon} alt="Yükle" />
          <span>Fotoğraf Yükle</span>
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!file || Boolean(disabledReason)}
          title={disabledReason || undefined}
        >
          Kaydet
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/png, image/jpeg" onChange={handleChange} hidden />
      <p className="pp-hint">PNG veya JPG, en fazla 2MB. Kare görsel önerilir.</p>
      {disabledReason && <p className="pp-hint pp-hint-warning">{disabledReason}</p>}
    </div>
  );
};

export default ProfilePhotoUploader;
