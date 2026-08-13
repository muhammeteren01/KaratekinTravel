import React, { useEffect, useMemo, useState } from 'react';
import './SubTourDetails.css';
import './TourDetails.css';
import {
  deleteTripDepartureApi,
  fetchReservationsByTripApi,
  fetchTripByIdApi,
  fetchTripDepartureByIdApi,
  fetchUsersApi,
  updateTripDepartureApi,
} from '../services/adminApi';
import { clearSelectedSubTour, getSelectedDepartureId, getSelectedTripId, setSelectedSubTour } from '../utils/selectionStorage';
import { useFeedback } from '../components/feedback/feedbackContext';

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

const pad = (n) => String(n).padStart(2, '0');

const formatDateTR = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const formatDateTimeTR = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatTimeTR = (value) => {
  if (!value) return '-';
  const parts = String(value).split(':');
  if (parts.length < 2) return value;
  return `${parts[0]}:${parts[1]}`;
};

const SubTourDetails = ({ isSidebarCollapsed }) => {
  const { notify, confirm } = useFeedback();
  const tripId = useMemo(() => getSelectedTripId(), []);
  const departureId = useMemo(() => getSelectedDepartureId(), []);

  const [tourName, setTourName] = useState('Tur');
  const [subTour, setSubTour] = useState(null);
  const [subStatus, setSubStatus] = useState('active');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(participants.length / pageSize));
  const pagedParticipants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return participants.slice(start, start + pageSize);
  }, [participants, page]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!departureId) {
        setError('Alt tur seçimi bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const requests = [
          fetchTripDepartureByIdApi(departureId),
          tripId ? fetchTripByIdApi(tripId) : Promise.resolve(null),
          tripId ? fetchReservationsByTripApi(tripId) : Promise.resolve([]),
          fetchUsersApi().catch(() => []),
        ];

        const [departure, trip, reservations, users] = await Promise.all(requests);
        if (!alive) return;

        const userMap = new Map(
          (Array.isArray(users) ? users : []).map((user) => [String(user.id), user])
        );

        const mappedSubTour = {
          id: departure.id,
          date: formatDateTR(departure.departureDate),
          time: formatTimeTR(departure.departureTime),
          status: departure.status === 'inactive' ? 'inactive' : 'active',
          note: departure.notes || '',
          raw: departure,
        };

        setSubTour(mappedSubTour);
        setSubStatus(mappedSubTour.status);
        setTourName(trip?.title || 'Tur');

        setSelectedSubTour(mappedSubTour);

        const filteredReservations = (Array.isArray(reservations) ? reservations : [])
          .filter((reservation) => {
            if (!reservation.departureId) return false;
            return String(reservation.departureId) === String(departure.id);
          })
          .filter((reservation) => reservation.status !== 'cancelled');

        const mappedParticipants = filteredReservations.flatMap((reservation, index) => {
          const user = userMap.get(String(reservation.userId));
          const seats = Array.isArray(reservation.seatNumbers) ? reservation.seatNumbers : [];
          if (!seats.length) {
            return [{
              id: reservation.id || index,
              name: user?.name || 'Bilinmeyen Kullanıcı',
              gender: 'male',
              tc: '-',
              seat: '-',
              purchasedAt: formatDateTimeTR(reservation.createdAt),
              note: reservation.status || '-',
            }];
          }
          return seats.map((seat, seatIndex) => ({
            id: `${reservation.id}-${seatIndex}`,
            name: user?.name || 'Bilinmeyen Kullanıcı',
            gender: 'male',
            tc: '-',
            seat,
            purchasedAt: formatDateTimeTR(reservation.createdAt),
            note: reservation.status || '-',
          }));
        });

        setParticipants(mappedParticipants);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Alt tur detayları yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [departureId, tripId]);

  const titleDate = subTour?.date || '-';
  const titleName = tourName || 'Tur';

  const handleUploadImages = () => {
    window.location.hash = encodeURIComponent('Tur Sonu Görseller');
  };

  const handleDownloadCsv = () => {
    const headers = ['Ad Soyad', 'TC Kimlik', 'Koltuk', 'Satın Alım Tarihi', 'Açıklama'];
    const rows = participants.map((p) => [p.name, p.tc, p.seat, p.purchasedAt, p.note]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tur-${titleDate}-katilimcilar.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStatus = async () => {
    if (!departureId) return;
    const next = subStatus === 'inactive' ? 'active' : 'inactive';
    const targetLabel = next === 'inactive' ? 'Pasif' : 'Aktif';
    const ok = await confirm({
      title: `Durum ${targetLabel} yapılsın mı?`,
      message: `“${titleDate}” tarihli alt turun durumu ${targetLabel} olarak güncellenecek.`,
      confirmLabel: `Evet, ${targetLabel} yap`,
      danger: next === 'inactive',
    });
    if (!ok) return;

    setStatusUpdating(true);
    try {
      const updated = await updateTripDepartureApi(departureId, { status: next });
      setSubStatus(next);
      setSubTour((prev) => ({
        ...prev,
        status: next,
        raw: updated,
      }));
      setSelectedSubTour({
        ...subTour,
        status: next,
        raw: updated,
      });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Durum güncellenemedi.', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteDeparture = async () => {
    if (!departureId) return;
    const ok = await confirm({
      title: 'Alt tur silinsin mi?',
      message: `“${titleDate}” tarihli alt tur kalıcı olarak silinecek.`,
      confirmLabel: 'Evet, sil',
      danger: true,
    });
    if (!ok) return;

    try {
      await deleteTripDepartureApi(departureId);
      clearSelectedSubTour();
      window.location.hash = encodeURIComponent('Tur Detayları');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.', 'error');
    }
  };

  return (
    <div className={`std-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {error && <div className="std-info-desc" style={{ color: '#DC2626' }}>{error}</div>}
      {loading && <div className="std-info-desc">Alt tur detayları yükleniyor...</div>}

      <div className="std-info">
        <h3 className="std-info-title">“{titleDate} - {titleName}” Detayları</h3>
        <div className="std-info-desc">
          Bu alanda yapılacak işlemler sadece {titleDate} tarihinde planlanan “{titleName}” için gerçekleştirilecektir.
        </div>

        <div className="std-info-cards">
          <div className="std-info-card">
            <div className="std-info-icon std-orange">
              <img src="/icons/td-card-travel.svg" alt="Tur Adı" />
            </div>
            <div className="std-info-texts">
              <div className="std-info-label">Tur Adı</div>
              <div className="std-info-value">{titleName}</div>
            </div>
          </div>
          <div className="std-info-card">
            <div className="std-info-icon std-blue">
              <img src="/icons/std-calendar.svg" alt="Tarih" />
            </div>
            <div className="std-info-texts">
              <div className="std-info-label">Tarih</div>
              <div className="std-info-value">{titleDate}</div>
            </div>
          </div>
          <div className="std-info-card">
            <div className="std-info-icon std-teal">
              <img src="/icons/td-check.svg" alt="Yayın Durumu" />
            </div>
            <div className="std-info-texts">
              <div className="std-info-label">Yayın Durumu</div>
              <div className="std-info-value"><StatusBadge status={subStatus} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="hi-wrap">
        <h3 className="hi-title">Hızlı İşlemler</h3>
        <div className="hi-row">
          <button className="hi-card hi-orange" onClick={() => { window.location.hash = encodeURIComponent('Alt Tur Güncelle'); }}>
            <div className="hi-icon hi-orange-ic"><img src="/icons/hi-guncelle.svg" alt="Güncelle" /></div>
            <div className="hi-texts">
              <div className="hi-name">Güncelle</div>
              <div className="hi-desc">Yalnızca {titleDate} tarihli tur güncellenir.</div>
            </div>
          </button>
          <button className="hi-card hi-red" onClick={handleDeleteDeparture}>
            <div className="hi-icon hi-red-ic"><img src="/icons/hi-sil.svg" alt="Turu Sil" /></div>
            <div className="hi-texts">
              <div className="hi-name">Turu Sil</div>
              <div className="hi-desc">Yalnızca {titleDate} tarihli tur silinir.</div>
            </div>
          </button>
          <button className="hi-card hi-yellow" onClick={toggleStatus} disabled={statusUpdating}>
            <div className="hi-icon hi-yellow-ic"><img src="/icons/hi-pasif.svg" alt="Durum Değiştir" /></div>
            <div className="hi-texts">
              <div className="hi-chip">Durumu “{subStatus === 'inactive' ? 'Aktif' : 'Pasif'}” Yap</div>
              <div className="hi-desc">Yalnızca {titleDate} tarihli turun durumu değişir.</div>
            </div>
          </button>
          <button className="hi-card hi-green" onClick={handleUploadImages}>
            <div className="hi-icon hi-green-ic"><img src="/icons/image-upload-icon-2.svg" alt="Tur Sonu Görseller Ekle" /></div>
            <div className="hi-texts">
              <div className="hi-name">Tur Sonu Görseller Ekle</div>
            </div>
          </button>
          <button className="hi-card hi-purple" onClick={handleDownloadCsv}>
            <div className="hi-icon hi-purple-ic"><img src="/icons/download-cloud-02.svg" alt="Tur Dosyasını İndirin" /></div>
            <div className="hi-texts">
              <div className="hi-name">Tur Dosyasını İndirin</div>
            </div>
          </button>
        </div>
      </div>

      <div className="std-participants">
        <div className="std-part-head">
          <div className="std-part-title">Katılımcı Bilgileri</div>
        </div>
        <div className="std-table-card">
          <div className="std-table-wrap">
            <table className="std-table">
              <thead>
                <tr>
                  <th className="std-th">
                    <span className="th-cell"><img src="/icons/std-th-name.svg" alt="Ad Soyad" /> AD SOYAD</span>
                  </th>
                  <th className="std-th">
                    <span className="th-cell"><img src="/icons/std-th-id.svg" alt="TC Kimlik" /> TC KİMLİK</span>
                  </th>
                  <th className="std-th">
                    <span className="th-cell"><img src="/icons/std-th-seat.svg" alt="Koltuk" /> KOLTUK</span>
                  </th>
                  <th className="std-th">
                    <span className="th-cell"><img src="/icons/std-th-date.svg" alt="Satın Alım Tarihi" /> SATIN ALIM TARİHİ</span>
                  </th>
                  <th className="std-th">
                    <span className="th-cell"><img src="/icons/std-th-desc.svg" alt="Açıklama" /> AÇIKLAMA</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && !pagedParticipants.length && (
                  <tr>
                    <td colSpan={5}>Bu alt tur için kayıtlı katılımcı bulunamadı.</td>
                  </tr>
                )}
                {pagedParticipants.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.tc}</td>
                    <td>
                      <span className={`std-seat ${p.gender}`}>{p.seat}</span>
                    </td>
                    <td>{p.purchasedAt}</td>
                    <td>
                      <span className="std-note">{p.note}</span>
                      <span className="std-note-dot" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="td-pagination">
          <button
            className="td-page-next"
            aria-label="Önceki sayfa"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <img style={{ transform: 'rotate(180deg)' }} src="/icons/pagination-next.svg" alt="Önceki" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <img src="/icons/pagination-next.svg" alt="Sonraki" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubTourDetails;
