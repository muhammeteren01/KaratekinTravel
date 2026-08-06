import React, { useMemo, useState, useEffect } from 'react';
import './TourDetails.css';
import {
  fetchTripByIdApi,
  fetchTripDeparturesApi,
  fetchVehiclesApi,
  updateTripDepartureApi,
} from '../services/adminApi';

const StatusBadge = ({ status }) => {
  const map = {
    active: { text: 'Yayında', cls: 'td-badge-active' },
    inactive: { text: 'Pasif', cls: 'td-badge-inactive' },
    processing: { text: 'İşleniyor', cls: 'td-badge-processing' },
  };
  const cfg = map[status] || map.active;
  return (
    <span className={`td-badge ${cfg.cls}`}>
      <span className="td-badge-dot" />
      {cfg.text}
    </span>
  );
};

const getTripId = () => {
  try {
    const raw = localStorage.getItem('selectedTour');
    if (raw) {
      const tour = JSON.parse(raw);
      return tour?.raw?.id || tour?.id || null;
    }
  } catch {}
  return null;
};

const pad = (n) => String(n).padStart(2, '0');

const formatDateTR = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const formatTimeTR = (value) => {
  if (!value) return '-';
  const parts = String(value).split(':');
  if (parts.length < 2) return value;
  return `${parts[0]}:${parts[1]}`;
};

const formatPrice = (price, currency = 'TRY') => {
  if (price == null || price === '') return '-';
  const num = Number(price);
  const formatted = Number.isNaN(num) ? price : num.toLocaleString('tr-TR');
  return `${formatted} ${currency}`;
};

const parseDate = (ddmmyyyy) => {
  const [d, m, y] = ddmmyyyy.split('.').map(Number);
  return new Date(y, m - 1, d).getTime();
};

const parseTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const parsePrice = (p) => Number(String(p).replace(/\./g, '').replace(/\s*TL/i, '').trim());

const statusRank = (s) => (s === 'active' ? 1 : s === 'inactive' ? 2 : 3);

const mapDepartureRow = (departure, vehicleMap) => {
  const vehicle = departure.vehicleId ? vehicleMap.get(String(departure.vehicleId)) : null;
  const busLabel = vehicle
    ? `${vehicle.busType} ${vehicle.model || 'Otobüs'} - ${vehicle.plate} – ${vehicle.capacity}`
    : `Kapasite – ${departure.capacity}`;

  return {
    id: departure.id,
    date: formatDateTR(departure.departureDate),
    time: formatTimeTR(departure.departureTime),
    price: formatPrice(departure.price, departure.currency),
    bus: busLabel,
    sold: departure.soldCount ?? 0,
    status: departure.status === 'inactive' ? 'inactive' : 'active',
    note: departure.notes || '',
    raw: departure,
  };
};

