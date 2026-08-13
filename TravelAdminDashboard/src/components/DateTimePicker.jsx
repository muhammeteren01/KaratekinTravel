import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DateTimePicker.css';
import { useFeedback } from './feedback/feedbackContext';

const monthsTR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const pad = (n) => String(n).padStart(2, '0');
const formatOut = (d, h, m) => `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} - ${pad(h)}:${pad(m)}`;

const parseIn = (str) => {
  if (!str) return null;
  // Expect: DD.MM.YYYY - HH:MM
  const m = str.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2}):(\d{2})/);
  if (!m) return null;
  const [_, dd, MM, yyyy, HH, mm] = m;
  const d = new Date(Number(yyyy), Number(MM)-1, Number(dd), Number(HH), Number(mm), 0, 0);
  return d;
};

export default function DateTimePicker({ value, onChange, min, max, placeholder='Tarih ve Saat Seç' }){
  const { notify } = useFeedback();
  const [open, setOpen] = useState(false);
  const initial = useMemo(()=> parseIn(value) || new Date(), [value]);
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [selDate, setSelDate] = useState(new Date(initial));
  const [hour, setHour] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());
  const wrapRef = useRef(null);

  const minDate = min ? parseIn(min) : null;
  const maxDate = max ? parseIn(max) : null;

  useEffect(() => {
    const onDoc = (e) => { if (open && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const days = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const firstDow = first.getDay(); // 0 Sun
    const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Monday first
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const arr = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      arr.push({ d: new Date(year, month-1, prevDays - i), outside: true });
    }
    for (let d = 1; d <= daysInMonth; d++) arr.push({ d: new Date(year, month, d), outside: false });
    while (arr.length % 7 !== 0) {
      const last = arr[arr.length-1].d;
      arr.push({ d: new Date(last.getFullYear(), last.getMonth(), last.getDate()+1), outside: true });
    }
    return arr;
  }, [view]);

  const isDisabledDay = (d) => {
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const weeks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < days.length; i += 7) arr.push(days.slice(i, i+7));
    return arr;
  }, [days]);

  const confirm = () => {
    if (!selDate) return;
    const chosen = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate(), hour, minute, 0, 0);
    if (minDate && chosen < minDate) {
      notify('Seçilen tarih başlangıç tarihinden önce olamaz.', 'warning');
      return;
    }
    if (maxDate && chosen > maxDate) {
      notify('Seçilen tarih izin verilen aralığın dışında.', 'warning');
      return;
    }
    const out = formatOut(selDate, hour, minute);
    onChange && onChange(out);
    setOpen(false);
  };

  return (
    <div className="dtp-wrap" ref={wrapRef}>
      <div className="dtp-input-wrap" onClick={() => setOpen((v)=>!v)}>
        <input className="dtp-input" value={value || ''} placeholder={placeholder} readOnly />
        <img className="dtp-ico" src="/icons/calendar-icon.svg" alt="Takvim" />
      </div>
      {open && (
        <div className="dtp-pop">
          <div className="dtp-head">
            <button className="dtp-nav" onClick={()=> setView(new Date(view.getFullYear(), view.getMonth()-1, 1))}>
              <img src="/icons/route-chevron-left.svg" alt="Önceki" />
            </button>
            <div className="dtp-month">{monthsTR[view.getMonth()]} {view.getFullYear()}</div>
            <button className="dtp-nav" onClick={()=> setView(new Date(view.getFullYear(), view.getMonth()+1, 1))}>
              <img src="/icons/route-chevron-right.svg" alt="Sonraki" />
            </button>
          </div>
          <div className="dtp-grid">
            {['Pz','Sa','Çr','Pe','Cu','Ct','Pa'].map((w)=>(<div key={w} className="dtp-wd">{w}</div>))}
            {weeks.map((wk, wi)=>(
              <React.Fragment key={wi}>
                {wk.map(({d, outside}, di)=>{
                  const isSel = selDate && d.toDateString() === new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate()).toDateString();
                  const dis = isDisabledDay(d);
                  return (
                    <button
                      type="button"
                      key={di}
                      className={`dtp-day ${outside?'outside':''} ${isSel?'sel':''}`}
                      onClick={()=>{ if (!dis) setSelDate(new Date(d)); }}
                      disabled={dis}
                    >{d.getDate()}</button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="dtp-time">
            <select value={hour} onChange={(e)=>setHour(Number(e.target.value))}>
              {Array.from({length:24}, (_,i)=>i).map(h=> <option key={h} value={h}>{pad(h)}</option>)}
            </select>
            <span className="dtp-colon">:</span>
            <select value={minute} onChange={(e)=>setMinute(Number(e.target.value))}>
              {Array.from({length:12}, (_,i)=>i*5).map(m=> <option key={m} value={m}>{pad(m)}</option>)}
            </select>
          </div>
          <div className="dtp-actions">
            <button className="dtp-btn cancel" onClick={()=>setOpen(false)}>İptal</button>
            <button className="dtp-btn ok" onClick={confirm}>Tarihi Seç</button>
          </div>
        </div>
      )}
    </div>
  );
}
