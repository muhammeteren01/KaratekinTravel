import React, { useEffect, useMemo, useState } from 'react';
import './DeleteTour.css';
import { ApiError, deleteTripApi, fetchMeApi, loginApi } from '../services/adminApi';

const readSelectedTour = () => {
  try {
    const raw = localStorage.getItem('selectedTour');
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('selectedTour okunamadı:', error);
  }
  return null;
};

const DeleteTour = ({ isSidebarCollapsed }) => {
  const selectedTour = useMemo(readSelectedTour, []);
  const tripId = selectedTour?.raw?.id || selectedTour?.id || null;

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let alive = true;

    fetchMeApi()
      .then((me) => {
        if (alive) setEmail(me?.email || '');
      })
      .catch(() => {
        if (alive) setEmail('');
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!password || !tripId) return;

    const confirmed = window.confirm('Bu işlem geri alınamaz. Turu silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    setSubmitting(true);
    setError('');

    try {
      // Şifreyi gerçekten doğrula: aynı hesapla yeniden kimlik doğrulaması yap.
      // Bu çağrı mevcut oturum token'ını değiştirmez, sadece şifreyi kontrol eder.
      // NOT: Bu istemci tarafı bir kontrol; devtools ile atlanabilir. Kalıcı çözüm için
      // DELETE /api/trips/{id} ucunun şifre/step-up doğrulaması istemesi gerekir.
      if (!email) {
        setError('Oturum bilgisi alınamadı. Sayfayı yenileyip tekrar deneyin.');
        return;
      }

      try {
        await loginApi(email, password);
      } catch (authError) {
        if (authError instanceof ApiError && (authError.status === 400 || authError.status === 401)) {
          setError('Şifre hatalı. Tur silinmedi.');
          return;
        }
        throw authError;
      }

      await deleteTripApi(tripId);

      try {
        localStorage.removeItem('selectedTour');
      } catch (storageError) {
        console.warn('selectedTour temizlenemedi:', storageError);
      }

      window.location.hash = encodeURIComponent('Tur Yönetim');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tur silinemedi.');
    } finally {
      setSubmitting(false);
      setPassword('');
    }
  };

  if (!tripId) {
    return (
      <div className={`del-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="del-wrap">
          <div className="del-empty">
            Silinecek tur seçilmemiş. Lütfen Tur Yönetim ekranından bir tur seçin.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`del-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="del-wrap">
        <h2 className="del-title">“{selectedTour.name || 'Tur'}” Silme İşlemi</h2>

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
              <label className="del-label" htmlFor="del-password">Admin Şifrenizi Tuşlayın</label>
              <input
                id="del-password"
                type="password"
                className="del-input"
                placeholder="************"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <div className="del-error">{error}</div>}

              <button
                className="del-btn"
                disabled={!password || submitting}
                onClick={handleDelete}
              >
                {submitting ? 'Siliniyor...' : 'Turu Sil'}
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
