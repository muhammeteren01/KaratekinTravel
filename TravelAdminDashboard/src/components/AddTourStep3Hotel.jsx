import React, { useEffect, useRef, useState } from 'react';
import './AddTourStep3Hotel.css';
import ProgressSteps from './ProgressSteps';
import DateTimePicker from './DateTimePicker';
import { fetchHotelsApi } from '../services/adminApi';

const HotelPreviewCard = ({ index, hotel, onRemove, onDetails }) => {
  return (
    <div className="hotel-card">
      <div className="hotel-card-header">
        <span className="hotel-chip">{index + 1}. Konaklama</span>
        <button className="hotel-details-btn" onClick={onDetails}>Otel Detayları</button>
        <button className="hotel-remove-btn" onClick={onRemove} aria-label="Sil">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-1 12H9a1 1 0 0 1-1-1V7h10v11a1 1 0 0 1-1 1Z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="hotel-card-title">{hotel.name}</div>
      <div className="hotel-card-line"><span className="hotel-line-label">Konaklama Başlangıç Tarihi:</span> {hotel.checkIn}</div>
      <div className="hotel-card-line"><span className="hotel-line-label">Konaklama Bitiş Tarihi:</span> {hotel.checkOut}</div>
      {hotel.note && <div className="hotel-card-line"><span className="hotel-line-label">Açıklama:</span> {hotel.note}</div>}
    </div>
  );
};