const TourDetails = ({ isSidebarCollapsed }) => {
  const [trip, setTrip] = useState(null);
  const [subDates, setSubDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' });
  const [activeTab, setActiveTab] = useState('route');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const tripId = useMemo(() => getTripId(), []);

  const selectedTour = useMemo(() => {
    if (trip) {
      return {
        id: trip.id,
        code: `TR-${String(trip.id || '').slice(0, 4).toUpperCase()}`,
        name: trip.title,
        status: trip.isPublished === false ? 'inactive' : 'active',
        description: trip.description,
        raw: trip,
      };
    }
    try {
      const raw = localStorage.getItem('selectedTour');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { id: null, code: '-', name: 'Tur', status: 'active' };
  }, [trip]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!tripId) {
        setError('Tur seçimi bulunamadı. Lütfen tur yönetiminden bir tur seçin.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [tripData, departures, vehicles] = await Promise.all([
          fetchTripByIdApi(tripId),
          fetchTripDeparturesApi(tripId),
          fetchVehiclesApi().catch(() => []),
        ]);
        if (!alive) return;

        const vehicleMap = new Map(
          (Array.isArray(vehicles) ? vehicles : []).map((v) => [String(v.id), v])
        );

        setTrip(tripData);
        setSubDates(
          (Array.isArray(departures) ? departures : []).map((d) => mapDepartureRow(d, vehicleMap))
        );

        try {
          localStorage.setItem('selectedTour', JSON.stringify({
            id: tripData.id,
            name: tripData.title,
            code: `TR-${String(tripData.id || '').slice(0, 4).toUpperCase()}`,
            companyId: tripData.companyId,
            raw: tripData,
          }));
        } catch {}
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Tur detayları yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [tripId]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const sortedRows = useMemo(() => {
    const arr = [...subDates];
    const dir = sort.dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let va;
      let vb;
      switch (sort.key) {
        case 'date':
          va = parseDate(a.date);
          vb = parseDate(b.date);
          break;
        case 'time':
          va = parseTime(a.time);
          vb = parseTime(b.time);
          break;
        case 'price':
          va = parsePrice(a.price);
          vb = parsePrice(b.price);
          break;
        case 'bus':
          va = a.bus?.toString() || '';
          vb = b.bus?.toString() || '';
          break;
        case 'sold':
          va = a.sold;
          vb = b.sold;
          break;
        case 'status':
          va = statusRank(a.status);
          vb = statusRank(b.status);
          break;
        default:
          va = 0;
          vb = 0;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [subDates, sort]);

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, page]);

  const datesSorted = useMemo(
    () => [...subDates].sort((a, b) => parseDate(a.date) - parseDate(b.date)),
    [subDates]
  );
  const firstDate = datesSorted[0]?.date;
  const lastDate = datesSorted[datesSorted.length - 1]?.date;
  const activeCount = subDates.filter((row) => row.status === 'active').length;

  const confirmAndMakeInactive = async () => {
    const ok = window.confirm('Tüm alt turların durumunu pasif yapmak istediğinize emin misiniz?');
    if (!ok) return;

    setBulkUpdating(true);
    try {
      await Promise.all(
        subDates.map((row) => updateTripDepartureApi(row.id, { status: 'inactive' }))
      );
      setSubDates((prev) => prev.map((row) => ({ ...row, status: 'inactive' })));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Durum güncellenemedi.');
    } finally {
      setBulkUpdating(false);
    }
  };

  const cycleTab = (dir) => {
    const order = ['general', 'route', 'hotel'];
    const idx = order.indexOf(activeTab);
    const next = (idx + (dir === 'next' ? 1 : -1) + order.length) % order.length;
    setActiveTab(order[next]);
  };

  const openSubTourDetails = (row) => {
    try {
      localStorage.setItem('selectedSubTour', JSON.stringify({
        ...row,
        tripId: tripId || trip?.id || selectedTour?.id,
      }));
    } catch {}
    window.location.hash = encodeURIComponent('Alt Tur Detayları');
  };

  return (
    <div className={`td-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {error && <div className="td-list-desc" style={{ color: '#DC2626', marginBottom: 12 }}>{error}</div>}
      {loading && <div className="td-list-desc">Tur detayları yükleniyor...</div>}

      <div className="td-info">
        <h3 className="td-info-title">“{selectedTour.name}” Bilgileri</h3>
        <div className="td-info-cards">
          <div className="td-info-card">
            <div className="td-info-icon td-blue">
              <img src="/icons/td-bus.svg" alt="Tur Kodu" />
            </div>
            <div className="td-info-texts">
              <div className="td-info-label">Tur Kodu</div>
              <div className="td-info-value">{selectedTour.code}</div>
            </div>
          </div>
          <div className="td-info-card">
            <div className="td-info-icon td-orange">
              <img src="/icons/td-card-travel.svg" alt="Tur Adı" />
            </div>
            <div className="td-info-texts">
              <div className="td-info-label">Tur Adı</div>
              <div className="td-info-value">{selectedTour.name}</div>
            </div>
          </div>
          <div className="td-info-card">
            <div className="td-info-icon td-teal">
              <img src="/icons/td-check.svg" alt="Yayın Durumu" />
            </div>
            <div className="td-info-texts">
              <div className="td-info-label">Yayın Durumu</div>
              <div className="td-info-value">
                {selectedTour.status === 'inactive' ? 'Pasif' : 'Yayında'}
                <span className="td-info-muted"> ({subDates.length} Farklı Tarih)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hi-wrap">
        <h3 className="hi-title">Hızlı İşlemler</h3>
        <div className="hi-row">
          <button className="hi-card hi-orange" onClick={() => { window.location.hash = encodeURIComponent('Tur Güncelle'); }}>
            <div className="hi-icon hi-orange-ic"><img src="/icons/hi-guncelle.svg" alt="Güncelle" /></div>
            <div className="hi-texts">
              <div className="hi-name">Güncelle</div>
              <div className="hi-desc">Tüm alt turlarınızda güncellenecektir!</div>
            </div>
          </button>
          <button className="hi-card hi-red" onClick={() => { window.location.hash = encodeURIComponent('Tur Sil'); }}>
            <div className="hi-icon hi-red-ic"><img src="/icons/hi-sil.svg" alt="Turu Sil" /></div>
            <div className="hi-texts">
              <div className="hi-name">Turu Sil</div>
              <div className="hi-desc">Tüm alt turlarınızda silinecektir!</div>
            </div>
          </button>
          <button className="hi-card hi-yellow" onClick={confirmAndMakeInactive} disabled={bulkUpdating || !subDates.length}>
            <div className="hi-icon hi-yellow-ic"><img src="/icons/hi-pasif.svg" alt="Durumu Pasif Yap" /></div>
            <div className="hi-texts">
              <div className="hi-chip">Durumu “Pasif” Yap</div>
              <div className="hi-desc">Tüm alt turlarınızda durumu değişir!</div>
            </div>
          </button>
          <button className="hi-card hi-green" onClick={() => { window.location.hash = encodeURIComponent('Kupon Yönetimi'); }}>
            <div className="hi-icon hi-green-ic"><img src="/icons/hi-kupon.svg" alt="Kupon Yönetim" /></div>
            <div className="hi-texts">
              <div className="hi-name">Kupon Yönetim</div>
              <div className="hi-desc">Tüm alt turlarınız için kupon kullanılır.</div>
            </div>
          </button>
          <button className="hi-card hi-gray" disabled>
            <div className="hi-icon hi-purple-ic"><img src="/icons/hi-onecikar.svg" alt="Öne Çıkar" /></div>
            <div className="hi-texts">
              <div className="hi-name">Öne Çıkar</div>
              <div className="hi-desc">Çok Yakında!</div>
            </div>
          </button>
        </div>
      </div>

      <div className="td-list">
        <div className="td-list-head">
          <div>
            <div className="td-list-title">Tur Listesi</div>
            <div className="td-list-desc">Alt tarih ekleyerek mevcut turunuzu farklı tarihler için de yayına açabilirsiniz.</div>
          </div>
          <button className="td-primary td-add-date" onClick={() => { window.location.hash = encodeURIComponent('Yeni Alt Tarih'); }}>
            <span>Yeni Alt Tarih Ekle</span>
            <img src="/icons/calendar-plus-14.svg" alt="Yeni Alt Tarih" />
          </button>
        </div>
        <div className="td-table-card">
          <div className="td-table-wrap">
            <table className="td-table">
              <thead>
                <tr>
                  <th className={`td-th sortable ${sort.key === 'date' ? 'active' : ''} ${sort.key === 'date' ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''}`} onClick={() => toggleSort('date')}>TARİH</th>
                  <th className={`td-th sortable ${sort.key === 'time' ? 'active' : ''} ${sort.key === 'time' ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''}`} onClick={() => toggleSort('time')}>KALKIŞ</th>
                  <th className={`td-th sortable ${sort.key === 'price' ? 'active' : ''} ${sort.key === 'price' ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''}`} onClick={() => toggleSort('price')}>FİYAT</th>
                  <th className={`td-th sortable ${sort.key === 'bus' ? 'active' : ''} ${sort.key === 'bus' ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''}`} onClick={() => toggleSort('bus')}>OTOBÜS - KAPASİTE</th>
                  <th className={`td-th sortable ${sort.key === 'sold' ? 'active' : ''} ${sort.key === 'sold' ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''}`} onClick={() => toggleSort('sold')}>SATILAN</th>
                  <th className={`td-th sortable ${sort.key === 'status' ? 'active' : ''} ${sort.key === 'status' ? (sort.dir === 'asc' ? 'asc' : 'desc') : ''}`} onClick={() => toggleSort('status')}>DURUM</th>
                  <th className="td-th"></th>
                </tr>
              </thead>
              <tbody>
                {!loading && !pagedRows.length && (
                  <tr>
                    <td colSpan={7}>Henüz alt tarih eklenmemiş.</td>
                  </tr>
                )}
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.time}</td>
                    <td>{row.price}</td>
                    <td>{row.bus}</td>
                    <td>{row.sold}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>
                      <button className="td-outline td-details-btn" onClick={() => openSubTourDetails(row)}>
                        <span>Detaylar</span>
                        <img src="/icons/arrow-right-10.svg" alt="Detaylar" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="td-pagination">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`td-page-chip ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
          <button
            className="td-page-next"
            aria-label="Sonraki sayfa"
            onClick={() => setPage(Math.min(page + 1, pageCount))}
            disabled={page >= pageCount}
          >
            <img src="/icons/pagination-next.svg" alt="Sonraki" />
          </button>
        </div>
      </div>

      <section className="rd-wrap">
        <div className="rd-head">
          <div className="rd-title">Tur Detayları</div>
          <div className="rd-desc">Tur detaylarını aşağıdaki tablodan inceleyebilirsiniz. Tablonun üstünde bulunan yönlendirme butonları ile sekmeler arasında inceleme yapabilirsiniz</div>
        </div>
        <div className="rd-tabs">
          <button className="rd-tab-left" onClick={() => cycleTab('prev')} aria-label="Önceki sekme">
            <img src="/icons/route-chevron-left.svg" alt="Geri" />
            <span className={activeTab === 'general' ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setActiveTab('general'); }}>Genel Bilgiler</span>
          </button>
          <button className={`rd-tab-center ${activeTab === 'route' ? 'active' : ''}`} onClick={() => setActiveTab('route')}>
            ROTA OLUŞTURMA
          </button>
          <button className="rd-tab-right" onClick={() => cycleTab('next')} aria-label="Sonraki sekme">
            <span className={activeTab === 'hotel' ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setActiveTab('hotel'); }}>Otel / Konaklama</span>
            <img src="/icons/route-chevron-right.svg" alt="İleri" />
          </button>
        </div>

        {activeTab === 'route' && (
          <div className="rd-content">
            {(trip?.itinerary || []).length ? (
              (trip.itinerary || []).map((stop, index) => (
                <div key={`${stop.day}-${index}`} className="rd-card">
                  <div className="rd-chip">{stop.day}. Durak</div>
                  <div className="rd-main">
                    <img src="/icons/route-pin.svg" alt="Pin" />
                    <div className="rd-place">{stop.title} {stop.dateLabel ? `- ${stop.dateLabel}` : ''}</div>
                  </div>
                  {(stop.activities || []).length > 0 && (
                    <div className="rd-subbox">
                      <div className="rd-subicon"><img src="/icons/route-doc.svg" alt="Ara Durak" /></div>
                      <div className="rd-subtexts">
                        <div className="rd-subtitle">Ara Duraklar:</div>
                        {(stop.activities || []).map((act, actIndex) => (
                          <div key={actIndex} className="rd-subline">
                            {actIndex + 1}. {act.label} - <span className="rd-time">{act.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rd-desc">Rota bilgisi henüz eklenmemiş.</div>
            )}
          </div>
        )}

        {activeTab === 'general' && (
          <div className="rd-content gi-content">
            <div className="gi-grid">
              <div className="gi-item"><div className="gi-label">Tur Adı</div><div className="gi-value">{selectedTour.name}</div></div>
              <div className="gi-item"><div className="gi-label">Tur Kodu</div><div className="gi-value">{selectedTour.code}</div></div>
              <div className="gi-item"><div className="gi-label">Durum</div><div className="gi-value">{selectedTour.status === 'inactive' ? 'Pasif' : 'Yayında'}</div></div>
              <div className="gi-item"><div className="gi-label">Alt Tarih Sayısı</div><div className="gi-value">{subDates.length}</div></div>
              <div className="gi-item"><div className="gi-label">Aktif Alt Tarih</div><div className="gi-value">{activeCount}</div></div>
              <div className="gi-item"><div className="gi-label">İlk Tarih</div><div className="gi-value">{firstDate || '-'}</div></div>
              <div className="gi-item"><div className="gi-label">Son Tarih</div><div className="gi-value">{lastDate || '-'}</div></div>
            </div>
            <div className="gi-desc">
              <div className="gi-label">Açıklama</div>
              <div className="gi-desc-box">{trip?.description || 'Bu tur için açıklama bulunmuyor.'}</div>
            </div>
          </div>
        )}

        {activeTab === 'hotel' && (
          <div className="rd-content hk-content">
            <div className="hk-card">
              <div className="hk-header">
                <div className="hk-title">Oteller</div>
                <div className="hk-sub">Konaklama detayları</div>
              </div>
              {(trip?.hotels || []).length ? (
                (trip.hotels || []).map((hotel, index) => (
                  <React.Fragment key={`${hotel.name}-${index}`}>
                    {index > 0 && <div className="hk-divider" />}
                    <div className="hk-item">
                      <div className="hk-name">{hotel.name}</div>
                      <div className="hk-meta">{hotel.address} • {hotel.stars}★</div>
                      <div className="hk-dates">Giriş: {hotel.checkIn || '-'} • Çıkış: {hotel.checkOut || '-'}</div>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="hk-item">Konaklama bilgisi henüz eklenmemiş.</div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TourDetails;
