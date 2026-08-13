import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DayPicker.css';

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const WEEKDAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Rota duraklarının hangi tur gününe düştüğünü seçer.
 *
 * Rota adımında yalnızca saat alanı vardı: birden fazla gün süren turlarda
 * "09:00" değerinin hangi güne ait olduğu belirsiz kalıyordu.
 *
 * @param {number} value seçili gün (1 tabanlı)
 * @param {number} dayCount turun kaç gün sürdüğü
 * @param {Date|string} [startDate] turun başlangıç tarihi; verilirse takvim günü de gösterilir
 */
const DayPicker = ({ value, onChange, dayCount = 1, startDate = null, label = 'Gün' }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const totalDays = Math.max(1, Number(dayCount) || 1);
  const selected = Math.min(Math.max(1, Number(value) || 1), totalDays);

  const start = useMemo(() => {
    if (!startDate) return null;
    const d = startDate instanceof Date ? startDate : new Date(startDate);
    return Number.isNaN(d.getTime()) ? null : startOfDay(d);
  }, [startDate]);

  const days = useMemo(() => (
    Array.from({ length: totalDays }, (_, index) => {
      const dayNumber = index + 1;
      if (!start) return { dayNumber, date: null };
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      return { dayNumber, date };
    })
  ), [totalDays, start]);

  // Dışarı tıklayınca kapansın.
  useEffect(() => {
    if (!open) return undefined;

    const onDocumentClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getDate()} ${MONTHS_TR[date.getMonth()]}`;
  };

  const selectedDay = days.find((d) => d.dayNumber === selected) || days[0];
  const buttonLabel = selectedDay?.date
    ? `${selectedDay.dayNumber}. Gün · ${formatDate(selectedDay.date)}`
    : `${selectedDay?.dayNumber || 1}. Gün`;

  return (
    <div className="dp-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dp-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${label} seçimi`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="dp-trigger-text">{buttonLabel}</span>
        <svg
          className="dp-chevron"
          width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="dp-pop" role="listbox" aria-label={`${label} listesi`}>
          <div className="dp-pop-head">
            <span>{totalDays} günlük tur</span>
            {start && <span className="dp-pop-sub">{formatDate(start)} başlangıçlı</span>}
          </div>

          {start && (
            <div className="dp-weekdays" aria-hidden>
              {WEEKDAYS_TR.map((w) => <span key={w}>{w}</span>)}
            </div>
          )}

          <div className={`dp-days ${start ? 'is-calendar' : ''}`}>
            {days.map(({ dayNumber, date }) => (
              <button
                key={dayNumber}
                type="button"
                role="option"
                aria-selected={dayNumber === selected}
                className={`dp-day ${dayNumber === selected ? 'is-selected' : ''}`}
                onClick={() => {
                  onChange?.(dayNumber);
                  setOpen(false);
                }}
                title={date ? `${dayNumber}. gün — ${formatDate(date)}` : `${dayNumber}. gün`}
              >
                <span className="dp-day-number">{dayNumber}</span>
                {date && <span className="dp-day-date">{date.getDate()}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayPicker;
