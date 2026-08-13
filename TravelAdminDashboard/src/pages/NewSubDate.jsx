import React, { useEffect, useMemo, useState } from 'react';
import DateTimePicker from '../components/DateTimePicker';
import VehicleSeatPreview from '../components/VehicleSeatPreview';
import './NewSubDate.css';
import { createTripDepartureApi, fetchTripByIdApi, fetchVehiclesApi } from '../services/adminApi';
import { getSelectedTripId } from '../utils/selectionStorage';
import { useFeedback } from '../components/feedback/feedbackContext';

const parseDisplayDate = (value) => {
  if (!value) return null;
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
};

const formatVehicleOption = (vehicle) =>
  `${vehicle.busType} ${vehicle.model || 'Otobüs'} - ${vehicle.plate}`;

const NewSubDate = ({ isSidebarCollapsed }) => {
  const { notify } = useFeedback();
  const todayStr = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date();
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  const tripId = useMemo(() => getSelectedTripId(), []);
  const [tourName, setTourName] = useState('Tur');
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
      if (!tripId) {
        setError('Tur seçimi bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [trip, vehicleList] = await Promise.all([
          fetchTripByIdApi(tripId),
          fetchVehiclesApi().catch(() => []),
        ]);
        if (!alive) return;

        setTourName(trip?.title || 'Tur');
        const normalized = (Array.isArray(vehicleList) ? vehicleList : []);
        setVehicles(normalized);

        const firstVehicle = normalized[0];
        setForm((prev) => ({
          ...prev,
          vehicleId: firstVehicle ? String(firstVehicle.id) : '',
          capacity: firstVehicle ? formatVehicleOption(firstVehicle) : '',
        }));
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Veriler yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [tripId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => String(v.id) === String(form.vehicleId)),
    [vehicles, form.vehicleId]
  );

  const submit = async () => {
    if (!tripId) {
      notify('Tur seçimi bulunamadı.', 'error');
      return;
    }

    const parsed = parseDisplayDate(form.datetime);
    if (!parsed) {
      notify('Geçerli bir tarih ve saat seçiniz.', 'warning');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const pad = (n) => String(n).padStart(2, '0');
      const departureDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      await createTripDepartureApi({
        tripId,
        vehicleId: form.vehicleId || null,
        departureDate: departureDate.toISOString(),
        departureTime: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:00`,
        capacity: selectedVehicle?.capacity || 40,
        status: form.status,
        notes: form.note || null,
        currency: 'TRY',
      });
      window.location.hash = encodeURIComponent('Tur Detayları');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Alt tarih eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`nsd-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="nsd-card">
        <h2 className="nsd-title">“{tourName}” için Yeni Alt Tarih Tanımlama İşlemi</h2>
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
          <button className="nsd-primary" onClick={submit} disabled={saving || loading}>
            {saving ? 'Kaydediliyor...' : 'Alt Tarihi Ekle ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSubDate;
