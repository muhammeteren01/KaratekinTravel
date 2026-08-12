import React, { useRef, useState, useEffect } from 'react';
import './NewHotelDraft.css';
import { createHotelApi, deleteHotelApi, fetchHotelByIdApi, updateHotelApi } from '../services/adminApi';
import { clearSelectedHotel, getSelectedHotel, setSelectedHotel } from '../utils/selectionStorage';

const Checkbox = ({ label, checked, onChange }) => (
  <label className="nhd-checkbox">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const parseDetailsJson = (raw) => {
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
};

const defaultForm = () => ({
  name: '',
  website: '',
  city: '',
  district: '',
  address: '',
  category: '',
  capacities: { one: true, two: false, three: false, four: false, fivePlus: false },
  features: { klima: true, tv: false, wifi: false, balkon: false, minibar: true },
});

// Görseller base64 olarak API'ye gidiyor; büyük dosya hem isteği hem satırı
// şişiriyor. Diğer yükleme ekranlarıyla aynı sınır uygulanıyor.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function rejectOversized(files) {
  const tooBig = files.filter((f) => f.size > MAX_IMAGE_BYTES);
  if (tooBig.length) {
    alert(`En fazla 5MB yükleyebilirsiniz. Çok büyük: ${tooBig.map((f) => f.name).join(', ')}`);
  }
  return files.filter((f) => f.size <= MAX_IMAGE_BYTES);
}

