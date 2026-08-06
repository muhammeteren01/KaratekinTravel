import React, { useEffect, useMemo, useState } from 'react';
import DateTimePicker from '../components/DateTimePicker';
import VehicleSeatPreview from '../components/VehicleSeatPreview';
import './NewSubDate.css';
import {
  deleteTripDepartureApi,
  fetchTripDepartureByIdApi,
  fetchTripByIdApi,
  fetchVehiclesApi,
  updateTripDepartureApi,
} from '../services/adminApi';

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

const getDepartureId = () => {
  try {
    const raw = localStorage.getItem('selectedSubTour');
    if (raw) {
      const sub = JSON.parse(raw);
      return sub?.id || sub?.raw?.id || null;
    }
  } catch {}
  return null;
};

const pad = (n) => String(n).padStart(2, '0');

const formatDateTR = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const formatTimeTR = (value) => {
  if (!value) return '';
  const parts = String(value).split(':');
  if (parts.length < 2) return value;
  return `${parts[0]}:${parts[1]}`;
};

const parseDisplayDate = (value) => {
  if (!value) return null;
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
};

const formatVehicleOption = (vehicle) =>
  `${vehicle.busType} ${vehicle.model || 'Otobüs'} - ${vehicle.plate}`;

const UpdateSubDate = ({ isSidebarCollapsed }) => {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  const tripId = useMemo(() => getTripId(), []);
  const departureId = useMemo(() => getDepartureId(), []);
  const [tourName, setTourName] = useState('Tur');
  const [titleDate, setTitleDate] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    datetime: '',
    vehicleId: '',
    capacity: '',
    status: 'active',
    note: '',
  });

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
          fetchVehiclesApi().catch(() => []),
        ];
        if (tripId) requests.push(fetchTripByIdApi(tripId));

        const [departure, vehicleList, trip] = await Promise.all(requests);
        if (!alive) return;

        setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
        setTourName(trip?.title || 'Tur');
        setTitleDate(formatDateTR(departure.departureDate));

        const vehicle = (Array.isArray(vehicleList) ? vehicleList : [])
          .find((v) => String(v.id) === String(departure.vehicleId));

        setForm({
          datetime: `${formatDateTR(departure.departureDate)} - ${formatTimeTR(departure.departureTime)}`,
          vehicleId: departure.vehicleId ? String(departure.vehicleId) : '',
          capacity: vehicle ? formatVehicleOption(vehicle) : '',
          status: departure.status === 'inactive' ? 'inactive' : 'active',
          note: departure.notes || '',
        });
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Alt tur bilgileri yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [departureId, tripId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => String(v.id) === String(form.vehicleId)),
    [vehicles, form.vehicleId]
  );

  const submit = async () => {
    if (!departureId) {
      alert('Alt tur seçimi bulunamadı.');
      return;
    }

    const parsed = parseDisplayDate(form.datetime);
    if (!parsed) {
      alert('Geçerli bir tarih ve saat seçiniz.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const departureDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      const updated = await updateTripDepartureApi(departureId, {
        vehicleId: form.vehicleId || null,
        departureDate: departureDate.toISOString(),
        departureTime: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:00`,
        capacity: selectedVehicle?.capacity || undefined,
        status: form.status,
        notes: form.note || null,
      });

      try {
        localStorage.setItem('selectedSubTour', JSON.stringify({
          id: updated.id,
          date: formatDateTR(updated.departureDate),
          time: formatTimeTR(updated.departureTime),
          status: updated.status,
          bus: selectedVehicle ? formatVehicleOption(selectedVehicle) : form.capacity,
          note: updated.notes || '',
          raw: updated,
        }));
      } catch {}

      window.location.hash = encodeURIComponent('Alt Tur Detayları');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!departureId) return;
    const ok = window.confirm(`"${titleDate || 'Seçili'}" tarihli alt turu silmek istediğinize emin misiniz?`);
    if (!ok) return;

    setSaving(true);
    setError('');
    try {
      await deleteTripDepartureApi(departureId);
      try { localStorage.removeItem('selectedSubTour'); } catch {}
      window.location.hash = encodeURIComponent('Tur Detayları');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`nsd-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="nsd-card">
        <h2 className="nsd-title">“{titleDate} - {tourName}” Güncelleme İşlemi</h2>
        {error && <p className="nsd-label" style={{ color: '#DC2626' }}>{error}</p>}
        {loading && <p className="nsd-label">Veriler yükleniyor...</p>}

        <div className="nsd-field">
          <label className="nsd-label">Tur Tarih ve Saati</label>
          <DateTimePicker value={form.datetime} min={todayStr} onChange={(v) => setForm((f) => ({ ...f, datetime: v }))} />
        </div>

        <div className="nsd-field">
          <label className="nsd-label">Kapasite Seçimi</label>
          <div className="nsd-inline">
            <div className="nsd-select">
              <select
                value={form.vehicleId}
                onChange={(e) => {
                  const vehicle = vehicles.find((v) => String(v.id) === e.target.value);
                  setForm((f) => ({
                    ...f,
                    vehicleId: e.target.value,
                    capacity: vehicle ? formatVehicleOption(vehicle) : '',
                  }));
                }}
              >
                {!vehicles.length && <option value="">Araç bulunamadı</option>}
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {formatVehicleOption(vehicle)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="nsd-bus-btn">Otobüs Seç</button>
          </div>
        </div>

        <div className="nsd-field">
          <label className="nsd-label">Önizleme <span className="nsd-sub">({selectedVehicle?.busType || '2+1'} Otobüs)</span></label>
          <div className="nsd-preview">
            <VehicleSeatPreview />
          </div>
        </div>

        <div className="nsd-field">
          <label className="nsd-label">Durum</label>
          <div className="nsd-radios">
            <label><input type="radio" name="status" checked={form.status === 'active'} onChange={() => setForm((f) => ({ ...f, status: 'active' }))} /> Aktif</label>
            <label><input type="radio" name="status" checked={form.status === 'inactive'} onChange={() => setForm((f) => ({ ...f, status: 'inactive' }))} /> Pasif</label>
          </div>
        </div>

        <div className="nsd-field">
          <label className="nsd-label">Özel Açıklama Ekleyin</label>
          <textarea placeholder="Eklediğiniz tarih hakkında özel açıklama belirtebilirsiniz." value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
        </div>

        <div className="nsd-actions">
          <button type="button" className="nsd-primary" style={{ background: '#EF4444', marginRight: 12 }} onClick={handleDelete} disabled={saving || loading}>
            Alt Tarihi Sil
          </button>
          <button className="nsd-primary" onClick={submit} disabled={saving || loading}>
            {saving ? 'Kaydediliyor...' : 'Bilgileri Güncelle ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSubDate;
