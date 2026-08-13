import React, { useMemo, useState, useEffect, useRef } from 'react';
import './CouponManagement.css';
import CouponBarChart from '../components/CouponBarChart';
import DateTimePicker from '../components/DateTimePicker';
import { createCouponApi, deleteCouponApi, fetchCouponsApi, updateCouponApi } from '../services/adminApi';
import { getSelectedTour } from '../utils/selectionStorage';
import { useFeedback } from '../components/feedback/feedbackContext';

const CouponManagement = ({ isSidebarCollapsed }) => {
  const { confirm } = useFeedback();
  // Tur seçili değilse örnek bir tur adı uydurmak yerine boş bırakılıyor.
  const selectedTour = useMemo(() => getSelectedTour() || { name: '' }, []);

  const [form, setForm] = useState({ code: '', type: 'percent', value: '', start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const todayStr = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date();
    return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ value: '', isActive: true });

  const selectedCompanyId = selectedTour.companyId || selectedTour.companyID || null;

  const parseDisplayDate = (value) => {
    if (!value) return null;
    const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2}):(\d{2})/);
    if (!match) return null;
    const [, day, month, year, hour, minute] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  };

  const formatCouponDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    let alive = true;

    const loadCoupons = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchCouponsApi();
        if (!alive) return;
        const normalized = (Array.isArray(response) ? response : [])
          .filter((coupon) => !selectedCompanyId || !coupon.companyId || String(coupon.companyId) === String(selectedCompanyId))
          .map((coupon) => ({
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            start: formatCouponDate(coupon.startDate),
            end: formatCouponDate(coupon.endDate),
            used: coupon.usedCount ?? 0,
            raw: coupon,
          }));
        setCoupons(normalized);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Kuponlar yüklenemedi.');
        setCoupons([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadCoupons();

    return () => {
      alive = false;
    };
  }, [selectedCompanyId]);

  // Filter dropdown (chart + usage list)
  const [filterCode, setFilterCode] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const displayCoupons = useMemo(() => (
    filterCode === 'all' ? coupons : coupons.filter(c => c.code === filterCode)
  ), [coupons, filterCode]);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(coupons.length / pageSize));
  const paginatedCoupons = useMemo(() => {
    const start = (page - 1) * pageSize;
    return coupons.slice(start, start + pageSize);
  }, [coupons, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const addCoupon = () => {
    if (!form.code || !form.value || !form.start || !form.end) {
      setError('Kupon kodu, değer ve tarih aralığı zorunludur.');
      return;
    }

    const startDate = parseDisplayDate(form.start);
    const endDate = parseDisplayDate(form.end);

    if (!startDate || !endDate) {
      setError('Geçerli tarih seçiniz.');
      return;
    }

    setSaving(true);
    setError('');

    createCouponApi({
      code: form.code.trim(),
      companyId: selectedCompanyId,
      type: form.type,
      value: Number(form.value),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      maxUsage: null,
      isActive: true,
    })
      .then((created) => {
        setCoupons((prev) => [{
          id: created?.id,
          code: created?.code || form.code.trim(),
          type: created?.type || form.type,
          value: created?.value ?? Number(form.value),
          start: formatCouponDate(created?.startDate || startDate.toISOString()),
          end: formatCouponDate(created?.endDate || endDate.toISOString()),
          used: created?.usedCount ?? 0,
          raw: created,
        }, ...prev]);
        setPage(1);
        setForm({ code: '', type: 'percent', value: '', start: '', end: '' });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Kupon kaydedilemedi.'))
      .finally(() => setSaving(false));
  };

  const typeLabel = (t) => t === 'amount' ? 'Tutar' : 'Yüzde - (%)';
  const valueLabel = (c) => c.type === 'amount' ? `${c.value} TL` : `${c.value}`;

  const startEdit = (coupon) => {
    setEditingId(coupon.id);
    setEditForm({
      value: String(coupon.value ?? ''),
      isActive: coupon.raw?.isActive ?? true,
    });
  };

  const saveEdit = async (coupon) => {
    const startDate = parseDisplayDate(coupon.start);
    const endDate = parseDisplayDate(coupon.end);
    if (!startDate || !endDate) {
      setError('Kupon tarihleri geçersiz.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const updated = await updateCouponApi(coupon.id, {
        code: coupon.code,
        companyId: coupon.raw?.companyId ?? selectedCompanyId,
        type: coupon.type,
        value: Number(editForm.value),
        startDate: (coupon.raw?.startDate || startDate.toISOString()),
        endDate: (coupon.raw?.endDate || endDate.toISOString()),
        maxUsage: coupon.raw?.maxUsage ?? null,
        isActive: editForm.isActive,
      });

      setCoupons((prev) => prev.map((row) => (
        row.id === coupon.id
          ? {
              ...row,
              value: updated?.value ?? Number(editForm.value),
              raw: updated || row.raw,
            }
          : row
      )));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kupon güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const removeCoupon = async (coupon) => {
    const confirmed = await confirm({
      title: 'Kupon silinsin mi?',
      message: `"${coupon.code}" kuponu kalıcı olarak silinecek.`,
      confirmLabel: 'Evet, sil',
      danger: true,
    });
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      await deleteCouponApi(coupon.id);
      setCoupons((prev) => prev.filter((row) => row.id !== coupon.id));
      if (editingId === coupon.id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kupon silinemedi.');
    } finally {
      setSaving(false);
    }
  };

  // usage list pagination (right card)
  const [usagePage, setUsagePage] = useState(1);
  const usagePageSize = 4;
  const usageTotalPages = Math.max(1, Math.ceil(displayCoupons.length / usagePageSize));
  const usageItems = useMemo(() => {
    const start = (usagePage - 1) * usagePageSize;
    return displayCoupons.slice(start, start + usagePageSize);
  }, [displayCoupons, usagePage]);
  useEffect(() => { if (usagePage > usageTotalPages) setUsagePage(usageTotalPages); }, [usageTotalPages, usagePage]);

  return (
    <div className={`coupon-page ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="coupon-wrap">
        <h2 className="cp-title">{selectedTour.name ? `“${selectedTour.name}” ` : ''}Kupon Tanımlama İşlemi</h2>
        <div className="cp-sub">Bu alanda seçili tura özel indirim kuponu tanımlayabilirsiniz.</div>
        {error && <div className="table-error">{error}</div>}

        {/* Create Coupon Card */}
        <div className="cp-card cp-create">
          <div className="cp-left">
            <div className="cp-icon-circle">
              <img src="/icons/hi-kupon.svg" alt="Kupon" />
            </div>
          </div>
          <div className="cp-right">
            <div className="cp-grid">
              <div className="cp-field">
                <label>Tur Adı</label>
                <input value={selectedTour.name} readOnly placeholder="Tur seçilmedi" />
              </div>
              <div className="cp-field">
                <label>İndirim Tipi</label>
                <div className="cp-select">
                  <select value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
                    <option value="percent">Yüzde - (%)</option>
                    <option value="amount">Tutar</option>
                  </select>
                </div>
              </div>
              <div className="cp-field">
                <label>Kupon Kodu</label>
                <input placeholder="KSTMN20" value={form.code} onChange={e=>setForm(f=>({...f, code:e.target.value}))} />
              </div>
              <div className="cp-field">
                <label>İndirim Değeri</label>
                <input placeholder={form.type==='amount'?'350':'%20'} value={form.value} onChange={e=>setForm(f=>({...f, value:e.target.value}))} />
              </div>
              <div className="cp-field">
                <label>Başlangıç Tarihi</label>
                <DateTimePicker
                  value={form.start}
                  min={todayStr}
                  onChange={(v)=>{
                    setForm((f)=>{
                      // Eğer yeni başlangıç mevcut bitişten sonra ise, bitişi başlangıca çek
                      const newStart = v;
                      const s = newStart;
                      const e = f.end;
                      if (s && e) {
                        // compare by parsing
                        const parse = (x)=>{
                          const m = x.match(/(\d{2})\.(\d{2})\.(\d{4}).*(\d{2}):(\d{2})/);
                          if(!m) return null;
                          return new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5]);
                        };
                        const sd = parse(s); const ed = parse(e);
                        if (sd && ed && sd > ed) {
                          return { ...f, start: newStart, end: newStart };
                        }
                      }
                      return { ...f, start: newStart };
                    });
                  }}
                />
              </div>
              <div className="cp-field">
                <label>Bitiş Tarihi</label>
                <DateTimePicker
                  value={form.end}
                  min={form.start || todayStr}
                  onChange={(v)=> setForm(f=>({...f, end: v}))}
                />
              </div>
            </div>

            <button className="cp-primary" onClick={addCoupon} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kupon Oluştur'}</button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="cp-section">
          <div className="cp-section-title">{selectedTour.name ? `“${selectedTour.name}” için ` : ''}Mevcut Kuponlar</div>
          <div className="cp-table-card">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>
                    <div className="cp-th"><img src="/icons/th-coupon-code.svg" alt="" /><span>KUPON KODU</span></div>
                  </th>
                  <th>
                    <div className="cp-th"><img src="/icons/th-coupon-type.svg" alt="" /><span>KUPON TİPİ</span></div>
                  </th>
                  <th>
                    <div className="cp-th"><img src="/icons/th-coupon-value.svg" alt="" /><span>İNDİRİM DEĞERİ</span></div>
                  </th>
                  <th>
                    <div className="cp-th"><img src="/icons/th-calendar.svg" alt="" /><span>BAŞLANGIÇ - BİTİŞ TARİHİ</span></div>
                  </th>
                  <th>
                    <div className="cp-th"><span>İŞLEMLER</span></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>Kuponlar yükleniyor...</td></tr>
                ) : paginatedCoupons.map((c) => (
                  <tr key={c.id || c.code}>
                    <td>{c.code}</td>
                    <td>{typeLabel(c.type)}</td>
                    <td>
                      {editingId === c.id ? (
                        <input
                          value={editForm.value}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                          style={{ width: '80px' }}
                        />
                      ) : valueLabel(c)}
                    </td>
                    <td>{c.start} - {c.end}</td>
                    <td>
                      {editingId === c.id ? (
                        <>
                          <label style={{ marginRight: 8 }}>
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                            />
                            {' '}Aktif
                          </label>
                          <button type="button" className="cp-page-btn" disabled={saving} onClick={() => saveEdit(c)}>Kaydet</button>
                          <button type="button" className="cp-page-btn" onClick={() => setEditingId(null)}>İptal</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="cp-page-btn" onClick={() => startEdit(c)}>Düzenle</button>
                          <button type="button" className="cp-page-btn" disabled={saving} onClick={() => removeCoupon(c)}>Sil</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cp-pagination">
            <button className="cp-page-btn cp-page-arrow" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} aria-label="Önceki">
              <img src="/icons/arrow-prev.svg" alt="" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`cp-page-btn ${page===n ? 'active' : ''}`} onClick={()=>setPage(n)}>{n}</button>
            ))}
            <button className="cp-page-btn cp-page-arrow" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} aria-label="Sonraki">
              <img src="/icons/arrow-next.svg" alt="" />
            </button>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="cp-section">
          <div className="cp-section-card">
            <div className="cp-section-title">“{selectedTour.name}” için Kullanılan Kupon Miktarı</div>
            <div className="cp-usage">
            <div className="cp-chart">
              <div className="cp-filter" ref={filterRef}>
                <button type="button" className={`cp-filter-btn ${filterOpen?'open':''}`} onClick={() => setFilterOpen(o=>!o)}>
                  {filterCode==='all' ? 'Tüm Kuponlar' : filterCode}
                  <img src="/icons/chevron-down-icon.svg" alt="" />
                </button>
                {filterOpen && (
                  <div className="cp-filter-menu">
                    <button className={`item ${filterCode==='all'?'active':''}`} onClick={()=>{ setFilterCode('all'); setUsagePage(1); setFilterOpen(false); }}>Tüm Kuponlar</button>
                    {coupons.map(c => (
                      <button key={c.code} className={`item ${filterCode===c.code?'active':''}`} onClick={()=>{ setFilterCode(c.code); setUsagePage(1); setFilterOpen(false); }}>{c.code}</button>
                    ))}
                  </div>
                )}
              </div>
              <CouponBarChart title="Kullanan Kişi Sayısı" items={displayCoupons} color="#24BAEC" height={280} />
            </div>
            <div className="cp-usage-list">
              <div className="cp-usage-head">
                <div className="cp-usage-col left">
                  <img src="/icons/th-coupon-code.svg" alt="" />
                  <span>KUPON BİLGİSİ</span>
                </div>
                <div className="cp-usage-col right">
                  <img src="/icons/people-icon.svg" alt="" />
                  <span>KULLANAN KİŞİ</span>
                </div>
              </div>
              <div className="cp-usage-rows">
                {usageItems.map(c => (
                  <div key={c.code} className="cp-usage-item">
                    <div className="cp-usage-code">{c.code} – {c.type === 'amount' ? `${c.value}TL` : `%${c.value}`}</div>
                    <div className="cp-usage-count">{c.used}</div>
                  </div>
                ))}
              </div>
              <div className="cp-pagination cp-usage-pagination">
                <button className="cp-page-btn cp-page-arrow" disabled={usagePage===1} onClick={()=>setUsagePage(p=>Math.max(1,p-1))} aria-label="Önceki">
                  <img src="/icons/arrow-prev.svg" alt="" />
                </button>
                {Array.from({ length: usageTotalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`cp-page-btn ${usagePage===n ? 'active' : ''}`} onClick={()=>setUsagePage(n)}>{n}</button>
                ))}
                <button className="cp-page-btn cp-page-arrow" disabled={usagePage===usageTotalPages} onClick={()=>setUsagePage(p=>Math.min(usageTotalPages,p+1))} aria-label="Sonraki">
                  <img src="/icons/arrow-next.svg" alt="" />
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
