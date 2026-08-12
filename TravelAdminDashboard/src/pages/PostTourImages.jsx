import React, { useEffect, useRef, useState } from 'react';
import './PostTourImages.css';
import {
  deleteGalleryImageApi,
  fetchGalleryByTripApi,
  fetchTripByIdApi,
  uploadGalleryImageApi,
} from '../services/adminApi';
import { getSelectedSubTour, getSelectedTripId } from '../utils/selectionStorage';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const PostTourImages = ({ isSidebarCollapsed }) => {
  const [tripId, setTripId] = useState(getSelectedTripId());
  const [tourName, setTourName] = useState('');
  const [subTourDate, setSubTourDate] = useState('');
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const [fakeName, setFakeName] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const id = getSelectedTripId();
      setTripId(id);

      const sub = getSelectedSubTour();
      if (sub) {
        setSubTourDate(sub.date || '');
      }

      if (!id) {
        setError('Tur seçimi bulunamadı. Lütfen tur detaylarından tekrar deneyin.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [trip, gallery] = await Promise.all([
          fetchTripByIdApi(id),
          fetchGalleryByTripApi(id),
        ]);
        if (!alive) return;
        setTourName(trip?.title || trip?.name || 'Tur');
        setImages((Array.isArray(gallery) ? gallery : []).map((item) => ({
          id: item.id,
          name: item.caption || 'gorsel.png',
          url: item.imageUrl,
          persisted: true,
        })));
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Görseller yüklenemedi.');
        setImages([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  const addFromPicker = () => inputRef.current?.click();

  const stageFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    try {
      const staged = await Promise.all(files.map(async (f) => ({
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        url: await readFileAsDataUrl(f),
        file: f,
        persisted: false,
      })));
      setPendingFiles((prev) => [...prev, ...staged]);
      setImages((prev) => [...prev, ...staged]);
      setFakeName(files[0]?.name || '');
    } catch {
      setError('Görsel okunamadı.');
    }
  };

  const onPicked = (e) => {
    stageFiles(e.target.files);
    e.target.value = '';
  };

  const addFromText = () => {
    if (!fakeName.trim()) return;
    const url = '/icons/image-picture-icon.svg';
    const item = { id: `pending-${Date.now()}`, name: fakeName.trim(), url, persisted: false, externalUrl: fakeName.trim() };
    setPendingFiles((prev) => [...prev, item]);
    setImages((prev) => [...prev, item]);
    setFakeName('');
  };

  const removeImg = async (img) => {
    if (img.persisted) {
      try {
        await deleteGalleryImageApi(img.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
        return;
      }
    } else {
      setPendingFiles((prev) => prev.filter((x) => x.id !== img.id));
    }
    setImages((prev) => prev.filter((x) => x.id !== img.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(img.id);
      return next;
    });
  };

  const removeSelected = async () => {
    if (!selected.size) return;
    const targets = images.filter((x) => selected.has(x.id));
    for (const img of targets) {
      await removeImg(img);
    }
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(images.map((x) => x.id)));
  const clearSelection = () => setSelected(new Set());

  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    stageFiles(e.dataTransfer?.files);
  };

  const saveAll = async () => {
    if (!tripId) {
      alert('Tur seçimi bulunamadı.');
      return;
    }

    const toUpload = pendingFiles.length
      ? pendingFiles
      : images.filter((img) => !img.persisted);

    if (!toUpload.length) {
      window.location.hash = encodeURIComponent('Alt Tur Detayları');
      return;
    }

    setSaving(true);
    setError('');
    try {
      for (const item of toUpload) {
        await uploadGalleryImageApi({
          tripId,
          imageUrl: item.externalUrl || item.url,
          caption: item.name || null,
        });
      }
      setPendingFiles([]);
      window.location.hash = encodeURIComponent('Alt Tur Detayları');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görseller kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const displayDate = subTourDate || '-';
  const displayName = tourName || 'Tur';

  return (
    <div className={`pti-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="pti-wrap">
        <h2 className="pti-title">“{displayDate} - {displayName}” Tur Sonu Görseller</h2>
        <div className="pti-sub">
          Bu alanda yapılacak işlemler sadece {displayDate} tarihinde planlanan “{displayName}” için gerçekleştirilecektir.
        </div>
        {error && <div className="pti-sub" style={{ color: '#DC2626' }}>{error}</div>}

        <div className="pti-card">
          <div className="pti-field">
            <label className="pti-label">Tur Sonundan Görseller Ekle</label>
            <div className="pti-input-row">
              <input className="pti-input" placeholder="fotograf_1.png veya görsel URL" value={fakeName} onChange={(e) => setFakeName(e.target.value)} />
              <button className="pti-add" onClick={addFromText}>Görsel Ekle</button>
              <button className="pti-add" onClick={addFromPicker}>Dosyadan Seç</button>
              <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onPicked} />
            </div>
          </div>

          <div className={`pti-grid-wrap ${dragOver ? 'drag-over' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <div className="pti-grid-title">Eklenen Görseller</div>

            <div className="pti-toolbar">
              <div className="pti-count">{images.length} görsel</div>
              <div className="pti-spacer" />
              <button className="pti-btn" onClick={selectAll}>Tümünü Seç</button>
              <button className="pti-btn" onClick={clearSelection}>Seçimi Kaldır</button>
              <button className="pti-btn danger" onClick={removeSelected} disabled={!selected.size}>Seçilenleri Sil</button>
            </div>

            {loading && <div className="pti-drop-hint">Görseller yükleniyor...</div>}

            {!loading && images.length === 0 && (
              <div className="pti-drop-hint">Görselleri buraya sürükleyip bırakın ya da "Dosyadan Seç" ile yükleyin.</div>
            )}

            <div className="pti-grid">
              {images.map((img) => (
                <div key={img.id} className={`pti-item ${selected.has(img.id) ? 'selected' : ''}`} onClick={() => toggleSelect(img.id)}>
                  <div className="pti-thumb"><img src={img.url} alt="görsel" /></div>
                  <div className="pti-check" aria-hidden>{selected.has(img.id) ? '✓' : ''}</div>
                  <div className="pti-meta" onClick={(e) => e.stopPropagation()}>
                    <span className="pti-name">{img.name || 'gorsel.png'}</span>
                    <button className="pti-del" onClick={() => removeImg(img)} title="Sil">
                      <img src="/icons/delete-button-icon.svg" alt="Sil" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pti-actions">
            <button className="pti-save" onClick={saveAll} disabled={saving || loading}>
              {saving ? 'Kaydediliyor...' : 'Görselleri Kaydet ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostTourImages;
