import React, { useState, useEffect, useReducer } from 'react';
import './Layout.css';
import Sidebar from './Sidebar';
import Header from './Header';

// Routing state reducer
const routingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAGE':
      const { page, section } = action.payload;
      // If section is explicitly provided (from sidebar submenu), honor it directly
      if (section) {
        const newState = {
          currentPage: page,
          currentSection: section
        };
        localStorage.setItem('routingState', JSON.stringify(newState));
        return newState;
      }
      // Gezi İşlemleri submenu sayfaları için section'ı otomatik set et
  if (page === 'Tur Yönetim' || page === 'Yeni Tur Ekle' || page === 'İptal ve İade İşlemleri' || page === 'Finans' || page === 'Analizler' || page === 'Otel Taslakları' || page === 'Yeni Otel Ekle') {
        const newState = {
          currentPage: page,
          currentSection: 'Gezi İşlemleri'
        };
        // Persist to localStorage
        localStorage.setItem('routingState', JSON.stringify(newState));
        return newState;
      }
      // Araç İşlemleri submenu sayfaları için section'ı otomatik set et
      if (page === 'Araç Listesi' || page === 'Yeni Araç Tasarla' || page === 'Yeni Araç Tanımla' || page === 'Geçmiş İşlemler') {
        const newState = {
          currentPage: page,
          currentSection: 'Araç İşlemleri'
        };
        // Persist to localStorage
        localStorage.setItem('routingState', JSON.stringify(newState));
        return newState;
      }
      const newState = {
        currentPage: page,
        currentSection: section || null
      };
      // Persist to localStorage
      localStorage.setItem('routingState', JSON.stringify(newState));
      return newState;
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    default:
      return state;
  }
};

// Initial state loader
const getInitialRoutingState = () => {
  try {
    const stored = localStorage.getItem('routingState');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading routing state from localStorage:', error);
  }
  return {
    currentPage: 'Anasayfa',
    currentSection: null
  };
};

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