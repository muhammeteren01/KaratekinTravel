import React, { useEffect, useMemo, useState } from 'react';
import './AddTourPage.css';
import ProgressSteps from './ProgressSteps';
import FormField from './FormField';
import TagInput from './TagInput';
import SuccessNotification from './SuccessNotification';
import Button from './Button';
import AddTourStep2 from './AddTourStep2';
import AddTourStep3 from './AddTourStep3';
import AddTourStep3Hotel from './AddTourStep3Hotel';
import AddTourStep4 from './AddTourStep4';
import AddTourStep5 from './AddTourStep5';
import AddTourStep6 from './AddTourStep6';
import TourCreationSuccess from './TourCreationSuccess';
import { useFeedback } from './feedback/feedbackContext';
import {
  createTripApi,
  createTripDepartureApi,
  fetchCompaniesApi,
  getAdminToken,
  setAdminToken,
  uploadGalleryImageApi,
} from '../services/adminApi';
import {
  buildCreateTripPayload,
  getStep3Data,
  normalizeSelectedTour,
  parseTurkishDateTime,
} from '../utils/tripPayload';

const AddTourPage = () => {
  const { notify } = useFeedback();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiToken, setApiToken] = useState(() => getAdminToken() || '');
  const [formData, setFormData] = useState({
    companyId: '',
    tourName: '',
    tourDescription: '',
    category: '',
    tags: []
  });

  useEffect(() => {
    setAdminToken(apiToken);
  }, [apiToken]);

  useEffect(() => {
    let active = true;

    const loadCompanies = async () => {
      try {
        setCompanyError('');
        const list = await fetchCompaniesApi();
        if (!active) return;

        const normalized = Array.isArray(list) ? list : [];
        setCompanies(normalized);

        // Varsayılan şirketi yalnızca kullanıcı henüz seçim yapmadıysa ata.
        // formData.companyId'yi doğrudan okumak effect'i şirket her değiştiğinde
        // yeniden çalıştırırdı; güncel değeri updater içinden okuyoruz.
        if (normalized[0]?.id) {
          setFormData((prev) =>
            prev.companyId
              ? prev
              : { ...prev, companyId: String(normalized[0].id) },
          );
        }
      } catch (error) {
        if (!active) return;
        setCompanies([]);
        setCompanyError(
          error instanceof Error
            ? error.message
            : 'Şirket listesi yüklenemedi. Şirket ID alanını manuel doldurun.',
        );
      }
    };

    loadCompanies();

    return () => {
      active = false;
    };
  }, []);



  const categoryOptions = [
    { value: 'kultur', label: 'Kültür Turu' },
    { value: 'doga', label: 'Doğa Turu' },
    { value: 'macera', label: 'Macera Turu' },
    { value: 'tarih', label: 'Tarihi Tur' },
    { value: 'gastronomi', label: 'Gastronomi Turu' }
  ];

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: String(company.id),
        label: company.name,
      })),
    [companies],
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadGalleryImages = async (tripId) => {
    const cover = formData.step4?.coverImage;
    const additionalImages = formData.step4?.additionalImages || [];
    const urls = [
      cover?.preview || cover?.name,
      ...additionalImages.map((img) => img.preview || img.name),
    ].filter(Boolean);

    const uploads = urls.map((imageUrl, index) =>
      uploadGalleryImageApi({
        tripId,
        imageUrl,
        caption: index === 0 ? formData.tourName || 'Kapak' : formData.tourName || null,
      }).catch(() => null),
    );
    if (uploads.length) await Promise.all(uploads);
  };

  const createInitialDeparture = async (tripId, payload) => {
    const step3 = getStep3Data(formData);
    const firstHotel = formData.hotels?.[0];
    const departureDate =
      parseTurkishDateTime(firstHotel?.checkIn) ||
      payload.dateStart ||
      new Date().toISOString();
    const price = Number(String(step3.tourPrice || '').replace(/[^\d.,]/g, '').replace(',', '.')) || null;
    const vehicle = step3.selectedVehicles?.[0];

    if (!departureDate && !price && !vehicle) return;

    await createTripDepartureApi({
      tripId,
      vehicleId: vehicle?.id || null,
      departureDate,
      price,
      currency: 'TRY',
      capacity: payload.capacity,
      status: 'active',
    });
  };

  const handleCreateTour = async () => {
    try {
      setIsSubmitting(true);
      const payload = buildCreateTripPayload(formData);
      const createdTrip = await createTripApi(payload);

      const tripId = createdTrip?.id;
      if (tripId) {
        await Promise.all([
          uploadGalleryImages(tripId),
          createInitialDeparture(tripId, payload),
        ]);
      }

      try {
        localStorage.setItem('selectedTour', JSON.stringify(normalizeSelectedTour(createdTrip)));
      } catch {
        // Ignore storage issues; the backend result is still valid.
      }

      setShowSuccess(true);
      setCurrentStep(8);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tur kaydedilemedi.';
      notify(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndContinue = () => {
    // Validate required fields
    if (!formData.tourName || !formData.tourDescription || !formData.category) {
      notify('Lütfen tüm zorunlu alanları doldurun.', 'warning');
      return;
    }

  // Show success (no delay)
  setShowSuccess(true);


  // Move to next step immediately (remove artificial delay)
  setCurrentStep(2);
  };

  const handleStep2Next = () => {

  setShowSuccess(true);
  setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleHotelNext = () => {

    setShowSuccess(true);
    setCurrentStep(4);
  };

  const handleHotelBack = () => {
    setCurrentStep(2);
  };

  const handleStep3Next = () => {

    setShowSuccess(true);
    setCurrentStep(5);
  };

  const handleStep3Back = () => {
    setCurrentStep(3);
  };

  const handleStep4Next = () => {

  setShowSuccess(true);
  setCurrentStep(6);
  };

  const handleStep4Back = () => {
    setCurrentStep(4);
  };

  const handleStep5Next = () => {

  setShowSuccess(true);
    setCurrentStep(7); // Move to review step
  };

  const handleStep5Back = () => {
    setCurrentStep(5);
  };

  const handleCloseNotification = () => {
    setShowSuccess(false);
  };

  // Render different steps based on currentStep
  if (currentStep === 2) {
    return (
      <>
        <AddTourStep2 
          onNext={handleStep2Next}
          onBack={handleStep2Back}
          formData={formData}
          setFormData={setFormData}
        />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  if (currentStep === 3) {
    return (
      <>
        <AddTourStep3Hotel 
          onNext={handleHotelNext}
          onBack={handleHotelBack}
          formData={formData}
          setFormData={setFormData}
        />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  if (currentStep === 4) {
    return (
      <>
        <AddTourStep3 
          onNext={handleStep3Next}
          onBack={handleStep3Back}
          formData={formData}
          setFormData={setFormData}
        />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  if (currentStep === 5) {
    return (
      <>
        <AddTourStep4 
          onNext={handleStep4Next}
          onBack={handleStep4Back}
          formData={formData}
          setFormData={setFormData}
        />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  if (currentStep === 6) {
    return (
      <>
        <AddTourStep5 
          onNext={handleStep5Next}
          onBack={handleStep5Back}
          formData={formData}
          setFormData={setFormData}
        />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  if (currentStep === 7) {
    return (
      <>
        <AddTourStep6 
          onNext={handleCreateTour}
          onBack={() => setCurrentStep(6)}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
        />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  if (currentStep === 8) {
    return (
      <>
        <TourCreationSuccess />
        <SuccessNotification
          message="Form Kaydedildi!"
          isVisible={showSuccess}
          onClose={handleCloseNotification}
          autoClose={true}
          duration={2000}
        />
      </>
    );
  }

  return (
    <>
      <div className="add-tour-page">
        <div className="add-tour-container">
          <div className="add-tour-content">
            <div className="progress-steps-container">
              <ProgressSteps currentStep={currentStep} />
            </div>
            
                      <div className="tour-page-form-section">
            <div className="tour-page-form-container">
                <div className="tour-page-form-group">
                  <FormField
                    label="Şirket"
                    type={companyOptions.length > 0 ? 'select' : 'text'}
                    placeholder={companyOptions.length > 0 ? 'Şirket seçiniz' : 'Şirket ID giriniz'}
                    value={formData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                    options={companyOptions}
                    required
                    helperText={companyError || 'Tur oluşturmak için backend şirket kaydı gerekir.'}
                  />

                  <FormField
                    label="Tur Adı"
                    type="text"
                    placeholder="Turunuzun Adını Giriniz"
                    value={formData.tourName}
                    onChange={(e) => handleInputChange('tourName', e.target.value)}
                    required
                  />
                  
                  <FormField
                    label="Tur Detaylı Açıklama"
                    type="textarea"
                    placeholder="Tur Hakkında Detaylı Açıklama"
                    value={formData.tourDescription}
                    onChange={(e) => handleInputChange('tourDescription', e.target.value)}
                    required
                  />
                </div>
                
                <div className="tour-page-form-group">
                  <FormField
                    label="Kategori"
                    type="select"
                    placeholder="Tur Kategorisi"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    options={categoryOptions}
                    required
                  />
                  
                  <TagInput
                    label="Etiketler (örn doğa, balon vb.)"
                    placeholder="Etiketler"
                    value={formData.tags}
                    onChange={(tags) => handleInputChange('tags', tags)}
                  />

                  <FormField
                    label="Admin JWT"
                    type="password"
                    placeholder="JWT token giriniz"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    helperText="Bu token /api/trips oluşturma isteği için Authorization header olarak saklanır."
                  />
                </div>
                
                <div className="form-actions">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleSaveAndContinue}
                    className="save-continue-btn"
                    icon={
                      <svg width="7" height="14" viewBox="0 0 7 14" fill="none">
                        <path d="M1 1L6 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  >
                    Kaydet ve Devam Et
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SuccessNotification
        message="Form Kaydedildi!"
        isVisible={showSuccess}
        onClose={handleCloseNotification}
        autoClose={true}
        duration={3000}
      />
    </>
  );
};

export default AddTourPage; 