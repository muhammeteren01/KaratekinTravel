import React, { useMemo, useRef, useState, useEffect } from 'react';
import './AllReviewsList.css';
import ReportModal from './ReportModal';
import { createReviewReportApi } from '../services/adminApi';

// Local star components (kept simple)
const Star = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#F7B63E' : 'none'} stroke="#F7B63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const Rating = ({ value = 0 }) => (
  <div className="ar-stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < value} />)}</div>
);

const Dropdown = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="ar-dd" ref={ref}>
      <button className="ar-chip" onClick={() => setOpen((s) => !s)}>
        {label}: <strong>{value}</strong>
        <img src="/icons/chevron-down-icon.svg" alt="aç" />
      </button>
      {open && (
        <div className="ar-menu">
          {options.map((opt) => (
            <div key={opt} className={`ar-menu-item ${opt === value ? 'active' : ''}`} onClick={() => { onChange(opt); setOpen(false); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AllReviewsList = ({ reviews = [] }) => {
  const [ratingSort, setRatingSort] = useState('Yüksekten Düşüğe');
  const [dateSort, setDateSort] = useState('En Yeni');
  const tours = useMemo(() => ['Tüm Turlar', ...Array.from(new Set(reviews.map(r => r.tour)))], [reviews]);
  const [tourFilter, setTourFilter] = useState('Tüm Turlar');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;

  const parseDate = (s) => {
    try {
      const [datePart, timePart] = s.split(' - ').map(str => str.trim());
      const [d, m, y] = datePart.split('.').map(Number);
      const [hh, mm] = timePart.split(':').map(Number);
      return new Date(y, m - 1, d, hh, mm);
    } catch { return new Date(0); }
  };

  const processed = useMemo(() => {
    let arr = [...reviews];
    if (tourFilter !== 'Tüm Turlar') arr = arr.filter(r => r.tour === tourFilter);
    if (q) {
      const v = q.toLowerCase();
      arr = arr.filter(r => `${r.user} ${r.tour} ${r.comment}`.toLowerCase().includes(v));
    }
    // sort by date first
    arr.sort((a,b) => dateSort === 'En Yeni' ? (parseDate(b.date)-parseDate(a.date)) : (parseDate(a.date)-parseDate(b.date)));
    // then stable sort by rating if needed
    if (ratingSort === 'Yüksekten Düşüğe') arr.sort((a,b) => b.rating - a.rating);
    else if (ratingSort === 'Düşükten Yükseğe') arr.sort((a,b) => a.rating - b.rating);
    return arr;
  }, [reviews, tourFilter, q, dateSort, ratingSort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const pageItems = processed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [ratingSort, dateSort, tourFilter, q]);

  const renderAvatar = () => (
    <div className="ar-avatar ar-avatar--person">
      <img src="/icons/people-alt-filled.svg" alt="Kullanıcı" />
    </div>
  );

  // Modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const openReport = (r) => { setSelectedReview(r); setReportError(''); setReportOpen(true); };
  const submitReport = async (payload) => {
    if (!payload.reviewId) {
      setReportError('Geçersiz değerlendirme.');
      return;
    }

    try {
      setReportSubmitting(true);
      setReportError('');
      await createReviewReportApi({
        reviewId: payload.reviewId,
        category: payload.category,
        details: payload.details,
      });
      setReportOpen(false);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Şikayet gönderilemedi.');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <section className="ar-wrapper">
      <div className="ar-header">
        <h2>Tüm Değerlendirmeler</h2>
        <div className="ar-controls">
          <Dropdown label="Puana Göre Sırala" value={ratingSort} options={["Yüksekten Düşüğe","Düşükten Yükseğe","Sıralama Yok"]} onChange={setRatingSort} />
          <Dropdown label="Tarihe Göre Sırala" value={dateSort} options={["En Yeni","En Eski"]} onChange={setDateSort} />
          <Dropdown label="Tur Filtrele" value={tourFilter} options={tours} onChange={setTourFilter} />
          <div className="ar-search">
            <img src="/icons/search-icon.svg" alt="ara" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Anahtar Kelime ile Arayın" />
          </div>
        </div>
      </div>

      <div className="ar-list">
        {pageItems.map((r) => (
          <div className="ar-item" key={r.id}>
            {renderAvatar()}
            <div className="ar-item-body">
              <div className="ar-top">
                <div className="ar-name-row">
                  <span className="ar-date">{r.date}</span>
                </div>
                <div className="ar-tour">{r.tour}</div>
                <div className="ar-rating-row">
                  <Rating value={r.rating} />
                  <span className="ar-rating-text">{r.rating}/5</span>
                </div>
              </div>
              <div className="ar-comment-bubble">{r.comment || '—'}</div>
            </div>
            <button className="ar-report" onClick={()=>openReport(r)}>
              <img src="/icons/notification-bell.svg" alt="bildir" />
              <span>Bildir</span>
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          className="next-btn" 
          disabled={page===1} 
          onClick={()=>setPage(p=>Math.max(1,p-1))}
          aria-label="Önceki"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Önceki
        </button>
        <div className="pagination-numbers">
          {Array.from({length: totalPages}, (_,i)=> i+1).map(n => (
            <button 
              key={n} 
              className={`page-btn ${n===page ? 'active' : ''}`} 
              onClick={()=>setPage(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <button 
          className="next-btn" 
          disabled={page===totalPages} 
          onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
          aria-label="Sonraki"
        >
          Sonraki
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {reportError && <div className="table-error">{reportError}</div>}

      <ReportModal 
        open={reportOpen} 
        onClose={()=>setReportOpen(false)} 
        onSubmit={submitReport}
        review={selectedReview}
        submitting={reportSubmitting}
      />
    </section>
  );
};

export default AllReviewsList;
