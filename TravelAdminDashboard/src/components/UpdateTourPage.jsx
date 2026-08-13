import React, { useEffect, useState } from 'react';
import AddTourStep2 from './AddTourStep2';
import AddTourStep3 from './AddTourStep3';
import AddTourStep3Hotel from './AddTourStep3Hotel';
import AddTourStep4 from './AddTourStep4';
import AddTourStep5 from './AddTourStep5';
import AddTourStep6 from './AddTourStep6';
import ProgressSteps from './ProgressSteps';
import { fetchTripByIdApi, updateTripApi } from '../services/adminApi';
import { useFeedback } from './feedback/feedbackContext';
import {
  buildUpdateTripPayload,
  getTripIdFromStorage,
  mapApiTripToFormData,
  normalizeSelectedTour,
} from '../utils/tripPayload';

const UpdateTourPage = ({ initialData }) => {
  const { notify } = useFeedback();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTour, setSelectedTour] = useState(initialData || null);
  const [formData, setFormData] = useState({
    tourName: '',
    tourDescription: '',
    category: '',
    tags: [],
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    const loadTrip = async () => {
      try {
        setLoading(true);
        setLoadError('');

        if (initialData) {
          const normalized = normalizeSelectedTour(initialData);
          setSelectedTour(normalized);
          setFormData(mapApiTripToFormData(normalized.raw));
          return;
        }

        let stored = null;
        try {
          const raw = localStorage.getItem('selectedTour');
          stored = raw ? JSON.parse(raw) : null;
        } catch {
          stored = null;
        }

        const tripId = getTripIdFromStorage(stored);
        if (!tripId) {
          setLoadError('Güncellenecek tur bulunamadı.');
          return;
        }

        const trip = await fetchTripByIdApi(tripId);
        if (!active) return;

        const normalized = normalizeSelectedTour(trip);
        setSelectedTour(normalized);
        setFormData(mapApiTripToFormData(trip));
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Tur bilgileri yüklenemedi.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTrip();
    return () => { active = false; };
  }, [initialData]);

  const [changedSteps, setChangedSteps] = useState([]);
  const markChanged = (stepId) => setChangedSteps((arr)=> arr.includes(stepId) ? arr : [...arr, stepId]);

  const commonProps = { formData, setFormData };

  if (loading) {
    return (
      <div className="add-tour-page">
        <div className="add-tour-container">
          <p style={{ padding: 24 }}>Tur bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="add-tour-page">
        <div className="add-tour-container">
          <p style={{ padding: 24, color: '#b42318' }}>{loadError}</p>
        </div>
      </div>
    );
  }

  switch(currentStep){
  case 2: return <AddTourStep2 {...commonProps} updateMode={true} updatedStep={currentStep} onNext={()=>setCurrentStep(3)} onBack={()=>setCurrentStep(1)} />;
  case 3: return <AddTourStep3Hotel {...commonProps} updateMode={true} updatedStep={currentStep} onNext={()=>setCurrentStep(4)} onBack={()=>setCurrentStep(2)} />;
  case 4: return <AddTourStep3 {...commonProps} updateMode={true} updatedStep={currentStep} onNext={()=>setCurrentStep(5)} onBack={()=>setCurrentStep(3)} />;
  case 5: return <AddTourStep4 {...commonProps} updateMode={true} updatedStep={currentStep} onNext={()=>setCurrentStep(6)} onBack={()=>setCurrentStep(4)} />;
  case 6: return <AddTourStep5 {...commonProps} updateMode={true} updatedStep={currentStep} onNext={()=>setCurrentStep(7)} onBack={()=>setCurrentStep(5)} />;
  case 7: return <AddTourStep6 {...commonProps} updateMode={true} updatedStep={currentStep} submitLabel={saving ? 'Güncelleniyor...' : 'Formu Güncelle'} isSubmitting={saving} onNext={async ()=>{
      try {
        const tripId = getTripIdFromStorage(selectedTour);
        if (!tripId) {
          notify('Güncellenecek tur bulunamadı.', 'error');
          return;
        }

        setSaving(true);
        const payload = buildUpdateTripPayload(formData, selectedTour);
        const updated = await updateTripApi(tripId, payload);
        try {
          localStorage.setItem('selectedTour', JSON.stringify(normalizeSelectedTour(updated)));
        } catch {
          // ignore storage errors
        }
        window.location.hash = encodeURIComponent('Tur Detayları');
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Tur güncellenemedi.', 'error');
      } finally {
        setSaving(false);
      }
    }} onBack={()=>setCurrentStep(6)} />;
    default:
      return (
        <div className="add-tour-page">
          <div className="add-tour-container">
            <div className="add-tour-content">
              <div className="progress-steps-container">
                <ProgressSteps currentStep={currentStep} changedSteps={changedSteps} updateMode={true} updatedStep={currentStep} />
              </div>
              <div className="tour-page-form-section">
                <div className="tour-page-form-container">
                  <div className="tour-page-form-group">
                    <label>Tur Adı</label>
                    <input className="form-input" value={formData.tourName} onChange={(e)=>{setFormData({...formData, tourName:e.target.value}); markChanged(1);}} />
                    <label>Tur Detaylı Açıklama</label>
                    <textarea className="form-textarea" value={formData.tourDescription} onChange={(e)=>{setFormData({...formData, tourDescription:e.target.value}); markChanged(1);}} />
                  </div>
                  <div className="form-actions">
                    <button className="save-continue-btn" onClick={()=>setCurrentStep(2)}>Kaydet ve Devam Et</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default UpdateTourPage;
