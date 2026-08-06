import React, { useState, useEffect } from 'react';
import './Sidebar.css';

// Import all icons
import addTripIcon from '../assets/icons/add-trip-icon.svg';
import quickAddArrows from '../assets/icons/quick-add-arrows.svg';
import homeIcon from '../assets/icons/home-icon.svg';
import carIcon from '../assets/icons/car-icon.svg';
import tripIcon from '../assets/icons/trip-icon.svg';
import peopleIcon from '../assets/icons/people-icon.svg';
import supportIcon from '../assets/icons/support-icon.svg';
import logoutExitIcon from '../assets/icons/logout-exit-icon.svg';
// Figma-sourced icons
import personelIcon from '../assets/icons/personel-islemleri.svg';
import kullaniciIcon from '../assets/icons/kullanici-islemleri.svg';

const Sidebar = ({ onToggle, isMobile, onMobileClose, onPageChange, currentPage, currentSection, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeSubmenu, setActiveSubmenu] = useState('Tur Yönetim');

  const submenuItems = {
    'Gezi İşlemleri': [
      'Tur Yönetim',
      'Yeni Tur Ekle',
  'Otel Taslakları',
      'İptal ve İade İşlemleri',
      'Finans',
      'Analizler'
    ],
    'Araç İşlemleri': [
      'Araç Listesi',
      'Yeni Araç Tasarla',
      'Yeni Araç Tanımla',
      'Geçmiş İşlemler'
    ],
    'Kullanıcı İşlemleri': [
      'Tur Değerlendirmeleri',
      'Kullanıcı İletişim'
    ]
  };

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, close the sidebar instead of collapsing
      if (onMobileClose) {
        onMobileClose();
      }
    } else {
      // On desktop, toggle collapse
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      if (onToggle) {
        onToggle(newCollapsedState);
      }
    }
  };

  const handleNavItemClick = (menuKey) => {
    // If collapsed and clicking on a submenu item, expand sidebar first
    if (isCollapsed && (menuKey === 'Gezi İşlemleri' || menuKey === 'Araç İşlemleri')) {
      setIsCollapsed(false);
      if (onToggle) {
        onToggle(false);
      }
      // Close all other menus and open the clicked one
      setExpandedMenus({
        [menuKey]: true
      });
      return;
    }
    
    // Close mobile menu when nav item is clicked (if no submenu)
    if (isMobile && onMobileClose && !menuKey) {
      onMobileClose();
    }
    
    // Toggle submenu if it exists
    if (menuKey) {
      setExpandedMenus(prev => {
        const isCurrentlyExpanded = prev[menuKey];
        
        // If clicking on an already expanded menu, just close it
        if (isCurrentlyExpanded) {
          return {
            ...prev,
            [menuKey]: false
          };
        }
        
        // If clicking on a collapsed menu, close all others and open this one
        return {
          [menuKey]: true
        };
      });
    }
  };

  const handleSubmenuClick = (submenuItem, section = 'Gezi İşlemleri') => {
    setActiveSubmenu(submenuItem);
    
    // Notify parent component about page change
    if (onPageChange) {
      onPageChange(submenuItem, section);
    }
    
    // Close mobile menu when submenu item is clicked
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleMainNavClick = (pageName) => {
    // Notify parent component about page change
    if (onPageChange) {
      onPageChange(pageName);
    }
    
    // Close mobile menu when nav item is clicked (if no submenu)
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, []);

  // Sync expanded menus with current section
  useEffect(() => {
    if (currentSection) {
      setExpandedMenus(prev => ({
        ...prev,
        [currentSection]: true
      }));
    }
  }, [currentSection]);

  // Sync active submenu with current page
  useEffect(() => {
    if (currentPage) {
      // Check all submenu sections
      Object.keys(submenuItems).forEach(section => {
        if (submenuItems[section]?.includes(currentPage)) {
          setActiveSubmenu(currentPage);
        }
      });
    }
  }, [currentPage]);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${(expandedMenus['Gezi İşlemleri'] || expandedMenus['Araç İşlemleri']) ? 'expanded-menu' : ''}`}>
      <div className="sidebar-content">
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-container">
            <div className="logo-dots">
              <div className="logo-dot orange"></div>
              <div className="logo-dot blue"></div>
              {isCollapsed && <div className="logo-dot orange-small"></div>}
            </div>
            {!isCollapsed ? (
              <span className="logo-text">TurlaGitsin</span>
            ) : (
              <span className="logo-text-collapsed">io</span>
            )}
          </div>
        </div>

        <div className="sidebar-main">
          {/* Add New Trip Button */}
          <div className="add-trip-section">
            {!isCollapsed ? (
              <>
                <button className="add-trip-btn" onClick={() => handleSubmenuClick('Yeni Tur Ekle')}>
                  <span>Yeni Gezi Ekle</span>
                  <img src={addTripIcon} alt="Add" className="btn-icon" />
                </button>
                <button className="quick-add-btn" onClick={toggleSidebar}>
                  <img src={quickAddArrows} alt="Quick Add" className="quick-icon" />
                </button>
              </>
            ) : (
              <div className="collapsed-buttons">
                <button className="collapsed-add-btn" onClick={() => handleSubmenuClick('Yeni Tur Ekle')}>
                  <img src={addTripIcon} alt="Add" className="btn-icon" />
                </button>
                <button className="collapsed-toggle-btn" onClick={toggleSidebar}>
                  <img src={quickAddArrows} alt="Toggle" className="quick-icon" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            <div className={`nav-item ${currentPage === 'Anasayfa' ? 'active' : ''}`} onClick={() => handleMainNavClick('Anasayfa')}>
              <img src={homeIcon} alt="Home" className="nav-icon" />
              {!isCollapsed && <span>Anasayfa</span>}
            </div>
            {/* Araç İşlemleri with Submenu */}
            <div className="nav-item-container">
              <div 
                className={`nav-item ${expandedMenus['Araç İşlemleri'] ? 'expanded' : ''}`} 
                onClick={() => handleNavItemClick('Araç İşlemleri')}
              >
                <img src={carIcon} alt="Car" className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span>Araç İşlemleri</span>
                    <div className={`nav-arrow ${expandedMenus['Araç İşlemleri'] ? 'rotated' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </>
                )}
              </div>
              
              {/* Submenu */}
              {!isCollapsed && expandedMenus['Araç İşlemleri'] && (
                <div className="submenu">
                  <div className="submenu-line"></div>
                  <div className="submenu-items">
                    {submenuItems['Araç İşlemleri'].map((item, index) => (
                      <div 
                        key={index}
                        className={`submenu-item ${activeSubmenu === item ? 'active' : ''}`}
                        onClick={() => handleSubmenuClick(item, 'Araç İşlemleri')}
                      >
                        <div className="submenu-dot"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Gezi İşlemleri with Submenu */}
            <div className="nav-item-container">
              <div 
                className={`nav-item ${expandedMenus['Gezi İşlemleri'] ? 'expanded' : ''}`} 
                onClick={() => handleNavItemClick('Gezi İşlemleri')}
              >
                <img src={tripIcon} alt="Trip" className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span>Gezi İşlemleri</span>
                    <div className={`nav-arrow ${expandedMenus['Gezi İşlemleri'] ? 'rotated' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </>
                )}
              </div>
              
              {/* Submenu */}
              {!isCollapsed && expandedMenus['Gezi İşlemleri'] && (
                <div className="submenu">
                  <div className="submenu-line"></div>
                  <div className="submenu-items">
                    {submenuItems['Gezi İşlemleri'].map((item, index) => (
                      <div 
                        key={index}
                        className={`submenu-item ${activeSubmenu === item ? 'active' : ''}`}
                        onClick={() => handleSubmenuClick(item)}
                      >
                        <div className="submenu-dot"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Kullanıcı İşlemleri with Submenu */}
            <div className="nav-item-container">
              <div 
                className={`nav-item ${expandedMenus['Kullanıcı İşlemleri'] ? 'expanded' : ''}`} 
                onClick={() => handleNavItemClick('Kullanıcı İşlemleri')}
              >
                <img src={kullaniciIcon} alt="Kullanıcı İşlemleri" className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span>Kullanıcı İşlemleri</span>
                    <div className={`nav-arrow ${expandedMenus['Kullanıcı İşlemleri'] ? 'rotated' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </>
                )}
              </div>
              {!isCollapsed && expandedMenus['Kullanıcı İşlemleri'] && (
                <div className="submenu">
                  <div className="submenu-line"></div>
                  <div className="submenu-items">
                    {submenuItems['Kullanıcı İşlemleri'].map((item, index) => (
                      <div 
                        key={index}
                        className={`submenu-item ${activeSubmenu === item ? 'active' : ''}`}
                        onClick={() => handleSubmenuClick(item, 'Kullanıcı İşlemleri')}
                      >
                        <div className="submenu-dot"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Buttons */}
        <div className="sidebar-bottom">
          <button className="support-btn" onClick={() => handleNavItemClick()}>
            <img src={supportIcon} alt="Support" className="btn-icon" />
            {!isCollapsed && <span>Destek Al</span>}
          </button>
          <button className="logout-btn" type="button" onClick={() => onLogout?.()}>
            <img src={logoutExitIcon} alt="Logout" className="btn-icon" />
            {!isCollapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 