const AddTourStep3Hotel = ({ onNext, onBack, formData, setFormData, updateMode = false, updatedStep = null }) => {
  // Önceden yalnızca açılır listedeki etiket metni tutuluyordu; otelin
  // yıldızı, adresi, telefonu ve olanakları kayıtta olmasına rağmen tura
  // hiç geçmiyordu. Artık otel kaydının kendisi seçiliyor.
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [note, setNote] = useState('');
  const [hotels, setHotels] = useState(formData.hotels || []);
  const [noAccommodation, setNoAccommodation] = useState(!!formData.noAccommodation);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const comboRef = useRef(null);

  const [savedHotels, setSavedHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState('');

  const formatHotelLabel = (hotel) => {
    const location = [hotel.district, hotel.city].filter(Boolean).join(' / ');
    return location ? `${hotel.name} - ${location}` : hotel.name;
  };

  useEffect(() => {
    let active = true;
    const loadHotels = async () => {
      try {
        setHotelsLoading(true);
        setHotelsError('');
        const list = await fetchHotelsApi();
        if (!active) return;
        setSavedHotels(Array.isArray(list) ? list : []);
      } catch (error) {
        if (!active) return;
        setSavedHotels([]);
        setHotelsError(error instanceof Error ? error.message : 'Otel listesi yüklenemedi.');
      } finally {
        if (active) setHotelsLoading(false);
      }
    };
    loadHotels();
    return () => { active = false; };
  }, []);

  const addHotel = () => {
    if (!selectedHotel || !checkIn || !checkOut) return;
    const newHotel = {
      id: Date.now(),
      hotelId: selectedHotel.id,
      name: selectedHotel.name,
      stars: selectedHotel.stars ?? selectedHotel.rating ?? 0,
      address: [selectedHotel.address, selectedHotel.district, selectedHotel.city].filter(Boolean).join(', ') || null,
      phone: selectedHotel.phone || null,
      website: selectedHotel.website || null,
      mapLink: selectedHotel.mapLink || null,
      amenities: Array.isArray(selectedHotel.amenities) ? selectedHotel.amenities : [],
      checkIn,
      checkOut,
      note,
    };
    const next = [...hotels, newHotel];
    setHotels(next);
    setSelectedHotel(null);
    setCheckIn('');
    setCheckOut('');
    setNote('');
  };

  const removeHotel = (id) => setHotels(hotels.filter(h => h.id !== id));

  const handleSubmit = () => {
  setFormData({ ...formData, hotels, noAccommodation });
    onNext();
  };

  // Filter list by query
  const filteredHotels = savedHotels.filter((h) =>
    formatHotelLabel(h).toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')));

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!comboRef.current) return;
      if (!comboRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="step3hotel-main-container">
      <div className="step3hotel-container">
        <div className="step3hotel-layout">
          <div className="progress-steps-container">
            <ProgressSteps currentStep={3} updateMode={updateMode} updatedStep={updatedStep} />
          </div>

          <div className="step3hotel-form-content">
            <div className="step3hotel-form-section">
              <h3 className="step3hotel-section-title">Otel / Konaklama Bilgileri</h3>

              <div className="hotel-select-group">
                <label className="hotel-label">Kaydedilen Otellerden Seçim Yapınız</label>
                <p className="hotel-help">Sisteme kaydettiğiniz otellerden seçim yapınız. Birden fazla otel seçimi için “Ekle” butonuna basınız. Tüm otel / konaklama bilgilerini doldurduktan sonra aşağıdaki önizlemeden kontrol edip “Kaydet ve Devam Et” butonuna basarak formun diğer alanlarını doldurmaya devam ediniz...</p>
                {hotelsLoading && <p className="hotel-help">Oteller yükleniyor...</p>}
                {hotelsError && <p className="hotel-help" style={{ color: '#b42318' }}>{hotelsError}</p>}
                <div className="hotel-none-row">
                  <label className="radio-control">
                    <input
                      type="checkbox"
                      checked={noAccommodation}
                      onChange={() => {
                        setNoAccommodation(v => {
                          const next = !v;
                          if (next) {
                            setSelectedHotel(null);
                            setQuery('');
                            setIsOpen(false);
                          }
                          return next;
                        });
                      }}
                      aria-label="Konaklama Olmayacak"
                    />
                    <span className="radio-mark" aria-hidden="true"></span>
                  </label>
                  <span className="hotel-none-text">Konaklama Olmayacak</span>
                </div>
                <div className={`hotel-combobox ${noAccommodation ? 'disabled' : ''}`} ref={comboRef}>
                  <span className="hotel-input-icon" aria-hidden>📌</span>
                  <input
                    className="hotel-input"
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls="hotel-dropdown-list"
                    placeholder="Otel adı veya il, ilçe adına göre aratınız..."
                    value={isOpen ? query : (selectedHotel ? formatHotelLabel(selectedHotel) : '')}
                    onChange={(e)=>{ if (!noAccommodation) { setQuery(e.target.value); setIsOpen(true); } }}
                    onFocus={()=> { if (!noAccommodation) setIsOpen(true); }}
                    disabled={noAccommodation || hotelsLoading}
                  />
                  <button
                    type="button"
                    className={`hotel-input-chevron ${isOpen ? 'open' : ''}`}
                    aria-label="Aç/Kapat"
                    onClick={()=> { if (!noAccommodation && !hotelsLoading) setIsOpen(o => !o); }}
                    disabled={noAccommodation || hotelsLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9l6 6 6-6" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {isOpen && !noAccommodation && (
                    <div id="hotel-dropdown-list" className="hotel-dropdown" role="listbox">
                      {(query ? filteredHotels : savedHotels).map((h) => (
                        <div
                          key={h.id}
                          role="option"
                          aria-selected={selectedHotel?.id === h.id}
                          className={`hotel-option ${selectedHotel?.id === h.id ? 'selected' : ''}`}
                          onMouseDown={(e)=> e.preventDefault()}
                          onClick={()=> { setSelectedHotel(h); setIsOpen(false); setQuery(''); }}
                        >
                          {formatHotelLabel(h)}
                          {h.stars > 0 && <span className="hotel-option-stars">{'★'.repeat(Math.min(5, h.stars))}</span>}
                        </div>
                      ))}
                      {((query ? filteredHotels : savedHotels).length === 0) && (
                        <div className="hotel-option disabled" aria-disabled="true">
                          {hotelsLoading ? 'Yükleniyor...' : 'Sonuç bulunamadı'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="hotel-datetime-row">
                <div className="hotel-datetime-field">
                  <label>Otele Giriş Tarih-Saat:</label>
                  <DateTimePicker value={checkIn} onChange={setCheckIn} />
                </div>
                <div className="hotel-datetime-field">
                  <label>Otelden Çıkış Tarih-Saat:</label>
                  <DateTimePicker value={checkOut} onChange={setCheckOut} />
                </div>
              </div>

              <div className="hotel-note-group">
                <label>Açıklama Ekleyin</label>
                <textarea placeholder="Otel / Konaklama Hakkında Açıklama Ekleyin" value={note} onChange={(e)=>setNote(e.target.value)} />
              </div>

              <div className="hotel-actions">
                <button type="button" className="hotel-add-btn" onClick={addHotel}>Ekle +</button>
              </div>

              {hotels.length > 0 && (
                <div className="hotel-preview">
                  <h4>Önizleme</h4>
                  <div className="hotel-preview-list">
                    {hotels.map((h, i) => (
                      <HotelPreviewCard
                        key={h.id}
                        index={i}
                        hotel={h}
                        onRemove={() => removeHotel(h.id)}
                        onDetails={() => {}}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="step3hotel-button-container">
              <button type="button" className="step3hotel-back-button" onClick={onBack}>Geri</button>
              <button className="step3hotel-submit-btn" onClick={handleSubmit}>
                <span>Kaydet ve Devam Et</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTourStep3Hotel;
