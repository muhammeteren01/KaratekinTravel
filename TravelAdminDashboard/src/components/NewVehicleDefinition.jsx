import React, { useEffect, useMemo, useState } from 'react';
import './NewVehicleDefinition.css';
import { useFeedback } from './feedback/feedbackContext';
import {
  createVehicleApi,
  fetchCompaniesApi,
  fetchMeApi,
  fetchVehicleLayoutsApi,
  updateVehicleApi,
} from '../services/adminApi';
import {
  SEAT_TEMPLATES,
  buildSeatGrid,
  parseLayoutGrid,
  seatNumbers,
} from '../utils/seatLayoutTemplates';
import { VEHICLE_CLASSES, formatPlate, validatePlate } from '../utils/vehicle';
import {
  MAX_GALLERY_IMAGES,
  filterImageFiles,
  readFileAsDataUrl,
  toGalleryItems,
  validateSingleImage,
} from '../utils/imageUpload';

const NewVehicleDefinition = () => {
  const { notify } = useFeedback();
  const [formData, setFormData] = useState({
    companyId: '',
    vehiclePlate: '',
    vehicleModel: '',
    passengerCapacity: '46',
    wifi: '',
    busType: '2+1',
    airCondition: '',
    powerOutlet: '',
    vehicleDesign: '2+1 Standart',
    seatLayoutId: '',
    templateId: '2plus1',
    coverImage: null,
    additionalImages: []
  });

  const [isVehicleModelOpen, setIsVehicleModelOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // hydrate from localStorage if editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);

  useEffect(() => {
    let alive = true;

    Promise.all([fetchCompaniesApi().catch(() => []), fetchMeApi().catch(() => null)])
      .then(([companyList, me]) => {
        if (!alive) return;
        setCompanies(Array.isArray(companyList) ? companyList : []);
        if (me?.companyId) {
          setFormData((prev) => ({
            ...prev,
            companyId: prev.companyId || String(me.companyId),
          }));
        }
      });

    try {
      const mode = localStorage.getItem('nvdMode');
      const data = localStorage.getItem('nvdData');
      if (mode === 'edit' && data) {
        const parsed = JSON.parse(data);
        setFormData((prev) => ({
          ...prev,
          companyId: String(parsed.companyId || prev.companyId || ''),
          vehiclePlate: parsed.vehiclePlate || prev.vehiclePlate,
          vehicleModel: parsed.vehicleModel || prev.vehicleModel,
          passengerCapacity: parsed.passengerCapacity || prev.passengerCapacity,
          wifi: parsed.wifi || prev.wifi,
          busType: parsed.busType || prev.busType,
          airCondition: parsed.airCondition || prev.airCondition,
          powerOutlet: parsed.powerOutlet || prev.powerOutlet,
          vehicleDesign: parsed.vehicleDesign || prev.vehicleDesign,
          seatLayoutId: parsed.seatLayoutId || prev.seatLayoutId || '',
          templateId: parsed.templateId || prev.templateId,
          coverImage: parsed.coverImage || prev.coverImage,
          additionalImages: parsed.additionalImages || prev.additionalImages,
        }));
        setEditVehicleId(parsed.id || null);
        setIsEditMode(true);
      }
    } catch (e) {
      console.warn('Failed to hydrate edit data:', e);
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.companyId && companies[0]?.id) {
      setFormData((prev) => ({ ...prev, companyId: String(companies[0].id) }));
    }
  }, [companies, formData.companyId]);

  useEffect(() => {
    let alive = true;
    if (!formData.companyId) {
      setLayouts([]);
      return undefined;
    }

    fetchVehicleLayoutsApi(formData.companyId)
      .then((list) => {
        if (!alive) return;
        setLayouts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!alive) return;
        setLayouts([]);
      });

    return () => {
      alive = false;
    };
  }, [formData.companyId]);

  // Listede ticari araç markaları vardı (Mercedes Sprinter, Ford Transit
  // gibi). Turda seçilen şey markadan çok aracın sınıfı; kapasite ipucu da
  // sınıfla birlikte gösteriliyor.
  const vehicleModels = VEHICLE_CLASSES.map((c) => c.label);

  const companyOptions = useMemo(() => companies.map((company) => ({
    value: String(company.id),
    label: company.name,
  })), [companies]);

  const preview = useMemo(() => {
    const cap = Math.min(80, Math.max(1, Number(String(formData.passengerCapacity).replace(/\D/g, '')) || 1));
    if (formData.seatLayoutId) {
      const layout = layouts.find((l) => String(l.id) === String(formData.seatLayoutId));
      const parsed = parseLayoutGrid(layout);
      if (parsed) return parsed;
    }
    const template = SEAT_TEMPLATES.find((t) => t.id === formData.templateId) || SEAT_TEMPLATES[0];
    return buildSeatGrid(template, cap);
  }, [formData.passengerCapacity, formData.seatLayoutId, formData.templateId, layouts]);

  const previewNumbers = useMemo(() => seatNumbers(preview.grid), [preview]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectTemplate = (template) => {
    const cap = Number(String(formData.passengerCapacity).replace(/\D/g, '')) || 46;
    setFormData((prev) => ({
      ...prev,
      templateId: template.id,
      busType: template.busType,
      vehicleDesign: template.label,
      seatLayoutId: '',
      passengerCapacity: String(cap),
    }));
  };

  const selectSavedLayout = (layout) => {
    setFormData((prev) => ({
      ...prev,
      seatLayoutId: layout.id,
      vehicleDesign: layout.name,
      passengerCapacity: String(layout.totalSeats || prev.passengerCapacity),
      busType: `${layout.seatsLeft}+${layout.seatsRight}`,
    }));
  };

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files?.[0];
    // Girdi hemen sıfırlanıyor; aksi halde aynı dosya ikinci kez seçilemiyor.
    event.target.value = '';

    if (!validateSingleImage(file, { notify })) return;

    try {
      handleInputChange('coverImage', {
        file,
        name: file.name,
        preview: await readFileAsDataUrl(file),
      });
    } catch {
      notify('Görsel okunamadı.', 'error');
    }
  };

  /**
   * Ek görseller tek seferde çoklu seçilebiliyor.
   *
   * Önceden yalnızca `files[0]` okunuyordu: kullanıcı on fotoğraf seçse bile
   * yalnızca ilki ekleniyor, geri kalanı sessizce düşüyordu.
   */
  const handleAdditionalImagesUpload = async (event) => {
    const files = event.target.files;
    event.target.value = '';

    const accepted = filterImageFiles(files, {
      notify,
      remainingSlots: MAX_GALLERY_IMAGES - formData.additionalImages.length,
    });
    if (!accepted.length) return;

    try {
      const images = await toGalleryItems(accepted);
      setFormData((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ...images],
      }));
    } catch {
      notify('Görseller okunamadı.', 'error');
    }
  };

  const removeCoverImage = () => {
    handleInputChange('coverImage', null);
  };

  const removeAdditionalImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = () => {
    const payload = {
      companyId: formData.companyId,
      plate: formData.vehiclePlate.trim(),
      model: formData.vehicleModel.trim() || null,
      busType: formData.busType || '2+1',
      capacity: Number(formData.passengerCapacity || 0),
      hasWifi: formData.wifi === 'var',
      hasAirCondition: formData.airCondition === 'var',
      hasPowerOutlet: formData.powerOutlet === 'var',
      coverImage: formData.coverImage?.preview || null,
      status: 'active',
      seatLayoutId: formData.seatLayoutId || null,
    };

    if (!payload.companyId) {
      setError('Şirket seçimi zorunludur.');
      return;
    }

    const plateCheck = validatePlate(payload.plate);
    if (!plateCheck.valid) {
      setError(plateCheck.message);
      return;
    }

    if (!payload.capacity) {
      setError('Yolcu kapasitesi zorunludur.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const request = isEditMode && editVehicleId
      ? updateVehicleApi(editVehicleId, payload)
      : createVehicleApi(payload);

    request
      .then(() => {
        try {
          localStorage.removeItem('nvdMode');
          localStorage.removeItem('nvdData');
        } catch (storageError) {
          console.warn('Failed to clear edit state:', storageError);
        }
        setSuccess(isEditMode ? 'Araç güncellendi.' : 'Araç başarıyla kaydedildi.');
        window.setTimeout(() => {
          window.location.hash = encodeURIComponent('Araç Listesi');
        }, 600);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Araç kaydedilemedi.'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="nvd-container">
      {/* Araç Hakkında Genel Bilgiler */}
      <div className="nvd-section">
        <div className="nvd-section-header">
          <div className="nvd-title-group">
            <h2 className="nvd-section-title">Araç Hakkında Genel Bilgiler</h2>
          </div>
          <p className="nvd-section-description">
            Profilinize tanımlamak istediğiniz araç hakkında genel bilgileri yazınız. 
            Araç tasarımını, sisteminize daha önceden tasarladığınız tasarımlardan seçip entegre edebilirsiniz.
          </p>
        </div>

        <div className="nvd-form-row">
          <div className="nvd-form-group">
            <label className="nvd-label">Şirket</label>
            <div className="nvd-input-wrapper">
              <div className="nvd-input-container">
                <svg className="nvd-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7H21L19 17H5L3 7Z" stroke="#9AA2AC" strokeWidth="1.5"/>
                </svg>
                <select
                  className="nvd-input"
                  value={formData.companyId}
                  onChange={(e) => handleInputChange('companyId', e.target.value)}
                >
                  <option value="">Şirket seçiniz</option>
                  {companyOptions.map((company) => (
                    <option key={company.value} value={company.value}>{company.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="nvd-form-group">
            <label className="nvd-label">Araç Plakası</label>
            <div className="nvd-input-wrapper">
              <div className="nvd-input-container">
                <svg className="nvd-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7H21L19 17H5L3 7Z" stroke="#9AA2AC" strokeWidth="1.5"/>
                </svg>
                <input
                  type="text"
                  className="nvd-input"
                  placeholder="34 AB 1234"
                  autoCapitalize="characters"
                  autoComplete="off"
                  maxLength={10}
                  value={formData.vehiclePlate}
                  onChange={(e) => handleInputChange('vehiclePlate', formatPlate(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="nvd-form-group">
            <label className="nvd-label">Araç Modeli</label>
            <div className="nvd-dropdown-wrapper">
              <div 
                className="nvd-dropdown-container"
                onClick={() => setIsVehicleModelOpen(!isVehicleModelOpen)}
              >
                <svg className="nvd-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7H21L19 17H5L3 7Z" stroke="#9AA2AC" strokeWidth="1.5"/>
                </svg>
                <span className="nvd-dropdown-text">
                  {formData.vehicleModel || 'Araç Modeli'}
                </span>
                <svg className="nvd-dropdown-arrow" width="12" height="6" viewBox="0 0 12 6" fill="none">
                  <path d="M1 1L6 5L11 1" stroke="#2A2F3B" strokeWidth="1.5"/>
                </svg>
              </div>
              {isVehicleModelOpen && (
                <div className="nvd-dropdown-list">
                  {vehicleModels.map((model, index) => (
                    <div 
                      key={index}
                      className="nvd-dropdown-item"
                      onClick={() => {
                        handleInputChange('vehicleModel', model);
                        setIsVehicleModelOpen(false);
                      }}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="nvd-form-group">
            <label className="nvd-label">Yolcu Kapasitesi Belirtiniz</label>
            <div className="nvd-input-wrapper">
              <div className="nvd-input-container">
                <svg className="nvd-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#9AA2AC" strokeWidth="1.5"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#9AA2AC" strokeWidth="1.5"/>
                </svg>
                <input
                  type="number"
                  className="nvd-input"
                  placeholder="Örnek: 35"
                  value={formData.passengerCapacity}
                  onChange={(e) => handleInputChange('passengerCapacity', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="nvd-features-row">
          <div className="nvd-feature-card">
            <div className="nvd-feature-content">
              <div className="nvd-feature-header">
                <label className="nvd-feature-label">Wi-Fi</label>
                <div className="nvd-radio-group">
                  <div className="nvd-radio-item">
                    <div 
                      className={`nvd-radio-button ${formData.wifi === 'var' ? 'nvd-radio-selected' : ''}`}
                      onClick={() => handleInputChange('wifi', 'var')}
                    >
                      <div className="nvd-radio-inner"></div>
                    </div>
                    <span className="nvd-radio-text">Var</span>
                  </div>
                  <div className="nvd-radio-item">
                    <div 
                      className={`nvd-radio-button ${formData.wifi === 'yok' ? 'nvd-radio-selected' : ''}`}
                      onClick={() => handleInputChange('wifi', 'yok')}
                    >
                      <div className="nvd-radio-inner"></div>
                    </div>
                    <span className="nvd-radio-text">Yok</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="nvd-feature-card nvd-feature-card-wide">
            <div className="nvd-feature-content">
              <div className="nvd-feature-header">
                <label className="nvd-feature-label">Otobüs Tipi</label>
              </div>
              <div className="nvd-radio-group nvd-radio-group-horizontal">
                <div className="nvd-radio-item">
                  <div 
                    className={`nvd-radio-button ${formData.busType === '2+1' ? 'nvd-radio-selected' : ''}`}
                    onClick={() => handleInputChange('busType', '2+1')}
                  >
                    <div className="nvd-radio-inner"></div>
                  </div>
                  <span className="nvd-radio-text">2+1</span>
                </div>
                <div className="nvd-radio-item">
                  <div 
                    className={`nvd-radio-button ${formData.busType === '2+2' ? 'nvd-radio-selected' : ''}`}
                    onClick={() => handleInputChange('busType', '2+2')}
                  >
                    <div className="nvd-radio-inner"></div>
                  </div>
                  <span className="nvd-radio-text">2+2</span>
                </div>
                <div className="nvd-radio-item">
                  <div 
                    className={`nvd-radio-button ${formData.busType === 'diger' ? 'nvd-radio-selected' : ''}`}
                    onClick={() => handleInputChange('busType', 'diger')}
                  >
                    <div className="nvd-radio-inner"></div>
                  </div>
                  <span className="nvd-radio-text">Diğer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="nvd-feature-card">
            <div className="nvd-feature-content">
              <div className="nvd-feature-header">
                <label className="nvd-feature-label">Klima</label>
                <div className="nvd-radio-group">
                  <div className="nvd-radio-item">
                    <div 
                      className={`nvd-radio-button ${formData.airCondition === 'var' ? 'nvd-radio-selected' : ''}`}
                      onClick={() => handleInputChange('airCondition', 'var')}
                    >
                      <div className="nvd-radio-inner"></div>
                    </div>
                    <span className="nvd-radio-text">Var</span>
                  </div>
                  <div className="nvd-radio-item">
                    <div 
                      className={`nvd-radio-button ${formData.airCondition === 'yok' ? 'nvd-radio-selected' : ''}`}
                      onClick={() => handleInputChange('airCondition', 'yok')}
                    >
                      <div className="nvd-radio-inner"></div>
                    </div>
                    <span className="nvd-radio-text">Yok</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="nvd-feature-card">
            <div className="nvd-feature-content">
              <div className="nvd-feature-header">
                <label className="nvd-feature-label">Priz</label>
                <div className="nvd-radio-group">
                  <div className="nvd-radio-item">
                    <div 
                      className={`nvd-radio-button ${formData.powerOutlet === 'var' ? 'nvd-radio-selected' : ''}`}
                      onClick={() => handleInputChange('powerOutlet', 'var')}
                    >
                      <div className="nvd-radio-inner"></div>
                    </div>
                    <span className="nvd-radio-text">Var</span>
                  </div>
                  <div className="nvd-radio-item">
                    <div 
                      className={`nvd-radio-button ${formData.powerOutlet === 'yok' ? 'nvd-radio-selected' : ''}`}
                      onClick={() => handleInputChange('powerOutlet', 'yok')}
                    >
                      <div className="nvd-radio-inner"></div>
                    </div>
                    <span className="nvd-radio-text">Yok</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Araç Tasarımı */}
      <div className="nvd-section nvd-layout-modern">
        <div className="nvd-section-header">
          <div className="nvd-title-group">
            <h2 className="nvd-section-title">Koltuk Düzeni</h2>
          </div>
          <p className="nvd-section-description">
            Hazır şablon seçin veya kayıtlı taslağınızı kullanın. Sürükle-bırak yok —
            kapasiteye göre düzen otomatik oluşur.
          </p>
        </div>

        <div className="nvd-layout-grid">
          <div>
            <h3 className="nvd-layout-subtitle">Hazır şablonlar</h3>
            <div className="nvd-template-cards">
              {SEAT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`nvd-template-card ${!formData.seatLayoutId && formData.templateId === template.id ? 'is-active' : ''}`}
                  onClick={() => selectTemplate(template)}
                >
                  <div className="nvd-template-mini" aria-hidden>
                    {Array.from({ length: template.seatsLeft }).map((_, i) => (
                      <i key={`L${i}`} />
                    ))}
                    <em />
                    {Array.from({ length: template.seatsRight }).map((_, i) => (
                      <i key={`R${i}`} />
                    ))}
                  </div>
                  <strong>{template.label}</strong>
                  <span>{template.hint}</span>
                </button>
              ))}
            </div>

            {layouts.length > 0 && (
              <>
                <h3 className="nvd-layout-subtitle">Kayıtlı taslaklar</h3>
                <div className="nvd-saved-layouts">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      className={`nvd-saved-card ${String(formData.seatLayoutId) === String(layout.id) ? 'is-active' : ''}`}
                      onClick={() => selectSavedLayout(layout)}
                    >
                      <strong>{layout.name}</strong>
                      <span>{layout.totalSeats} koltuk · {layout.seatsLeft}+{layout.seatsRight}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              className="nvd-link-design"
              onClick={() => {
                window.location.hash = encodeURIComponent('Yeni Araç Tasarla');
              }}
            >
              Özel taslak oluştur →
            </button>
          </div>

          <div className="nvd-live-preview">
            <div className="nvd-live-preview-head">
              <div>
                <h3>Önizleme</h3>
                <p>{formData.vehicleDesign || 'Şablon'} · {formData.passengerCapacity || preview.grid?.flat().filter((c) => c === 'seat').length} kişi</p>
              </div>
            </div>
            <div className="nvd-bus-shell">
              <div className="nvd-bus-cap">Şoför · Kapı</div>
              <div
                className="nvd-bus-rows"
                style={{ ['--nvd-cols']: preview.cols }}
              >
                {(preview.grid || []).map((row, r) => (
                  <div className="nvd-bus-row" key={`pr-${r}`}>
                    {row.map((cell, c) => {
                      if (cell === 'aisle') {
                        return <div key={`${r}-${c}`} className="nvd-bus-cell is-aisle" />;
                      }
                      if (cell === 'door') {
                        return <div key={`${r}-${c}`} className="nvd-bus-cell is-door" title="Kapı / merdiven" />;
                      }
                      const num = previewNumbers[r]?.[c];
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`nvd-bus-cell ${cell === 'seat' ? 'is-seat' : 'is-empty'}`}
                        >
                          {cell === 'seat' ? num : ''}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="nvd-bus-cap is-rear">Arka</div>
            </div>
          </div>
        </div>
      </div>

      {/* Medya Ekle */}
      <div className="nvd-section">
        <div className="nvd-section-header">
          <div className="nvd-title-group">
            <h2 className="nvd-section-title">Medya Ekle</h2>
          </div>
          <p className="nvd-section-description">
            Aracınız için eklediğiniz medyaları kullanıcılar görebilmektedirler.
          </p>
        </div>

        <div className="nvd-media-section">
          {/* Kapak Fotoğrafı */}
          <div className="nvd-media-upload">
            <div className="nvd-upload-header">
              <div className="nvd-upload-title-group">
                <label className="nvd-upload-label">Kapak Fotoğrafı Yükle</label>
                <svg className="nvd-help-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#98A2B3" strokeWidth="1.33"/>
                  <path d="M8 11V8M8 5H8.01" stroke="#98A2B3" strokeWidth="1.33" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="nvd-upload-description">
                Kapak fotoğrafı .svg veya .png uzantılı kare boyutlu olması tavsiye edilmektedir.
              </p>
            </div>

            <div className="nvd-upload-area">
              <div className="nvd-file-input">
                <svg className="nvd-file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#697386" strokeWidth="1.5"/>
                  <path d="M7 10L12 15L17 10" stroke="#697386" strokeWidth="1.5"/>
                  <path d="M12 15V3" stroke="#697386" strokeWidth="1.5"/>
                </svg>
                <span className="nvd-file-name">
                  {formData.coverImage ? formData.coverImage.name : 'Dosya seçilmedi'}
                </span>
              </div>
              <label htmlFor="cover-upload" className="nvd-upload-button">
                Görseli Ekle
              </label>
              <input
                id="cover-upload"
                type="file"
                accept=".svg,.png,.jpg,.jpeg"
                onChange={handleCoverImageUpload}
                className="nvd-upload-input"
              />
            </div>

            {formData.coverImage && (
              <div className="nvd-uploaded-section">
                <h4 className="nvd-uploaded-title">Eklenen Görsel</h4>
                <div className="nvd-image-grid">
                  <div className="nvd-uploaded-item">
                    <div className="nvd-image-preview">
                      <img 
                        src={formData.coverImage.preview} 
                        alt="Kapak görseli"
                        className="nvd-preview-image"
                      />
                    </div>
                    <div className="nvd-file-info">
                      <span className="nvd-file-name">{formData.coverImage.name}</span>
                      <button className="nvd-delete-button" onClick={removeCoverImage}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 1L9 9M9 1L1 9" stroke="#C50000" strokeWidth="1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ek Fotoğraflar */}
          <div className="nvd-additional-media">
            <div className="nvd-upload-header">
              <label className="nvd-upload-label">Ek Fotoğraflar Ekle</label>
              <p className="nvd-upload-description">
                Tur detayları kısmında kullanıcı ekleyeceğiniz fotoğrafları görecektir.
              </p>
            </div>

            <div className="nvd-upload-area">
              <div className="nvd-file-input">
                <svg className="nvd-file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#697386" strokeWidth="1.5"/>
                  <path d="M7 10L12 15L17 10" stroke="#697386" strokeWidth="1.5"/>
                  <path d="M12 15V3" stroke="#697386" strokeWidth="1.5"/>
                </svg>
                <span className="nvd-file-name">
                  {formData.additionalImages.length > 0 
                    ? `${formData.additionalImages.length} dosya seçildi` 
                    : 'Dosya seçilmedi'}
                </span>
              </div>
              <label htmlFor="additional-upload" className="nvd-upload-button">
                Görselleri Ekle
              </label>
              <input
                id="additional-upload"
                type="file"
                accept=".svg,.png,.jpg,.jpeg"
                multiple
                onChange={handleAdditionalImagesUpload}
                className="nvd-upload-input"
              />
            </div>

            {formData.additionalImages.length > 0 && (
              <div className="nvd-uploaded-section">
                <h4 className="nvd-uploaded-title">Eklenen Görseller</h4>
                <div className="nvd-image-grid">
                  {formData.additionalImages.map((image) => (
                    <div key={image.id} className="nvd-uploaded-item">
                      <div className="nvd-image-preview">
                        <img 
                          src={image.preview} 
                          alt={`Ek görsel`}
                          className="nvd-preview-image"
                        />
                      </div>
                      <div className="nvd-file-info">
                        <span className="nvd-file-name">{image.name}</span>
                        <button className="nvd-delete-button" onClick={() => removeAdditionalImage(image.id)}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1L9 9M9 1L1 9" stroke="#C50000" strokeWidth="1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="nvd-submit-section">
        {error && <div className="table-error">{error}</div>}
        {success && <div className="table-error" style={{ color: '#067647', background: '#ecfdf3' }}>{success}</div>}
        <button className="nvd-submit-button" onClick={handleSubmit} disabled={saving}>
          <span>{saving ? 'Kaydediliyor...' : (isEditMode ? 'Aracı Güncelle' : 'Aracı Tanımla')}</span>
          <svg className="nvd-submit-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF"/>
            <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NewVehicleDefinition; 