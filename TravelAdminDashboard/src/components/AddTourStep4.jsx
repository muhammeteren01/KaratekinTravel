import React, { useState } from 'react';
import './AddTourStep4.css';
import ProgressSteps from './ProgressSteps';
import imagePictureIcon from '../assets/icons/image-picture-icon.svg';
import MediaThumbCard from './media/MediaThumbCard';
import ChipTag from './pricing/ChipTag';
import helpCircleIcon from '../assets/icons/help-circle-icon.svg';
import { useFeedback } from './feedback/feedbackContext';
import {
  MAX_GALLERY_IMAGES,
  filterImageFiles,
  readFileAsDataUrl,
  toGalleryItems,
  validateSingleImage,
} from '../utils/imageUpload';

const AddTourStep4 = ({ onNext, onBack, formData, setFormData, updateMode = false, updatedStep = null }) => {
  const { notify } = useFeedback();
  const [coverImage, setCoverImage] = useState(formData.step4?.coverImage || null);
  const [additionalImages, setAdditionalImages] = useState(formData.step4?.additionalImages || []);
  const [includedItems, setIncludedItems] = useState(formData.step4?.includedItems || []);
  const [excludedItems, setExcludedItems] = useState(formData.step4?.excludedItems || []);
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [newExcludedItem, setNewExcludedItem] = useState('');
  const [specialDescription, setSpecialDescription] = useState(formData.step4?.specialDescription || '');

  // Don't cleanup object URLs immediately - keep them for other steps
  // useEffect(() => {
  //   return () => {
  //     if (coverImage?.preview) {
  //       URL.revokeObjectURL(coverImage.preview);
  //     }
  //     additionalImages.forEach(image => {
  //       if (image.preview) {
  //         URL.revokeObjectURL(image.preview);
  //       }
  //     });
  //   };
  // }, [coverImage, additionalImages]);

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files?.[0];
    // Girdi hemen sıfırlanıyor; aksi halde aynı dosya ikinci kez seçilemiyor.
    event.target.value = '';

    if (!validateSingleImage(file, { notify })) return;

    try {
      setCoverImage({ file, name: file.name, preview: await readFileAsDataUrl(file) });
    } catch {
      notify('Görsel okunamadı.', 'error');
    }
  };

  /**
   * Ek görseller tek seferde çoklu seçilebiliyor.
   *
   * Önceden yalnızca `files[0]` okunuyordu: kullanıcı birden fazla fotoğraf
   * seçse bile yalnızca ilki ekleniyor, geri kalanı sessizce düşüyordu.
   */
  const handleAdditionalImageUpload = async (event) => {
    const files = event.target.files;
    event.target.value = '';

    const accepted = filterImageFiles(files, {
      notify,
      remainingSlots: MAX_GALLERY_IMAGES - additionalImages.length,
    });
    if (!accepted.length) return;

    try {
      const images = await toGalleryItems(accepted);
      setAdditionalImages((prev) => [...prev, ...images]);
    } catch {
      notify('Görseller okunamadı.', 'error');
    }
  };

  const removeImage = (imageId, isCover = false) => {
    if (isCover) {
      if (coverImage?.preview) {
        URL.revokeObjectURL(coverImage.preview);
      }
      setCoverImage(null);
    } else {
      const imageToRemove = additionalImages.find(img => img.id === imageId);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      setAdditionalImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const addIncludedItem = () => {
    if (newIncludedItem.trim()) {
      setIncludedItems(prev => [...prev, newIncludedItem.trim()]);
      setNewIncludedItem('');
    }
  };

  const addExcludedItem = () => {
    if (newExcludedItem.trim()) {
      setExcludedItems(prev => [...prev, newExcludedItem.trim()]);
      setNewExcludedItem('');
    }
  };

  const removeIncludedItem = (index) => {
    setIncludedItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeExcludedItem = (index) => {
    setExcludedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndContinue = () => {
    const step4Data = {
      coverImage,
      additionalImages,
      includedItems,
      excludedItems,
      specialDescription
    };

    setFormData(prev => ({
      ...prev,
      step4: step4Data
    }));

    onNext();
  };

  return (
    <div className="step4-container">
      <div className="step4-content">
        {/* Progress Steps */}
        <div className="step4-progress-section">
          <ProgressSteps currentStep={5} updateMode={updateMode} updatedStep={updatedStep} />
        </div>

        {/* Main Content */}
        <div className="step4-main-content">
          {/* Cover Image Section */}
          <div className="step4-form-section">
            <div className="step4-section-header">
              <div className="step4-label-with-help">
                <label className="step4-section-label">Kapak Fotoğrafı Yükle</label>
                <img src={helpCircleIcon} alt="Help" className="step4-help-icon" />
              </div>
              <p className="step4-section-description">
                Kapak fotoğrafı .svg veya .png uzantılı kare boyutlu olması tavsiye edilmektedir.
              </p>
            </div>

            <div className="step4-upload-section">
              <div className="step4-upload-row">
                <div className="step4-upload-input-container">
                  <img src={imagePictureIcon} alt="Upload" className="step4-upload-icon" />
                  <span className="step4-upload-filename">
                    {coverImage ? coverImage.name : 'kapak_foto.svg'}
                  </span>
                </div>
                <label htmlFor="cover-upload" className="step4-upload-button">
                  Görseli Ekle
                </label>
                <input
                  id="cover-upload"
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg"
                  onChange={handleCoverImageUpload}
                  className="step4-upload-input"
                />
              </div>

              {/* Cover Image Preview */}
              {coverImage && (
                <div className="step4-uploaded-section">
                  <h3 className="step4-uploaded-title">Eklenen Görsel</h3>
                  <div className="media-grid">
                    <MediaThumbCard image={coverImage} badge="Kapak" onRemove={() => removeImage(null, true)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Images Section */}
          <div className="step4-form-section">
            <div className="step4-section-header">
              <label className="step4-section-label">Ek Fotoğraflar Ekle</label>
              <p className="step4-section-description">
                Tur detayları kısmında kullanıcı ekleyeceğiniz fotoğrafları görecektir.
              </p>
            </div>

            <div className="step4-upload-section">
              <div className="step4-upload-row">
                <div className="step4-upload-input-container">
                  <img src={imagePictureIcon} alt="Upload" className="step4-upload-icon" />
                  <span className="step4-upload-filename">fotograf_1.png</span>
                </div>
                <label htmlFor="additional-upload" className="step4-upload-button">
                  Görseli Ekle
                </label>
                <input
                  id="additional-upload"
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg"
                  multiple
                  onChange={handleAdditionalImageUpload}
                  className="step4-upload-input"
                />
              </div>

              {/* Additional Images Preview */}
              {additionalImages.length > 0 && (
                <div className="step4-uploaded-section">
                  <h3 className="step4-uploaded-title">Eklenen Görseller</h3>
                  <div className="media-grid">
                    {additionalImages.map((image) => (
                      <MediaThumbCard key={image.id} image={image} onRemove={() => removeImage(image.id)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="step4-form-section">
            <h2 className="step4-section-title">Ek Detaylar</h2>
            
            {/* Included Items */}
            <div className="step4-details-subsection">
              <div className="step4-section-header">
                <label className="step4-section-label">Tura Dahil Olanlar</label>
                <p className="step4-section-description">
                  Toplam tur ücretine dahil olan seçenekleri belirtiniz.
                </p>
              </div>

              <div className="step4-input-with-button">
                <input
                  type="text"
                  value={newIncludedItem}
                  onChange={(e) => setNewIncludedItem(e.target.value)}
                  placeholder="Örnek: Rehber"
                  className="step4-detail-input"
                />
                <button
                  onClick={addIncludedItem}
                  className="step4-add-button"
                  type="button"
                >
                  Ekle
                </button>
              </div>

              {includedItems.length > 0 && (
                <div className="step4-items-container">
                  <h3 className="step4-items-title">Eklenen Seçenekler</h3>
                  <div className="step4-items-list">
                    {includedItems.map((item, index) => (
                      <ChipTag key={`inc-${index}`} text={item} onRemove={() => removeIncludedItem(index)} tone="blue" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Excluded Items */}
            <div className="step4-details-subsection">
              <div className="step4-section-header">
                <label className="step4-section-label">Tur Dışında Olanlar</label>
                <p className="step4-section-description">
                  Toplam tur ücreti dışında olan seçenekleri belirtiniz.
                </p>
              </div>

              <div className="step4-input-with-button">
                <input
                  type="text"
                  value={newExcludedItem}
                  onChange={(e) => setNewExcludedItem(e.target.value)}
                  placeholder="Örnek: Rehber"
                  className="step4-detail-input"
                />
                <button
                  onClick={addExcludedItem}
                  className="step4-add-button"
                  type="button"
                >
                  Ekle
                </button>
              </div>

              {excludedItems.length > 0 && (
                <div className="step4-items-container">
                  <h3 className="step4-items-title">Eklenen Seçenekler</h3>
                  <div className="step4-items-list">
                    {excludedItems.map((item, index) => (
                      <ChipTag key={`exc-${index}`} text={item} onRemove={() => removeExcludedItem(index)} tone="blue" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Special Description */}
            <div className="step4-details-subsection">
              <label className="step4-section-label">Özel Açıklama Belirt</label>
              <textarea
                value={specialDescription}
                onChange={(e) => setSpecialDescription(e.target.value)}
                placeholder="Tur Hakkında Özel Açıklama"
                className="step4-description-textarea"
                rows="4"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="step4-form-actions">
            <button 
              type="button" 
              className="step4-back-button"
              onClick={onBack}
            >
              Geri
            </button>
            
            <button
              onClick={handleSaveAndContinue}
              className="step4-save-continue-btn"
              type="button"
            >
              Kaydet ve Devam Et
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTourStep4; 