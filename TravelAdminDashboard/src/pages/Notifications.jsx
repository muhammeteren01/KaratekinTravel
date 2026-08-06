import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import './Notifications.css';
import moneyIcon from '../assets/icons/attach-money.svg';
import starIcon from '../assets/icons/people-stats-icon.svg';
import profileIcon from '../assets/icons/user-profile.svg';
import checkIcon from '../assets/icons/check-icon.svg';
import { archiveNotificationApi, fetchMyNotificationsApi, markNotificationReadApi } from '../services/adminApi';
// Use inline SVG for three-dots menu icon (no external asset needed)

// Helpers: extract initials from a quoted name in title (e.g., “Şakir Ayıtkı”) or fallback
const getInitialsFromTitle = (title) => {
  try {
    const m = title?.match(/“([^”]+)”/);
    const name = (m && m[1]) ? m[1] : '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase?.('tr-TR') || (first + last).toUpperCase();
  } catch { return ''; }
};

const MENU_MIN_WIDTH = 220;

const MenuPortal = ({ anchorRef, children }) => {
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  const update = React.useCallback(() => {
    const el = anchorRef?.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(8, r.right - MENU_MIN_WIDTH);
    const top = Math.max(8, r.bottom + 6);
    setPos({ top, left });
  }, [anchorRef]);

  React.useEffect(() => {
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [update]);

  return ReactDOM.createPortal(
    <div className="ntf-menu" style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 2147483647 }} role="menu" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>,
    document.body
  );
};

const NotificationItem = ({ item, onToggleRead }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = React.useRef(null);
  const moreBtnRef = React.useRef(null);
  const initials = useMemo(() => item.type === 'message' ? getInitialsFromTitle(item.title) : '', [item.type, item.title]);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  const iconMap = {
    message: profileIcon,
    payment: moneyIcon,
    review: starIcon,
  };

  return (
    <div ref={rootRef} className={`ntf-item ${item.read ? 'ntf-read' : 'ntf-unread'} ${menuOpen ? 'ntf-open' : ''}`}>
      <div className="ntf-left">
        <span className={`ntf-dot ${item.read ? 'ntf-dot-read' : 'ntf-dot-unread'}`} />
        {item.type === 'message' ? (
          <div className={`ntf-avatar ntf-avatar-${item.type} ntf-avatar-initials`} aria-hidden>
            {initials}
          </div>
        ) : (
          <div className={`ntf-avatar ntf-avatar-${item.type}`}>
            <img src={iconMap[item.type] || profileIcon} alt="icon" />
          </div>
        )}
        <div className="ntf-body">
          <div className="ntf-title">{item.title}</div>
          <div className="ntf-desc">{item.desc}</div>
        </div>
      </div>
      <div className="ntf-right">
        <div className="ntf-time">{item.time}</div>
        <button ref={moreBtnRef} className="ntf-more" aria-haspopup="menu" aria-expanded={menuOpen}
                aria-label="Daha fazla seçenek"
                onClick={() => setMenuOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <circle cx="12" cy="5" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="19" r="2" fill="currentColor"/>
          </svg>
        </button>
        {menuOpen && (
          <MenuPortal anchorRef={moreBtnRef}>
            <button className="ntf-menu-item" onClick={() => { setMenuOpen(false); onToggleRead(item.id, item.read); }}>
              {item.read ? 'Arşivle' : 'Okundu işaretle'}
              <span className={`ntf-check ${item.read ? 'ntf-check-on' : ''}`} aria-hidden>
                <img src={checkIcon} alt="" />
              </span>
            </button>
          </MenuPortal>
        )}
      </div>
    </div>
  );
};

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchMyNotificationsApi();
        if (!alive) return;
        setItems((Array.isArray(response) ? response : []).map((item) => ({
          id: item.id,
          type: item.type === 'payment' || item.type === 'review' || item.type === 'message' ? item.type : 'message',
          read: Boolean(item.isRead),
          title: item.title,
          desc: item.message,
          time: item.time || item.createdAt || '',
          archived: Boolean(item.isArchived),
        })).filter((item) => !item.archived));
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Bildirimler yüklenemedi.');
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      alive = false;
    };
  }, []);

  const handleToggleRead = (id, read) => {
    const request = read ? archiveNotificationApi(id) : markNotificationReadApi(id);
    request
      .then(() => {
        setItems((prev) => prev.filter((n) => n.id !== id));
      })
      .catch((err) => alert(err instanceof Error ? err.message : 'Bildirim güncellenemedi.'));
  };

  return (
    <div className="ntf-page" aria-labelledby="ntf-title">
      <div className="ntf-card">
        {error && <div className="table-error">{error}</div>}
        <ul className="ntf-list" role="list">
          {loading ? (
            <li role="listitem"><div className="ntf-item">Bildirimler yükleniyor...</div></li>
          ) : items.map((item) => (
            <li key={item.id} role="listitem">
              <NotificationItem item={item} onToggleRead={handleToggleRead} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
