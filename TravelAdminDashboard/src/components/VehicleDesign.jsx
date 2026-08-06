import React, { useEffect, useMemo, useState } from 'react';
import './VehicleDesign.css';
import {
  createVehicleLayoutApi,
  fetchMeApi,
  fetchVehicleLayoutsApi,
} from '../services/adminApi';
import {
  SEAT_TEMPLATES,
  buildSeatGrid,
  parseLayoutGrid,
  countSeats,
  seatNumbers,
} from '../utils/seatLayoutTemplates';

const VehicleDesign = () => {
  const [templateId, setTemplateId] = useState('2plus1');
  const [designName, setDesignName] = useState('');
  const [capacity, setCapacity] = useState('46');
  const [grid, setGrid] = useState(() => buildSeatGrid(SEAT_TEMPLATES[0], 46).grid);
  const [meta, setMeta] = useState(() => {
    const built = buildSeatGrid(SEAT_TEMPLATES[0], 46);
    return { rows: built.rows, cols: built.cols, seatsLeft: built.seatsLeft, seatsRight: built.seatsRight };
  });
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copyId, setCopyId] = useState('');

  const selectedTemplate = SEAT_TEMPLATES.find((t) => t.id === templateId) || SEAT_TEMPLATES[0];
  const seatCount = useMemo(() => countSeats(grid), [grid]);
  const numbers = useMemo(() => seatNumbers(grid), [grid]);

  const regenerate = (nextTemplateId = templateId, nextCapacity = capacity) => {
    const template = SEAT_TEMPLATES.find((t) => t.id === nextTemplateId) || SEAT_TEMPLATES[0];
    const cap = Math.min(80, Math.max(1, Number(String(nextCapacity).replace(/\D/g, '')) || 1));
    const built = buildSeatGrid(template, cap);
    setGrid(built.grid);
    setMeta({
      rows: built.rows,
      cols: built.cols,
      seatsLeft: built.seatsLeft,
      seatsRight: built.seatsRight,
    });
    if (!designName.trim()) {
      setDesignName(`${template.label} – ${cap} Koltuk`);
    }
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const me = await fetchMeApi();
        if (!alive) return;
        const resolvedCompanyId = me?.companyId || null;
        setCompanyId(resolvedCompanyId);
        if (!resolvedCompanyId) {
          setSavedLayouts([]);
          return;
        }
        const layouts = await fetchVehicleLayoutsApi(resolvedCompanyId);
        if (!alive) return;
        setSavedLayouts(Array.isArray(layouts) ? layouts : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Tasarımlar yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const applySavedLayout = (layout) => {
    const parsed = parseLayoutGrid(layout);
    if (!parsed) return;
    setGrid(parsed.grid);
    setMeta({
      rows: parsed.rows,
      cols: parsed.cols,
      seatsLeft: parsed.seatsLeft,
      seatsRight: parsed.seatsRight,
    });
    setDesignName(layout.name || '');
    setCapacity(String(parsed.capacity || layout.totalSeats || countSeats(parsed.grid)));
  };

  const toggleCell = (rowIndex, colIndex) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const cell = next[rowIndex][colIndex];
      if (cell === 'aisle') return prev;
      next[rowIndex][colIndex] = cell === 'seat' ? 'empty' : 'seat';
      return next;
    });
  };

  const handleSave = async () => {
    if (!companyId) {
      setError('Şirket bilgisi bulunamadı. İşletme hesabıyla giriş yapın.');
      return;
    }
    if (!designName.trim()) {
      setError('Tasarım adı zorunludur.');
      return;
    }
    if (seatCount < 1) {
      setError('En az 1 koltuk olmalıdır.');
      return;
    }

    const flat = [];
    grid.forEach((row, r) => {
      row.forEach((type, c) => {
        flat.push({
          index: r * meta.cols + c,
          row: r,
          col: c,
          type: type === 'seat' ? 'koltuk' : type === 'aisle' ? 'koridor' : 'empty',
        });
      });
    });

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const created = await createVehicleLayoutApi({
        companyId,
        name: designName.trim(),
        rows: meta.rows,
        seatsLeft: meta.seatsLeft,
        seatsRight: meta.seatsRight,
        totalSeats: seatCount,
        seatMapJson: JSON.stringify(flat),
      });
      setSavedLayouts((prev) => [created, ...prev]);
      setSuccess(`“${created.name}” kaydedildi (${seatCount} koltuk).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tasarım kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vd-page">
      <header className="vd-hero">
        <div>
          <p className="vd-eyebrow">Araç düzeni</p>
          <h1>Koltuk şablonu oluştur</h1>
          <p className="vd-lede">
            Düzeni seç, kapasiteyi yaz — grid otomatik oluşsun. Sürükle-bırak yok;
            istersen önizlemede tek tıkla koltuk aç/kapa.
          </p>
        </div>
        <div className="vd-hero-stats">
          <div>
            <span>{seatCount}</span>
            <small>Koltuk</small>
          </div>
          <div>
            <span>{meta.rows}</span>
            <small>Sıra</small>
          </div>
          <div>
            <span>{selectedTemplate.label}</span>
            <small>Şablon</small>
          </div>
        </div>
      </header>

      {(error || success) && (
        <div className={`vd-banner ${error ? 'is-error' : 'is-ok'}`}>
          {error || success}
        </div>
      )}

      <div className="vd-layout">
        <section className="vd-panel">
          <h2>1. Şablon seç</h2>
          <div className="vd-templates">
            {SEAT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`vd-template-card ${templateId === t.id ? 'is-active' : ''}`}
                onClick={() => {
                  setTemplateId(t.id);
                  regenerate(t.id, capacity);
                  setDesignName(`${t.label} – ${Number(String(capacity).replace(/\D/g, '')) || 1} Koltuk`);
                }}
              >
                <div className="vd-template-preview" aria-hidden>
                  {Array.from({ length: t.seatsLeft }).map((_, i) => (
                    <i key={`L${i}`} className="vd-mini-seat" />
                  ))}
                  <i className="vd-mini-aisle" />
                  {Array.from({ length: t.seatsRight }).map((_, i) => (
                    <i key={`R${i}`} className="vd-mini-seat" />
                  ))}
                </div>
                <strong>{t.label}</strong>
                <span>{t.description}</span>
                <em>{t.hint}</em>
              </button>
            ))}
          </div>

          <h2>2. Kapasite ve ad</h2>
          <div className="vd-fields">
            <label>
              Yolcu kapasitesi
              <div className="vd-capacity-row">
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
                <button
                  type="button"
                  className="vd-btn-secondary"
                  onClick={() => regenerate(templateId, capacity)}
                >
                  Düzeni oluştur
                </button>
              </div>
            </label>
            <label>
              Tasarım adı
              <input
                type="text"
                placeholder="Örn: 2+1 Standart – 46 Koltuk"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
              />
            </label>
          </div>

          <h2>3. Kayıtlı tasarımdan yükle</h2>
          <div className="vd-copy-row">
            <select
              value={copyId}
              onChange={(e) => setCopyId(e.target.value)}
              disabled={loading || !savedLayouts.length}
            >
              <option value="">
                {loading ? 'Yükleniyor...' : (savedLayouts.length ? 'Tasarım seçiniz' : 'Kayıtlı tasarım yok')}
              </option>
              {savedLayouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name} ({layout.totalSeats} koltuk)
                </option>
              ))}
            </select>
            <button
              type="button"
              className="vd-btn-secondary"
              disabled={!copyId}
              onClick={() => {
                const layout = savedLayouts.find((l) => String(l.id) === String(copyId));
                if (layout) {
                  applySavedLayout(layout);
                  setSuccess('Tasarım yüklendi.');
                  setError('');
                }
              }}
            >
              Yükle
            </button>
          </div>

          <button
            type="button"
            className="vd-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Taslağı kaydet'}
          </button>
        </section>

        <section className="vd-preview-panel">
          <div className="vd-preview-header">
            <h2>Önizleme</h2>
            <p>Koltuklara tıklayarak tek hücre aç/kapatabilirsiniz. Koridor sabit kalır.</p>
          </div>

          <div className="vd-bus">
            <div className="vd-bus-front">
              <span>Şoför</span>
              <span className="vd-door">Kapı</span>
            </div>
            <div
              className="vd-bus-grid"
              style={{ ['--vd-cols']: meta.cols }}
            >
              {grid.map((row, r) => (
                <div className="vd-bus-row" key={`row-${r}`}>
                  {row.map((cell, c) => {
                    if (cell === 'aisle') {
                      return <div key={`${r}-${c}`} className="vd-cell vd-aisle" title="Koridor" />;
                    }
                    const num = numbers[r]?.[c];
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        className={`vd-cell vd-seat ${cell === 'seat' ? 'is-seat' : 'is-empty'}`}
                        onClick={() => toggleCell(r, c)}
                        title={cell === 'seat' ? `Koltuk ${num}` : 'Boş — tıkla ekle'}
                      >
                        {cell === 'seat' ? num : '+'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="vd-bus-rear">Arka</div>
          </div>

          <div className="vd-legend">
            <span><i className="vd-dot seat" /> Koltuk</span>
            <span><i className="vd-dot aisle" /> Koridor</span>
            <span><i className="vd-dot empty" /> Boş</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VehicleDesign;
