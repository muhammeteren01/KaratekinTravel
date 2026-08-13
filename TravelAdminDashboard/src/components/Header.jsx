import React, { useEffect, useState } from 'react';
import './Header.css';
import { fetchMyNotificationsApi } from '../services/adminApi';

// Import icons
import settingsGearIcon from '../assets/icons/settings-gear-icon.svg';
import notificationIcon from '../assets/icons/notification-icon.svg';
import profileAvatar from '../assets/images/profile-avatar.png';

const Header = ({ 
  title = "Anasayfa", 
  breadcrumb = null,
  showMobileMenu = false,
  onMobileMenuToggle = null,
  onSettingsClick = null,
  onNotificationsClick = null,
}) => {
  // Okunmamış bildirim sayısı. Zil düğmesi bildirim sayfasını açıyordu ama
  // yeni bir şey olup olmadığı düğmeye basmadan anlaşılmıyordu.
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = () => {
      fetchMyNotificationsApi()
        .then((list) => {
          if (!alive) return;
          const rows = Array.isArray(list) ? list : (list?.recent || []);
          setUnreadCount(rows.filter((n) => !n.isRead && !n.isArchived).length);
        })
        .catch(() => {
          // Bildirim sayısı ikincil bilgi; hata başlığı bozmasın.
          if (alive) setUnreadCount(0);
        });
    };

    load();
    // Sayfa yenilenmeden gelen bildirimler için düzenli tazeleme.
    const timer = setInterval(load, 60000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="hd-header">
      <div className="hd-header-content">
        <div className="hd-header-left">
          {/* Mobile menu button */}
          {showMobileMenu && (
            <button className="hd-mobile-menu-btn" onClick={onMobileMenuToggle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          {/* Title or Breadcrumb */}
          {breadcrumb ? (
            <div className="hd-header-breadcrumb">
              <span className="hd-breadcrumb-text">{breadcrumb}</span>
            </div>
          ) : (
            <h1 className="hd-header-title">{title}</h1>
          )}
        </div>
        
        <div className="hd-header-actions">
          <div className="hd-header-icons">
            <button className="hd-header-icon-btn" onClick={onSettingsClick}>
              <img src={settingsGearIcon} alt="Settings" className="hd-header-icon" />
            </button>
            <button
              className="hd-header-icon-btn"
              onClick={onNotificationsClick}
              aria-label={unreadCount > 0 ? `Bildirimler, ${unreadCount} okunmamış` : 'Bildirimler'}
            >
              <img src={notificationIcon} alt="" className="hd-header-icon" />
              {unreadCount > 0 && (
                <span className="hd-badge" aria-hidden>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
          </div>
          <div className="hd-profile-avatar">
            <img src={profileAvatar} alt="Profile" className="hd-avatar-image" />
          </div>
        </div>
      </div>
      <div className="hd-header-divider"></div>
    </div>
  );
};

export default Header; 