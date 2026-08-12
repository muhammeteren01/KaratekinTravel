import React, { useEffect, useState } from 'react';
import './AddTourStep3.css';
import ProgressSteps from './ProgressSteps';
import CloseIcon from '../assets/icons/close-icon.svg';
import ChipTag from './pricing/ChipTag';
import SummaryCard from './pricing/SummaryCard';
import { fetchVehiclesApi } from '../services/adminApi';
import { getStep3Data } from '../utils/tripPayload';

const AddTourStep3 = ({ onNext, onBack, formData, setFormData, updateMode = false, updatedStep = null }) => {
  const existingStep3 = getStep3Data(formData);
  const [tourPrice, setTourPrice] = useState(existingStep3.tourPrice || '');
  const [differentPrices, setDifferentPrices] = useState(existingStep3.differentPrices || []);
  const [newPriceType, setNewPriceType] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');
  const [extraCharges, setExtraCharges] = useState(existingStep3.extraCharges || []);
  const [newChargeType, setNewChargeType] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState(existingStep3.selectedVehicles || []);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [minParticipants, setMinParticipants] = useState(existingStep3.minParticipants || '');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');

  useEffect(() => {
    let active = true;
    const companyId = formData.companyId || formData.raw?.companyId;

    const loadVehicles = async () => {
      try {
        setVehiclesLoading(true);
        setVehiclesError('');
        const list = await fetchVehiclesApi(companyId || null);
        if (!active) return;
        const normalized = (Array.isArray(list) ? list : []).map((v) => ({
          id: v.id,
          plate: v.plate,
          capacity: v.capacity,
        }));
        setAvailableVehicles(normalized);
      } catch (error) {
        if (!active) return;
        setAvailableVehicles([]);
        setVehiclesError(error instanceof Error ? error.message : 'Araç listesi yüklenemedi.');
      } finally {
        if (active) setVehiclesLoading(false);
      }
    };

    loadVehicles();
    return () => { active = false; };
  }, [formData.companyId, formData.raw?.companyId]);

  const handleAddPriceType = () => {
    if (newPriceType.trim() && newPriceAmount.trim()) {
      const newPrice = {
        id: Date.now(),
        type: newPriceType.trim(),
        amount: newPriceAmount.replace('TL', '').trim()
      };
      setDifferentPrices([...differentPrices, newPrice]);
      setNewPriceType('');
      setNewPriceAmount('');
    }
  };

  const handleRemovePriceType = (id) => {
    setDifferentPrices(differentPrices.filter(price => price.id !== id));
  };

  const handleAddExtraCharge = () => {
    if (newChargeType.trim() && newChargeAmount.trim()) {
      const newCharge = {
        id: Date.now(),
        type: newChargeType.trim(),
        amount: newChargeAmount.replace('TL', '').trim()
      };
      setExtraCharges([...extraCharges, newCharge]);
      setNewChargeType('');
      setNewChargeAmount('');
    }
  };

  const handleRemoveExtraCharge = (id) => {
    setExtraCharges(extraCharges.filter(charge => charge.id !== id));
  };

  const handleAddVehicle = () => {
    if (!selectedVehicle) return;
    const vehicle = availableVehicles.find((v) => String(v.id) === String(selectedVehicle) || v.plate === selectedVehicle);
    if (vehicle && !selectedVehicles.find((v) => String(v.id) === String(vehicle.id))) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
      setSelectedVehicle('');
    }
  };

  const handleRemoveVehicle = (id) => {
    setSelectedVehicles(selectedVehicles.filter(vehicle => vehicle.id !== id));
  };

  const getTotalCapacity = () => {
    const fromVehicles = selectedVehicles.reduce(
      (total, vehicle) => total + (Number(vehicle.capacity) || 0),
      0,
    );
    if (fromVehicles > 0) return fromVehicles;
    const fromMin = Number(String(minParticipants || '').replace(/[^\d]/g, ''));
    return fromMin > 0 ? fromMin : 0;
  };

  const handleSubmit = () => {
    const capacity = getTotalCapacity();
    if (!capacity || capacity <= 0) {
      alert(
        "Kapasite 0'dan büyük olmalıdır. En az bir araç ekleyin veya Minimum Katılımcı Sayısı alanına kişi sayısı girin.",
      );
      return;
    }

    const step3Data = {
      tourPrice,
      differentPrices,
      extraCharges,
      selectedVehicles,
      minParticipants,
      totalCapacity: capacity,
    };

    setFormData({ ...formData, step3: step3Data });
    onNext();
  };

  return (
    <div className="step3-main-container">
      <div className="step3-container">
        <div className="step3-layout">
          {/* Progress Steps */}
          <div className="progress-steps-container">
            <ProgressSteps currentStep={4} updateMode={updateMode} updatedStep={updatedStep} />
          </div>

          {/* Form Content */}
          <div className="step3-form-content">
            <div className="step3-form-section">
              {/* Tour Price */}
              <div className="step3-form-group">
                <div className="step3-label-container">
                  <label className="step3-form-label">Tur Fiyatı</label>
                  <div className="step3-help-icon">?</div>
                </div>
                <p className="step3-section-description">
                  Turun genel fiyatını belirleyiniz. Ek ücretleri aşağıdaki “Ek Ücretler” alanında belirleyiniz.
                </p>
                <div className="step3-dropdown-container">
                  <div className="step3-currency-icon">₺</div>
                  <input
                    type="text"
                    placeholder="Turunuzun Fiyatı Giriniz"
                    value={tourPrice}
                    onChange={(e) => setTourPrice(e.target.value)}
                    className="step3-dropdown-input"
                  />
                </div>
              </div>

              {/* Different Price Types */}
              <div className="step3-form-group">
                <div className="step3-label-container">
                  <label className="step3-form-label">Farklı Fiyat Türleri</label>
                  <div className="step3-help-icon">?</div>
                </div>
                <p className="step3-section-description">
                  Bu alanda gireceğiniz tutarlar, sadece üstte belirlediğiniz genel <strong>“Tur Fiyatı”</strong> değerini değiştirmektedir.
                  Örneğin, üstteki alanda (<strong>“Tur Fiyatı”</strong> bölümü) 1.000TL olarak belirlediğiniz fiyatı öğrenci için 750TL olarak değiştirebilirsiniz.
                </p>
                
                {/* Price Type Input Section */}
                <div className="step3-price-fields-container">
                  <div className="step3-field-label">Fiyat Türü</div>
                  <div className="step3-field-label">Değeri</div>
                </div>
                
                <div className="step3-price-inputs-container">
                  <div className="step3-dropdown-container step3-price-type-input">
                    <input
                      type="text"
                      placeholder="Örn: Öğrenci"
                      value={newPriceType}
                      onChange={(e) => setNewPriceType(e.target.value)}
                      className="step3-dropdown-input"
                    />
                  </div>
                  <div className="step3-dropdown-container step3-price-amount-input">
                    <div className="step3-currency-icon">₺</div>
                    <input
                      type="text"
                      placeholder="Örn: 150"
                      value={newPriceAmount}
                      onChange={(e) => setNewPriceAmount(e.target.value)}
                      className="step3-dropdown-input"
                    />
                  </div>
                  <button className="step3-add-price-btn" onClick={handleAddPriceType}>
                    Ek Fiyat Ekle
                  </button>
                </div>

                {/* Added Prices List */}
                {differentPrices.length > 0 && (
                  <div className="step3-added-prices">
                    <h3 className="step3-prices-title">Eklenen Fiyatlar</h3>
                    <div className="step3-prices-list">
                      {differentPrices.map(price => (
                        <ChipTag key={price.id} text={`${price.type}: ${price.amount}TL`} onRemove={() => handleRemovePriceType(price.id)} tone="blue" size="md" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Charges */}
              <div className="step3-form-group">
                <div className="step3-label-container">
                  <label className="step3-form-label">Ek Ücretler</label>
                  <div className="step3-help-icon">?</div>
                </div>
                
                {/* Extra Charge Input Section */}
                <div className="step3-price-fields-container">
                  <div className="step3-field-label">Ek Ücret Türü</div>
                  <div className="step3-field-label">Değeri</div>
                </div>
                
                <div className="step3-price-inputs-container">
                  <div className="step3-dropdown-container step3-price-type-input">
                    <input
                      type="text"
                      placeholder="Örn: Piknik Ücreti"
                      value={newChargeType}
                      onChange={(e) => setNewChargeType(e.target.value)}
                      className="step3-dropdown-input"
                    />
                  </div>
                  <div className="step3-dropdown-container step3-price-amount-input">
                    <div className="step3-currency-icon">₺</div>
                    <input
                      type="text"
                      placeholder="Örn: 500"
                      value={newChargeAmount}
                      onChange={(e) => setNewChargeAmount(e.target.value)}
                      className="step3-dropdown-input"
                    />
                  </div>
                  <button className="step3-add-price-btn" onClick={handleAddExtraCharge}>
                    Ek Fiyat Ekle
                  </button>
                </div>

                {/* Added Extra Charges List */}
                {extraCharges.length > 0 && (
                  <div className="step3-added-prices">
                    <h3 className="step3-prices-title">Eklenen Fiyatlar</h3>
                    <div className="step3-prices-list">
                      {extraCharges.map(charge => (
                        <ChipTag key={charge.id} text={`${charge.type}: ${charge.amount}TL`} onRemove={() => handleRemoveExtraCharge(charge.id)} tone="blue" size="md" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Capacity Selection */}
              <div className="step3-form-group">
                <div className="step3-capacity-header">
                  <label className="step3-form-label">Kapasite Seçimi</label>
                  <div className="step3-capacity-display">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="step3-people-icon-svg">
                      <g stroke="#A9A9A9" strokeWidth="1">
                        <circle cx="12.22" cy="4.77" r="1.72"/>
                        <path d="M13.29 9.77c0-1.67-1.07-1.67-1.07-1.67s-1.07 0-1.07 1.67"/>
                        <circle cx="3.55" cy="4.77" r="1.72"/>
                        <path d="M4.62 9.77c0-1.67-1.07-1.67-1.07-1.67s-1.07 0-1.07 1.67"/>
                        <circle cx="7.89" cy="3.44" r="2.64"/>
                        <path d="M10.64 14.67c0-2.64-1.23-2.64-1.23-2.64H6.47s-1.23 0-1.23 2.64"/>
                      </g>
                    </svg>
                    <span>Kapasite: {getTotalCapacity()}</span>
                  </div>
                </div>
                <p className="step3-capacity-description">
                  Kapasite seçilen araçların koltuk toplamından hesaplanır. Araç seçmezseniz aşağıdaki Minimum Katılımcı Sayısı kapasite olarak kullanılır.
                </p>
                {vehiclesLoading && <p className="step3-section-description">Araçlar yükleniyor...</p>}
                {vehiclesError && <p className="step3-section-description" style={{ color: '#b42318' }}>{vehiclesError}</p>}
                {!vehiclesLoading && availableVehicles.length === 0 && (
                  <div className="step3-section-description" style={{ marginBottom: 12 }}>
                    Henüz tanımlı araç yok. Önce bir otobüs ekleyin, sonra buradan seçin.
                    <button
                      type="button"
                      className="step3-add-vehicle-btn"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        try {
                          localStorage.setItem('nvdMode', 'create');
                          localStorage.removeItem('nvdData');
                        } catch {
                          // ignore
                        }
                        window.location.hash = encodeURIComponent('Yeni Araç Tanımla');
                      }}
                    >
                      Yeni Araç Tanımla
                    </button>
                  </div>
                )}
                
                <div className="step3-vehicle-selection">
                  <div className="step3-vehicle-dropdown">
                    <select 
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="step3-vehicle-select"
                      disabled={vehiclesLoading || availableVehicles.length === 0}
                    >
                      <option value="">{vehiclesLoading ? 'Yükleniyor...' : (availableVehicles.length === 0 ? 'Araç bulunamadı' : 'Araç seçiniz')}</option>
                      {availableVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} ({vehicle.capacity} kişi)
                        </option>
                      ))}
                    </select>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="step3-dropdown-arrow">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <button
                    className="step3-add-vehicle-btn"
                    onClick={handleAddVehicle}
                    disabled={!selectedVehicle}
                  >
                    Otobüs Ekle
                  </button>
                </div>

                {/* Added Vehicles List */}
                {selectedVehicles.length > 0 && (
                  <div className="step3-added-vehicles">
                    <h3 className="step3-vehicles-title">Eklenen Otobüsler</h3>
                    <div className="step3-vehicles-list">
            {selectedVehicles.map(vehicle => (
                        <ChipTag
                          key={vehicle.id}
                          text={vehicle.plate}
                          onRemove={() => handleRemoveVehicle(vehicle.id)}
              tone="blue"
                          size="md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Minimum Participants */}
              <div className="step3-form-group">
                <label className="step3-form-label">Minimum Katılımcı Sayısı</label>
                <p className="step3-min-participants-description">
                  Minimum katılımcı sayısı belirleyerek tur organizasyonunu erteleyebilirsiniz.
                </p>
                <div className="step3-min-participants-input">
                  <div className="step3-people-icon">👥</div>
                  <input
                    type="text"
                    placeholder="Minimum Sayı Belirle"
                    value={minParticipants}
                    onChange={(e) => setMinParticipants(e.target.value)}
                    className="step3-participants-input"
                  />
                </div>
              </div>
            </div>

            {/* Preview Cards */}
            {(tourPrice || differentPrices.length || extraCharges.length) ? (
              <div className="step3-preview-block" style={{marginTop: 8}}>
                <h3 style={{color:'#404D61', fontWeight:600, margin:'4px 0 8px'}}>Önizleme</h3>
                <div style={{display:'grid', gap:12}}>
                  <SummaryCard
                    badge="GENEL TUR ÜCRETİ"
                    badgeColor="orange"
                    sections={[
                      { title:'Tur Fiyatı:', items: tourPrice ? [`${Number(tourPrice)||tourPrice}TL`] : [] },
                      { title:'Ek Ücretler:', items: extraCharges.map((c,i)=>`${i+1}. ${c.type} = ${c.amount}TL`) },
                      { note:`ARA TOPLAM: ${(
                        (Number(tourPrice)||0) + extraCharges.reduce((s,c)=>s+(Number(c.amount)||0),0)
                      ).toLocaleString('tr-TR')}TL` }
                    ]}
                  />
                  {differentPrices.map((p)=> {
                    const subtotal = (Number(p.amount)||0) + extraCharges.reduce((s,c)=> s + (Number(c.amount)||0), 0);
                    return (
                      <SummaryCard
                        key={p.id}
                        badge={`"${p.type}" İÇİN TUR ÜCRETİ`}
                        badgeColor="green"
                        sections={[
                          { title:'Tur Fiyatı:', items:[`${Number(p.amount)||p.amount}TL`] },
                          { title:'Ek Ücretler:', items: extraCharges.map((c,i)=>`${i+1}. ${c.type} = ${c.amount}TL`) },
                          { note: `ARA TOPLAM: ${subtotal.toLocaleString('tr-TR')}TL` }
                        ]}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Buttons */}
            <div className="step3-button-container">
              <button 
                type="button" 
                className="step3-back-button"
                onClick={onBack}
              >
                Geri
              </button>
              
              <button className="step3-submit-btn" onClick={handleSubmit}>
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

export default AddTourStep3; 