const NewHotelDraft = () => {
  const [hotelId, setHotelId] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [images, setImages] = useState([]);
  const [lastFileName, setLastFileName] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  const [extraText, setExtraText] = useState('');
  const [extraChecked, setExtraChecked] = useState(true);
  const [extraFeatures, setExtraFeatures] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Butik Otel', 'Pansiyon', 'Apart Otel', 'Bungalov / Dağ Evi', '3 Yıldızlı Otel', '4 Yıldızlı Otel', '5+ Yıldızlı Otel'];

  useEffect(() => {
    let alive = true;

    const loadHotel = async () => {
      try {
        setInitialLoading(true);
        setError('');
        const selected = getSelectedHotel();

        const id = selected?.id;
        if (!id) {
          if (alive) setInitialLoading(false);
          return;
        }

        const hotel = selected?.name ? selected : await fetchHotelByIdApi(id);
        if (!alive) return;

        const details = parseDetailsJson(hotel.detailsJson) || {};
        setHotelId(hotel.id);
        setForm({
          name: hotel.name || '',
          website: hotel.website || '',
          city: hotel.city || '',
          district: hotel.district || '',
          address: hotel.address || '',
          category: hotel.category || '',
          capacities: details.capacities || defaultForm().capacities,
          features: details.features || defaultForm().features,
        });
        setExtraFeatures(Array.isArray(details.extraFeatures) ? details.extraFeatures : []);
        if (hotel.image) {
          setImages([{ id: 'existing', name: 'otel-gorseli', url: hotel.image, persisted: true }]);
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Otel bilgileri yüklenemedi.');
      } finally {
        if (alive) setInitialLoading(false);
      }
    };

    loadHotel();

    return () => {
      alive = false;
    };
  }, []);

  const handleFile = async (e) => {
    const files = rejectOversized(Array.from(e.target.files || []));
    if (!files.length) return;
    try {
      const slice = files.slice(0, 9 - images.length);
      const next = await Promise.all(slice.map(async (f, idx) => ({
        id: Date.now() + idx,
        name: f.name,
        url: await readFileAsDataUrl(f),
        file: f,
      })));
      setImages((prev) => [...prev, ...next]);
      setLastFileName(files[0]?.name || '');
    } catch {
      setError('Görsel okunamadı.');
    }
    e.target.value = '';
  };

  const removeImg = (id) => setImages((prev) => prev.filter((i) => i.id !== id));

  const buildPayload = (isDraft) => ({
    name: form.name.trim(),
    website: form.website.trim() || null,
    city: form.city.trim() || null,
    district: form.district.trim() || null,
    address: form.address.trim() || null,
    category: form.category || null,
    image: images[0]?.url || null,
    detailsJson: JSON.stringify({
      capacities: form.capacities,
      features: form.features,
      extraFeatures,
    }),
    isDraft,
  });

  const saveDraft = async () => {
    if (!form.name.trim()) {
      alert('Otel adı zorunludur.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = buildPayload(true);
      if (hotelId) {
        await updateHotelApi(hotelId, payload);
      } else {
        const created = await createHotelApi(payload);
        setHotelId(created.id);
        setSelectedHotel(created);
      }
      alert('Taslak kaydedildi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hotelId) return;
    const ok = window.confirm('Bu otel kaydını silmek istediğinize emin misiniz?');
    if (!ok) return;
    setSaving(true);
    setError('');
    try {
      await deleteHotelApi(hotelId);
      clearSelectedHotel();
      window.location.hash = encodeURIComponent('Otel Taslakları');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!catRef.current) return;
      if (!catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (initialLoading) {
    return (
      <div className="nhd">
        <div className="nhd-card">
          <div className="nhd-section-title">Otel bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nhd">
      <div className="nhd-card">
        <div className="nhd-section-title">{hotelId ? 'Otel Bilgilerini Güncelle' : 'Otel Bilgileri'}</div>
        {error && <p className="nhd-help" style={{ color: '#DC2626' }}>{error}</p>}

        <div className="nhd-grid">
          <div className="nhd-field"><label>Otel Adı*</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="nhd-field"><label>Web Sayfası</label><input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} /></div>
          <div className="nhd-field"><label>Şehir*</label><input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
          <div className="nhd-field"><label>İlçe*</label><input value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} /></div>
          <div className="nhd-field nhd-col-2"><label>Açık Adres*</label><input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
        </div>

        <div className="nhd-row nhd-gap">
          <div className="nhd-col">
            <label className="nhd-label">Otel Kategorisi*</label>
            <div className="nhd-cat" ref={catRef}>
              <div className={`nhd-cat-combobox ${catOpen ? 'open' : ''}`} role="button" tabIndex={0} onClick={() => setCatOpen((o) => !o)}>
                <span className="nhd-cat-icon" aria-hidden></span>
                <input className="nhd-cat-input" placeholder="Kategori Seçiniz" value={form.category} readOnly />
                <span className={`nhd-cat-chevron ${catOpen ? 'open' : ''}`} aria-hidden></span>
              </div>
              {catOpen && (
                <div className="nhd-cat-dropdown" role="listbox">
                  {categories.map((c) => (
                    <div
                      key={c}
                      className={`nhd-cat-option ${form.category === c ? 'selected' : ''}`}
                      role="option"
                      aria-selected={form.category === c}
                      onClick={() => { setForm((f) => ({ ...f, category: c })); setCatOpen(false); }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="nhd-col">
            <label className="nhd-label">Odaların Kişi Kapasiteleri*</label>
            <div className="nhd-checks">
              <Checkbox label="1 Kişilik" checked={form.capacities.one} onChange={(v) => setForm((f) => ({ ...f, capacities: { ...f.capacities, one: v } }))} />
              <Checkbox label="2 Kişilik" checked={form.capacities.two} onChange={(v) => setForm((f) => ({ ...f, capacities: { ...f.capacities, two: v } }))} />
              <Checkbox label="3 Kişilik" checked={form.capacities.three} onChange={(v) => setForm((f) => ({ ...f, capacities: { ...f.capacities, three: v } }))} />
              <Checkbox label="4 Kişilik" checked={form.capacities.four} onChange={(v) => setForm((f) => ({ ...f, capacities: { ...f.capacities, four: v } }))} />
              <Checkbox label="5+ Kişilik" checked={form.capacities.fivePlus} onChange={(v) => setForm((f) => ({ ...f, capacities: { ...f.capacities, fivePlus: v } }))} />
            </div>
          </div>
          <div className="nhd-col">
            <label className="nhd-label">Odada Bulunan Özellikler</label>
            <div className="nhd-checks">
              <Checkbox label="Klima" checked={form.features.klima} onChange={(v) => setForm((f) => ({ ...f, features: { ...f.features, klima: v } }))} />
              <Checkbox label="Televizyon" checked={form.features.tv} onChange={(v) => setForm((f) => ({ ...f, features: { ...f.features, tv: v } }))} />
              <Checkbox label="İnternet / Wi-Fi" checked={form.features.wifi} onChange={(v) => setForm((f) => ({ ...f, features: { ...f.features, wifi: v } }))} />
              <Checkbox label="Balkon" checked={form.features.balkon} onChange={(v) => setForm((f) => ({ ...f, features: { ...f.features, balkon: v } }))} />
              <Checkbox label="Mini Buzdolabı" checked={form.features.minibar} onChange={(v) => setForm((f) => ({ ...f, features: { ...f.features, minibar: v } }))} />
              {extraFeatures.map((it) => (
                <Checkbox
                  key={it.id}
                  label={it.name}
                  checked={it.checked}
                  onChange={(v) => setExtraFeatures((list) => list.map((x) => (x.id === it.id ? { ...x, checked: v } : x)))}
                />
              ))}
            </div>
            <div className="nhd-extra-row">
              <label className="nhd-checkbox nhd-checkbox--small">
                <input type="checkbox" checked={extraChecked} onChange={(e) => setExtraChecked(e.target.checked)} />
              </label>
              <input className="nhd-extra-input" placeholder="Farklı Özellik Ekle" value={extraText} onChange={(e) => setExtraText(e.target.value)} />
              <button
                type="button"
                className="nhd-extra-add"
                onClick={() => {
                  const name = extraText.trim();
                  if (!name) return;
                  setExtraFeatures((list) => [...list, { id: Date.now(), name, checked: extraChecked }]);
                  setExtraText('');
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="nhd-media">
          <div className="nhd-media-left">
            <h3 className="nhd-media-title">Fotoğraf Ekle</h3>
            <p className="nhd-help">Otele ait ekleyacağınız görseller, tur detaylarındaki otel bilgileri ekranında kullanıcılar tarafından görüntülecektir.</p>
            <div className="nhd-file-input-wrap">
              <input className="nhd-file-name" placeholder="gorsel.png" value={lastFileName} readOnly />
            </div>
            <label className="nhd-upload-btn">
              Görseli Ekle
              <input type="file" accept="image/*" multiple onChange={handleFile} hidden />
            </label>
          </div>
          <div className="nhd-media-right">
            <div className="nhd-right-card">
              <div className="nhd-right-title">Eklenen Görseller</div>
              <div className="nhd-thumbs">
                {images.map((img) => (
                  <div key={img.id} className="nhd-thumb">
                    <img src={img.url} alt={img.name} />
                    <div className="nhd-thumb-footer">
                      <span className="nhd-thumb-name">{img.name}</span>
                      <button className="nhd-thumb-delbtn" onClick={() => removeImg(img.id)}>
                        <img src="/icons/delete-button-icon.svg" alt="sil" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="nhd-actions">
          {hotelId && (
            <button type="button" className="nhd-save" style={{ background: '#EF4444', marginRight: 12 }} onClick={handleDelete} disabled={saving}>
              Kaydı Sil
            </button>
          )}
          <button className="nhd-save" onClick={saveDraft} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Taslağı Kaydet ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewHotelDraft;
