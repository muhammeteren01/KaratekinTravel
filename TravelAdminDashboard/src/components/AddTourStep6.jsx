import React from 'react';
import './AddTourStep6.css';
import ProgressSteps from './ProgressSteps';
import SummaryCard from './pricing/SummaryCard';
import ChipTag from './pricing/ChipTag';
import MediaThumbCard from './media/MediaThumbCard';
import { getStep3Data } from '../utils/tripPayload';
// Reuse visual styles from earlier steps for hotel and route cards
import './AddTourStep3Hotel.css';
import './RouteStops.css';

const AddTourStep6 = ({ onNext, onBack, formData, setFormData, submitLabel = 'Formu Kaydet', isSubmitting = false, updateMode = false, updatedStep = null }) => {
  // Debug: Log formData to see what's available
  console.log('=== STEP 6 RENDER DEBUG ===');
  console.log('AddTourStep6 formData:', formData);
  console.log('AddTourStep6 step4 data:', formData.step4);
  console.log('AddTourStep6 coverImage:', formData.step4?.coverImage);
  console.log('AddTourStep6 coverImage preview length:', formData.step4?.coverImage?.preview?.length);
  console.log('AddTourStep6 additionalImages count:', formData.step4?.additionalImages?.length);
  console.log('AddTourStep6 additionalImages:', formData.step4?.additionalImages);
  if (formData.step4?.additionalImages) {
    formData.step4.additionalImages.forEach((img, index) => {
      console.log(`Step6 Image ${index + 1} preview length:`, img.preview?.length);
    });
  }
  console.log('=== END STEP 6 DEBUG ===');
  
  const step3 = getStep3Data(formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Final form data:', formData);
    // Here you would typically send the data to the server
    onNext(); // Navigate to success page
  };

  const has = (arr) => Array.isArray(arr) && arr.length > 0;

  const formatPriceTypes = (priceTypes) => {
    if (!priceTypes || priceTypes.length === 0) return 'Belirtilmemiş';
    return priceTypes.map(pt => `${pt.type}: ${pt.amount}TL`).join(' - ');
  };

  const formatExtraFees = (extraFees) => {
    if (!extraFees || extraFees.length === 0) return 'Belirtilmemiş';
    return extraFees.map(ef => `${ef.type}: ${ef.amount}TL`).join(' - ');
  };

  const formatVehicles = (vehicles) => {
    if (!vehicles || vehicles.length === 0) return 'Belirtilmemiş';
    return vehicles.map(v => `${v.plate} (${v.capacity} kişi)`).join(' - ');
  };

  const safeStops = (stops) => Array.isArray(stops) ? stops : [];

  const includedItems = formData.step4?.includedItems || [];
  const excludedItems = formData.step4?.excludedItems || [];

  const getPolicyLabel = (policy) => {
    const policyMap = { flexible:'Esnek İptal', moderate:'Orta Düzey İptal', strict:'Katı İptal', 'no-refund':'İade Yok' };
    return policyMap[policy] || '';
  };

  return (
    <div className="step6-container">
      <div className="step6-content">
        <div className="step6-progress-section">
          <ProgressSteps currentStep={7} updateMode={updateMode} updatedStep={updatedStep} />
        </div>
        
        <div className="step6-main-content">
          <form onSubmit={handleSubmit}>
            <div className="step6-review-sections">
              {/* 1. Genel Bilgiler */}
              <div className="step6-section">
                <div className="step6-section-header">
                  <h3 className="step6-section-title">1. Genel Bilgiler</h3>
                </div>
                <div className="step6-section-content">
                  <div className="step6-info-row">
                    <div className="step6-info-group">
                      <span className="step6-label">Tur Adı:</span>
                      <span className="step6-value">{formData.tourName || 'Belirtilmemiş'}</span>
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group full-width">
                      <span className="step6-label">Tur Detaylı Açıklama:</span>
                      <div className="step6-description-box">
                        {formData.tourDescription || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group">
                      <span className="step6-label">Kategori:</span>
                      <span className="step6-value">{formData.category || 'Belirtilmemiş'}</span>
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group">
                      <span className="step6-label">Etiketler:</span>
                      <div>
                        {has(formData.tags) ? (
                          formData.tags.map((t, i) => (
                            <ChipTag key={`${t}-${i}`} text={t} tone="gray" size="sm" />
                          ))
                        ) : (
                          <span className="step6-value">Belirtilmemiş</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Rota Oluşturma */}
              <div className="step6-section">
                <div className="step6-section-header">
                  <h3 className="step6-section-title">2. Rota Oluşturma</h3>
                </div>
                <div className="step6-section-content">
                  <div className="rs-list">
                    {safeStops(formData.stops).length === 0 && (
                      <div className="rs-card"><div className="rs-main"><div className="rs-name" style={{fontWeight:500,color:'#6b7280'}}>Durak eklenmemiş.</div></div></div>
                    )}
                    {safeStops(formData.stops).map((stop, idx) => (
                      <div key={stop.id || idx} className="rs-card">
                        <div className="rs-header">
                          <span className="rs-chip chip-orange">{idx + 1}. Durak</span>
                        </div>
                        <div className="rs-main">
                          <div className="rs-name">{stop.name || stop.address || 'İsimsiz Konum'} -</div>
                          {stop.time && <div className="rs-time">{stop.time}</div>}
                        </div>
                        {Array.isArray(stop.subStops) && stop.subStops.length > 0 && (
                          <div className="rs-sub">
                            <div className="rs-sub-item" style={{fontWeight:700,color:'#6b7280'}}>Ara Duraklar:</div>
                            {stop.subStops.map((s, i) => (
                              <div key={s.id || i} className="rs-sub-item">
                                <span className="rs-sub-bullet">{i + 1}.</span>
                                <span className="rs-sub-text">{s.name} {s.time ? `- ${s.time}` : ''}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Otel / Konaklama */}
              <div className="step6-section">
                <div className="step6-section-header">
                  <h3 className="step6-section-title">3. Otel / Konaklama</h3>
                </div>
                <div className="step6-section-content">
                  {Array.isArray(formData.hotels) && formData.hotels.length > 0 ? (
                    <div className="hotel-preview-list" style={{display:'grid', gap:12}}>
                      {formData.hotels.map((h, i) => (
                        <div key={h.id || i} className="hotel-card">
                          <div className="hotel-card-header">
                            <span className="hotel-chip">{i + 1}. Konaklama</span>
                          </div>
                          <div className="hotel-card-title">{h.name}</div>
                          <div className="hotel-card-line"><span className="hotel-line-label">Konaklama Başlangıç Tarihi:</span> {h.checkIn || '-'}</div>
                          <div className="hotel-card-line"><span className="hotel-line-label">Konaklama Bitiş Tarihi:</span> {h.checkOut || '-'}</div>
                          {h.note && <div className="hotel-card-line"><span className="hotel-line-label">Açıklama:</span> {h.note}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="step6-value">Belirtilmemiş</span>
                  )}
                </div>
              </div>

              {/* 4. Fiyatlandırma */}
              <div className="step6-section">
                <div className="step6-section-header">
                  <h3 className="step6-section-title">4. Fiyatlandırma</h3>
                </div>
                <div className="step6-section-content">
                  {(step3.tourPrice || has(step3.differentPrices) || has(step3.extraCharges)) ? (
                    <div style={{display:'grid', gap:12}}>
                      <SummaryCard
                        badge='"Genel" Tur Ücreti'
                        badgeColor="orange"
                        sections={[
                          { title:'Tur Fiyatı:', items: step3.tourPrice ? [`${Number(step3.tourPrice)||step3.tourPrice}TL`] : [] },
                          { title:'Ek Ücretler:', items: (step3.extraCharges||[]).map((c,i)=>`${i+1}. ${c.type} = ${c.amount}TL`) },
                          { note:`ARA TOPLAM: ${(((Number(step3.tourPrice)||0) + (step3.extraCharges||[]).reduce((s,c)=>s+(Number(c.amount)||0),0))).toLocaleString('tr-TR')}TL` }
                        ]}
                      />
                      {(step3.differentPrices||[]).map((p)=>{
                        const subtotal = (Number(p.amount)||0) + (step3.extraCharges||[]).reduce((s,c)=> s + (Number(c.amount)||0), 0);
                        return (
                          <SummaryCard
                            key={p.id}
                            badge={`"${p.type}" Tur Ücreti`}
                            badgeColor="green"
                            sections={[
                              { title:'Tur Fiyatı:', items:[`${Number(p.amount)||p.amount}TL`] },
                              { title:'Ek Ücretler:', items:(step3.extraCharges||[]).map((c,i)=>`${i+1}. ${c.type} = ${c.amount}TL`) },
                              { note:`ARA TOPLAM: ${subtotal.toLocaleString('tr-TR')}TL` }
                            ]}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <span className="step6-value">Belirtilmemiş</span>
                  )}
                </div>
              </div>

              {/* 5. Medya ve Ek Detaylar */}
              <div className="step6-section">
                <div className="step6-section-header">
                  <h3 className="step6-section-title">5. Medya ve Ek Detaylar</h3>
                </div>
                <div className="step6-section-content">
                  <div className="step6-info-row">
                    <div className="step6-info-group full-width">
                      <span className="step6-label">Kapak Fotoğrafı:</span>
                      {formData.step4?.coverImage ? (
                        <div className="media-grid" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          <MediaThumbCard image={formData.step4.coverImage} badge="Kapak" readOnly />
                        </div>
                      ) : (
                        <span className="step6-value">Belirtilmemiş</span>
                      )}
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group full-width">
                      <span className="step6-label">Eklenen Görseller:</span>
                      {has(formData.step4?.additionalImages) ? (
                        <div className="media-grid" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          {formData.step4.additionalImages.map((img)=> (
                            <MediaThumbCard key={img.id} image={img} readOnly />
                          ))}
                        </div>
                      ) : (
                        <span className="step6-value">Belirtilmemiş</span>
                      )}
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group">
                      <span className="step6-label">Tura Dahil Olanlar:</span>
                      <div>
                        {has(includedItems) ? includedItems.map((it, idx)=>(
                          <ChipTag key={`inc-${idx}`} text={it} tone="blue" size="sm" />
                        )) : <span className="step6-value">Belirtilmemiş</span>}
                      </div>
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group">
                      <span className="step6-label">Tur Dışında Olanlar:</span>
                      <div>
                        {has(excludedItems) ? excludedItems.map((it, idx)=>(
                          <ChipTag key={`exc-${idx}`} text={it} tone="gray" size="sm" />
                        )) : <span className="step6-value">Belirtilmemiş</span>}
                      </div>
                    </div>
                  </div>
                  <div className="step6-info-row">
                    <div className="step6-info-group full-width">
                      <span className="step6-label">Özel Açıklama:</span>
                      <div className="step6-description-box">
                        {formData.step4?.specialDescription || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. İptal ve Değişim Politikası */}
              <div className="step6-section">
                <div className="step6-section-header">
                  <h3 className="step6-section-title">6. İptal ve Değişim Politikası</h3>
                </div>
                <div className="step6-section-content">
                  <div className="step6-info-row">
                    <div className="step6-info-group full-width">
                      <span className="step6-label">İptal ve Değişim Politikası:</span>
                      <div className="step6-description-box">
                        {(formData.cancellationPolicyText && formData.cancellationPolicyText.trim()) || getPolicyLabel(formData.cancellationPolicy) || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="step6-button-container">
            <button 
              type="button" 
              className="step6-back-button"
              onClick={onBack}
            >
              Geri
            </button>
            
            <button type="submit" className={`step6-submit-button ${updateMode ? 'update' : ''}`} disabled={isSubmitting}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isSubmitting ? 'Kaydediliyor...' : submitLabel}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTourStep6; 