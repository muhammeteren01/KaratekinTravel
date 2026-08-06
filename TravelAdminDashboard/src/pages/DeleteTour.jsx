import React, { useMemo, useState } from 'react';
import './DeleteTour.css';
import { deleteTripApi } from '../services/adminApi';

const DeleteTour = ({ isSidebarCollapsed }) => {
  const selectedTour = useMemo(() => {
    try {
      const raw = localStorage.getItem('selectedTour');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { name: 'Kastamonu Turu' };
  }, []);

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!password) return;
    const ok = window.confirm('Bu işlem geri alınamaz. Turu silmek istediğinize emin misiniz?');
    if (!ok) return;
    setSubmitting(true);
    try {
      const tripId = selectedTour?.raw?.id || selectedTour?.id;
      if (!tripId) {
        alert('Silinecek tur bulunamadı.');
        return;
      }

      await deleteTripApi(tripId);
      // Navigate back to Tour Management after delete
      window.location.hash = encodeURIComponent('Tur Yönetim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`del-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="del-wrap">
        <h2 className="del-title">“{selectedTour.name}” Silme İşlemi</h2>

        <div className="del-card">
          <div className="del-left">
            <div className="del-icon-circle">
              <img src="/icons/delete-icon.svg" alt="Sil" />
            </div>
          </div>
          <div className="del-right">
            <div className="del-warning-title">Dikkat: Bu işlemin geri dönüşü yoktur!</div>
            <ul className="del-list">
              <li>Turun alt tarih ve sefer bilgileri</li>
              <li>Tüm rezervasyonlar (kullanıcılar bilgilendirilecektir)</li>
              <li>İlgili kuponlar, promosyonlar ve medya dosyaları</li>
              <li>Geri alınamaz işlem</li>
            </ul>

            <div className="del-form">
              <label className="del-label">Admin Şifrenizi Tuşlayın</label>
              <input
                type="password"
                className="del-input"
                placeholder="************"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />

              <button
                className="del-btn"
                disabled={!password || submitting}
                onClick={handleDelete}
              >
                Turu Sil
                <img src="/icons/delete-icon.svg" alt="Sil" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTour;
