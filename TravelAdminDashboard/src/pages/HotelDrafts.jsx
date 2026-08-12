import React, { useMemo, useState, useRef, useEffect } from 'react';
import './TourManagement.css';
import './HotelDrafts.css';
import { deleteHotelApi, fetchHotelsApi } from '../services/adminApi';
import { clearSelectedHotel, setSelectedHotel } from '../utils/selectionStorage';

const PLACEHOLDER_IMAGE = '/icons/image-picture-icon.svg';

const HotelCard = ({ hotel, onEdit, onDelete }) => {
  return (
    <div className="hotel-card">
      <div className="hotel-card-media hd-media">
        <img
          src={hotel.image || PLACEHOLDER_IMAGE}
          alt={hotel.name}
          className="hd-media-img"
        />
      </div>
      <div className="hotel-card-body hd-body">
        <div className="hotel-card-title hd-title">{hotel.name}</div>
        <div className="hotel-card-sub hd-sub">{hotel.location}</div>
        <div className="hd-actions">
          <button type="button" className="hotel-details-chip" onClick={() => onEdit(hotel)}>Düzenle</button>
          <button type="button" className="hotel-details-chip" style={{ marginLeft: 8, background: '#EF4444' }} onClick={() => onDelete(hotel)} title="Sil">
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

const HotelDrafts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('Tümü');
  const [sortKey, setSortKey] = useState('Eklenme Tarihi (Yeni-Eski)');
  const [showProv, setShowProv] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toolbarRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!toolbarRef.current) return;
      if (!toolbarRef.current.contains(e.target)) {
        setShowProv(false);
        setShowSort(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    let alive = true;

    const loadHotels = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await fetchHotelsApi();
        if (!alive) return;
        const normalized = (Array.isArray(result) ? result : []).map((hotel) => ({
          id: hotel.id,
          name: hotel.name,
          location: [hotel.district, hotel.city].filter(Boolean).join(' / ') || '-',
          province: hotel.city || 'Diğer',
          createdAt: hotel.createdAt ? new Date(hotel.createdAt).getTime() : 0,
          image: hotel.image || PLACEHOLDER_IMAGE,
          raw: hotel,
        }));
        setHotels(normalized);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Oteller yüklenemedi.');
        setHotels([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadHotels();

    return () => {
      alive = false;
    };
  }, []);

  const provinces = useMemo(() => {
    const unique = [...new Set(hotels.map((h) => h.province).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
    return ['Tümü', ...unique];
  }, [hotels]);

  const filtered = useMemo(() => {
    let list = hotels;
    if (province !== 'Tümü') list = list.filter((h) => h.province === province);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((h) => (h.name + h.location).toLowerCase().includes(q));
    }
    switch (sortKey) {
      case 'Eklenme Tarihi (Eski-Yeni)':
        list = [...list].sort((a, b) => a.createdAt - b.createdAt);
        break;
      default:
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [hotels, province, search, sortKey]);

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage]
  );
  const goto = (p) => setPage(Math.min(Math.max(1, p), pageCount));

  const handleEdit = (hotel) => {
    setSelectedHotel(hotel.raw || hotel);
    window.location.hash = encodeURIComponent('Yeni Otel Ekle');
  };

  const handleDelete = async (hotel) => {
    const ok = window.confirm(`"${hotel.name}" otel kaydını silmek istediğinize emin misiniz?`);
    if (!ok) return;
    try {
      await deleteHotelApi(hotel.id);
      setHotels((prev) => prev.filter((item) => item.id !== hotel.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    }
  };

  return (
    <div className="tm-container hotel-drafts">
      <div className="tm-section-card">
        <div className="tm-header">
          <h2 className="tm-title">Sisteme Kayıtlı Otel Bilgileri</h2>
          <div className="tm-actions"></div>
        </div>
        <div className="tm-section-head">
          <div className="tm-section-subtitle">
            Sisteme, turlarınız için konaklama yapacağınız otel bilgilerini bir kere ekleyerek tüm turlarınızda hazır şablon olarak ekleyebilirsiniz.
          </div>
        </div>

        {error && <div className="tm-section-subtitle" style={{ color: '#DC2626' }}>{error}</div>}

        <div className="tm-toolbar hd-toolbar" ref={toolbarRef}>
          <div className="hd-chip-wrap">
            <button className="chip-tag gray sm" onClick={() => { setShowProv((v) => !v); setShowSort(false); }}>
              {province === 'Tümü' ? 'İl Bilgisi ile Filtrele' : `İl: ${province}`}
            </button>
            {showProv && (
              <div className="hd-dropdown">
                {provinces.map((p) => (
                  <div
                    key={p}
                    className={`hd-drop-item ${p === province ? 'active' : ''}`}
                    onClick={() => { setProvince(p); setShowProv(false); setPage(1); }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hd-chip-wrap">
            <button className="chip-tag gray sm" onClick={() => { setShowSort((v) => !v); setShowProv(false); }}>
              {sortKey.replace('Eklenme ', '')}
            </button>
            {showSort && (
              <div className="hd-dropdown">
                {['Eklenme Tarihi (Yeni-Eski)', 'Eklenme Tarihi (Eski-Yeni)'].map((s) => (
                  <div
                    key={s}
                    className={`hd-drop-item ${s === sortKey ? 'active' : ''}`}
                    onClick={() => { setSortKey(s); setShowSort(false); setPage(1); }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            className="tm-search hd-search"
            placeholder="Otel Arama..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="hd-toolbar-right">
            <button
              className="hd-add-btn"
              onClick={() => {
                clearSelectedHotel();
                window.location.hash = encodeURIComponent('Yeni Otel Ekle');
              }}
            >
              <img src="/icons/plus-icon.svg" alt="" width="16" height="16" />
              Yeni Otel Ekle
            </button>
          </div>
        </div>

        {loading ? (
          <div className="tm-section-subtitle">Oteller yükleniyor...</div>
        ) : (
          <div className="tm-grid hd-grid">
            {pageItems.map((h) => (
              <div key={h.id} className="tm-grid-item hd-grid-item">
                <HotelCard hotel={h} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            ))}
            {!pageItems.length && <div className="tm-section-subtitle">Kayıtlı otel bulunamadı.</div>}
          </div>
        )}

        <div className="tm-pagination hd-pagination">
          <button className="hd-nav hd-nav-prev" onClick={() => goto(currentPage - 1)} disabled={currentPage === 1}>
            <span className="hd-nav-icon">‹</span> Önceki
          </button>
          <div className="hd-pages">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                className={`${i + 1 === currentPage ? 'hd-page-active' : 'hd-page'}`}
                onClick={() => goto(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="hd-nav hd-nav-next" onClick={() => goto(currentPage + 1)} disabled={currentPage === pageCount}>
            Sonraki <span className="hd-nav-icon">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDrafts;
