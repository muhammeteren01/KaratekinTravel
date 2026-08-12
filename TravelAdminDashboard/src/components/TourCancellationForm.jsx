import React, { useEffect, useState } from 'react';
import './TourCancellationForm.css';
import { deleteTripApi, fetchManagedTripsApi } from '../services/adminApi';

const TourCancellationForm = ({ onCancel }) => {
  const [selectedTour, setSelectedTour] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [activeTours, setActiveTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    fetchManagedTripsApi()
      .then((response) => {
        if (!alive) return;
        const normalized = (Array.isArray(response) ? response : []).map((trip) => ({
          id: String(trip.id).slice(0, 8).toUpperCase(),
          rawId: trip.id,
          name: trip.title || 'Tur',
        }));
        setActiveTours(normalized);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Turlar yüklenemedi.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // İptal nedenleri
  const cancellationReasons = [
    'Olumsuz Hava Koşulları',
    'Yetersiz Katılımcı',
    'Araç Arızası',
    'Rehber Hastalığı',
    'Güvenlik Nedeni',
    'Diğer'
  ];

  const handleTourSelect = (tour) => {
    setSelectedTour(`${tour.id} / ${tour.name}`);
    setSelectedTourId(tour.rawId);
    setShowTourDropdown(false);
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    setShowReasonDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedTourId || !selectedReason || !notificationMessage.trim()) {
      alert('Lütfen tüm alanları doldurunuz.');
      return;
    }

    const confirmed = window.confirm('Seçili tur silinecek. Devam etmek istiyor musunuz?');
    if (!confirmed) return;

    const cancellationData = {
      tour: selectedTour,
      reason: selectedReason,
      message: notificationMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      setError('');
      await deleteTripApi(selectedTourId);
      setActiveTours((prev) => prev.filter((trip) => trip.rawId !== selectedTourId));
      onCancel?.(cancellationData);
      setSelectedTour('');
      setSelectedTourId('');
      setSelectedReason('');
      setNotificationMessage('');
      alert('Tur iptal işlemi başarıyla tamamlandı.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tur iptal edilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tour-cancellation-form">
      {error && <div className="table-error">{error}</div>}
      {loading && <div style={{ marginBottom: 12, color: '#718EBF' }}>Aktif turlar yükleniyor...</div>}
      {/* Tur Seçimi */}
      <div className="form-section">
        <div className="form-field">
          <div className="field-header">
            <div className="field-label-container">
              <label className="field-label">Tur Seçiniz</label>
              <div className="help-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#98A2B3" strokeWidth="1.33"/>
                  <path d="M8 7.33333V11.3333M8 4.66667H8.00667" stroke="#98A2B3" strokeWidth="1.33" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <p className="field-description">
              Aktif turlardan, İptal Etmek istediğiniz turu seçin.
            </p>
          </div>
          
          <div className="dropdown-container">
            <div 
              className="dropdown-trigger"
              onClick={() => setShowTourDropdown(!showTourDropdown)}
            >
              <span className={`dropdown-text ${!selectedTour ? 'placeholder' : ''}`}>
                {selectedTour || 'Tur Seçiniz'}
              </span>
              <div className="dropdown-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#2A2F3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {showTourDropdown && (
              <div className="dropdown-list">
                {activeTours.map((tour) => (
                  <div
                    key={tour.id}
                    className={`dropdown-item ${selectedTour === `${tour.id} / ${tour.name}` ? 'selected' : ''}`}
                    onClick={() => handleTourSelect(tour)}
                  >
                    <span>{tour.id} / {tour.name}</span>
                    {selectedTour === `${tour.id} / ${tour.name}` && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4.5L6 12l-3.5-3.5" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* İptal Nedeni */}
      <div className="form-section">
        <div className="form-field">
          <div className="field-header">
            <div className="field-label-container">
              <label className="field-label">İptal Nedeni</label>
              <div className="help-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#98A2B3" strokeWidth="1.33"/>
                  <path d="M8 7.33333V11.3333M8 4.66667H8.00667" stroke="#98A2B3" strokeWidth="1.33" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <p className="field-description">
              İptal etmek istediğiniz turun nedenini belirtiniz
            </p>
          </div>
          
          <div className="dropdown-container">
            <div 
              className="dropdown-trigger"
              onClick={() => setShowReasonDropdown(!showReasonDropdown)}
            >
              <span className={`dropdown-text ${!selectedReason ? 'placeholder' : ''}`}>
                {selectedReason || 'Neden Seçiniz'}
              </span>
              <div className="dropdown-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#2A2F3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {showReasonDropdown && (
              <div className="dropdown-list">
                {cancellationReasons.map((reason) => (
                  <div
                    key={reason}
                    className={`dropdown-item ${selectedReason === reason ? 'selected' : ''}`}
                    onClick={() => handleReasonSelect(reason)}
                  >
                    <span>{reason}</span>
                    {selectedReason === reason && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4.5L6 12l-3.5-3.5" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bildirim Mesajı */}
      <div className="form-section">
        <div className="form-field">
          <label className="field-label">Katılımcılara Bildirim Mesajı</label>
          <textarea
            className="message-textarea"
            placeholder="Katılımcılara tur iptali hakkında bildirim mesajı yazınız."
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* İptal Butonu */}
      <div className="form-actions">
        <button 
          className="cancel-button"
          onClick={handleSubmit}
          disabled={submitting || loading}
        >
          {submitting ? 'İşlem yapılıyor...' : 'İptal İşlemini Tamamla'}
        </button>
      </div>
    </div>
  );
};

export default TourCancellationForm; 