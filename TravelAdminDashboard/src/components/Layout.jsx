import React, { useState, useEffect, useReducer } from 'react';
import './Layout.css';
import Sidebar from './Sidebar';
import Header from './Header';
import { readJson, writeJson } from '../utils/storage';

const ROUTING_STATE_KEY = 'routingState';

const DEFAULT_ROUTING_STATE = {
  currentPage: 'Anasayfa',
  currentSection: null
};

// Sayfa -> üst menü eşlemesi. Sidebar'dan section gelmediğinde (ör. hash ile
// doğrudan girişte) breadcrumb'ın doğru çıkması için burada çözülür.
const PAGE_SECTIONS = {
  'Tur Yönetim': 'Gezi İşlemleri',
  'Yeni Tur Ekle': 'Gezi İşlemleri',
  'İptal ve İade İşlemleri': 'Gezi İşlemleri',
  'Finans': 'Gezi İşlemleri',
  'Analizler': 'Gezi İşlemleri',
  'Otel Taslakları': 'Gezi İşlemleri',
  'Yeni Otel Ekle': 'Gezi İşlemleri',
  'Araç Listesi': 'Araç İşlemleri',
  'Yeni Araç Tasarla': 'Araç İşlemleri',
  'Yeni Araç Tanımla': 'Araç İşlemleri',
  'Geçmiş İşlemler': 'Araç İşlemleri'
};

// Routing state reducer
const routingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAGE': {
      const { page, section } = action.payload;
      const newState = {
        currentPage: page,
        // Sidebar açıkça section verdiyse ona uy, yoksa eşlemeden çöz.
        currentSection: section || PAGE_SECTIONS[page] || null
      };
      writeJson(ROUTING_STATE_KEY, newState);
      return newState;
    }
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    default:
      return state;
  }
};

// Initial state loader
const getInitialRoutingState = () => readJson(ROUTING_STATE_KEY, DEFAULT_ROUTING_STATE) || DEFAULT_ROUTING_STATE;

const Layout = ({ children, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use reducer for routing state
  const [routingState, dispatchRouting] = useReducer(routingReducer, getInitialRoutingState());

  const { currentPage, currentSection } = routingState;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Control body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Enable body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobile, isMobileMenuOpen]);

  // Listen for URL hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const decodedHash = hash ? decodeURIComponent(hash) : 'Anasayfa';
      
      dispatchRouting({
        type: 'SET_PAGE',
        payload: { page: decodedHash, section: null }
      });
    };

    // Load initial state from hash or localStorage
    const hash = window.location.hash.slice(1);
    if (hash) {
      // If there's a hash, use it
      const decodedHash = decodeURIComponent(hash);
      dispatchRouting({
        type: 'SET_PAGE',
        payload: { page: decodedHash, section: null }
      });
    } else {
      // If no hash, try to load from localStorage
      const storedState = getInitialRoutingState();
      if (storedState.currentPage !== 'Anasayfa') {
        dispatchRouting({
          type: 'LOAD_FROM_STORAGE',
          payload: storedState
        });
      }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    // Restore body scroll immediately when closing
    if (isMobile) {
      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }, 300); // Match transition duration
    }
  };

  const handlePageChange = (page, section = null) => {
    dispatchRouting({
      type: 'SET_PAGE',
      payload: { page, section }
    });
    // Update URL hash for routing
    if (page !== 'Anasayfa') {
      window.location.hash = encodeURIComponent(page);
    } else {
      window.location.hash = '';
    }
  };

  // Small helper for navigating to details under Gezi İşlemleri
  const goToTourDetails = () => handlePageChange('Tur Detayları', 'Gezi İşlemleri');

  const handleSettingsClick = () => {
    handlePageChange('Ayarlar');
  };

  const handleNotificationsClick = () => {
    handlePageChange('Bildirimler');
  };

  // Generate header props based on current page
  const getHeaderProps = () => {
    if (currentSection && currentPage !== currentSection) {
      // For submenu pages, show breadcrumb
      return {
        breadcrumb: `${currentSection} / ${currentPage}`,
        showMobileMenu: isMobile,
        onMobileMenuToggle: toggleMobileMenu,
  onSettingsClick: () => handlePageChange('Ayarlar'),
  onNotificationsClick: handleNotificationsClick
      };
    } else {
      // For main pages, show title
      return {
        title: currentPage,
        showMobileMenu: isMobile,
        onMobileMenuToggle: toggleMobileMenu,
  onSettingsClick: () => handlePageChange('Ayarlar'),
  onNotificationsClick: handleNotificationsClick
      };
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          className={`ly-mobile-overlay ${isMobileMenuOpen ? 'ly-active' : ''}`}
          onClick={closeMobileMenu}
        />
      )}

      <div className={`ly-layout ${isSidebarCollapsed ? 'ly-sidebar-collapsed' : ''}`}>
        <div className={`ly-layout-sidebar ${isMobile && isMobileMenuOpen ? 'ly-mobile-open' : ''}`}>
          <Sidebar 
            onToggle={handleSidebarToggle} 
            isMobile={isMobile}
            onMobileClose={closeMobileMenu}
            onPageChange={handlePageChange}
            currentPage={currentPage}
            currentSection={currentSection}
            onLogout={onLogout}
          />
        </div>
        <div className="ly-layout-content">
          <Header {...getHeaderProps()} onSettingsClick={handleSettingsClick} />
          {React.cloneElement(children, { 
            isSidebarCollapsed, 
            currentPage, 
            currentSection,
            goToTourDetails
          })}
        </div>
      </div>
    </>
  );
};

export default Layout;