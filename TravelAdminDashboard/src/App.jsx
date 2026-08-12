import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserCommunication from './pages/UserCommunication';
import TourManagement from './pages/TourManagement';
import TripAnalysis from './pages/TripAnalysis';
import { AddTourPage, CancellationRefunds, Finance, VehicleDesign, NewVehicleDefinition, VehicleHistory } from './components';
import TourReviews from './components/TourReviews';
import UpdateTourPage from './components/UpdateTourPage';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import VehicleList from './components/VehicleList';
import TourDetails from './pages/TourDetails';
import UpdateSubDate from './pages/UpdateSubDate';
import PostTourImages from './pages/PostTourImages';
import DeleteTour from './pages/DeleteTour';
import CouponManagement from './pages/CouponManagement';
import NewSubDate from './pages/NewSubDate';
import './App.css';
import SubTourDetails from './pages/SubTourDetails';
import HotelDrafts from './pages/HotelDrafts';
import NewHotelDraft from './pages/NewHotelDraft';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import DemoBanner from './components/DemoBanner';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { ApiError, canAccessDashboard, clearAdminToken, fetchMeApi, getAdminToken } from './services/adminApi';

function App() {
  const [profile, setProfile] = useState(null);
  const [booting, setBooting] = useState(() => Boolean(getAdminToken()));

  useEffect(() => {
    if (!getAdminToken()) {
      setBooting(false);
      return;
    }

    let alive = true;

    fetchMeApi()
      .then((me) => {
        if (alive) setProfile(me);
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 401) {
          clearAdminToken();
        }
        setProfile(null);
      })
      .finally(() => {
        if (alive) setBooting(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    setProfile(null);
  };

  if (booting) {
    return (
      <div className="App" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: '#343C6A', gap: 8 }}>
        <div>Oturum doğrulanıyor...</div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>API yanıt vermezse kısa süre sonra giriş ekranına döner.</div>
      </div>
    );
  }

  if (!profile) {
    return <LoginPage onAuthenticated={setProfile} />;
  }

  // Yetkisiz rollerde panel açılırsa her ekran 403 döner; net bir uyarı göster.
  if (!canAccessDashboard(profile.role)) {
    return <UnauthorizedPage profile={profile} onLogout={handleLogout} />;
  }

  return (
    <div className="App">
      <DemoBanner />
      <Layout onLogout={handleLogout}>
        <AppContent />
      </Layout>
    </div>
  );
}

// Separate component to handle page rendering inside Layout
const AppContent = ({ currentPage = 'Anasayfa', isSidebarCollapsed }) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'Ayarlar':
        return <Settings isSidebarCollapsed={isSidebarCollapsed} />;
      // Gezi İşlemleri sayfaları
      case 'Tur Yönetim':
        return <TourManagement isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Tur Detayları':
        return <TourDetails isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Yeni Tur Ekle':
        return <AddTourPage />;
      case 'Otel Taslakları':
        return <HotelDrafts isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Yeni Otel Ekle':
        return <NewHotelDraft isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Tur Güncelle':
        return <UpdateTourPage />;
      case 'Kupon Yönetimi':
        return <CouponManagement isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Yeni Alt Tarih':
        return <NewSubDate isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Alt Tur Güncelle':
        return <UpdateSubDate isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Tur Sonu Görseller':
        return <PostTourImages isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Alt Tur Detayları':
        return <SubTourDetails isSidebarCollapsed={isSidebarCollapsed} />;
      case 'Tur Sil':
        return <DeleteTour isSidebarCollapsed={isSidebarCollapsed} />;
      case 'İptal ve İade İşlemleri':
        return <CancellationRefunds />;
      case 'Finans':
        return <Finance />;
      case 'Analizler':
        return <TripAnalysis />;
      
      // Araç İşlemleri sayfaları
      case 'Araç Listesi':
        return <VehicleList />;
      case 'Yeni Araç Tasarla':
        return <VehicleDesign />;
      case 'Yeni Araç Tanımla':
        return <NewVehicleDefinition />;
      case 'Geçmiş İşlemler':
        return <VehicleHistory />;
      
      case 'Araç İşlemleri':
        return <Dashboard />; // Geçici olarak Dashboard göster
      case 'Kullanıcı İletişim':
        return <UserCommunication />;
      case 'Kullanıcı İşlemleri':
        return <UserCommunication />;
      case 'Tur Değerlendirmeleri':
        return <TourReviews />;
      case 'Bildirimler':
        return <Notifications />;
      case 'Anasayfa':
      default:
        return <Dashboard />;
    }
  };

  // resetKey: sayfa değişince çöken ekranın hata durumu temizlensin.
  return <ErrorBoundary resetKey={currentPage}>{renderPage()}</ErrorBoundary>;
};

export default App;
