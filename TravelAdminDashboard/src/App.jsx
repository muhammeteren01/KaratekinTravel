import React, { lazy, Suspense, useEffect, useState } from 'react';
import Layout from './components/Layout';
import './App.css';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { ApiError, canAccessDashboard, clearAdminToken, fetchMeApi, getAdminToken } from './services/adminApi';

// Sayfalar talep üzerine yükleniyor: tek 910 kB'lık paket yerine ekran
// başına ayrı parça. İlk açılışta yalnızca giriş ekranı ve iskelet iniyor.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserCommunication = lazy(() => import('./pages/UserCommunication'));
const TourManagement = lazy(() => import('./pages/TourManagement'));
const TripAnalysis = lazy(() => import('./pages/TripAnalysis'));
const TourReviews = lazy(() => import('./components/TourReviews'));
const UpdateTourPage = lazy(() => import('./components/UpdateTourPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const VehicleList = lazy(() => import('./components/VehicleList'));
const TourDetails = lazy(() => import('./pages/TourDetails'));
const UpdateSubDate = lazy(() => import('./pages/UpdateSubDate'));
const PostTourImages = lazy(() => import('./pages/PostTourImages'));
const DeleteTour = lazy(() => import('./pages/DeleteTour'));
const CouponManagement = lazy(() => import('./pages/CouponManagement'));
const NewSubDate = lazy(() => import('./pages/NewSubDate'));
const SubTourDetails = lazy(() => import('./pages/SubTourDetails'));
const HotelDrafts = lazy(() => import('./pages/HotelDrafts'));
const NewHotelDraft = lazy(() => import('./pages/NewHotelDraft'));
const AddTourPage = lazy(() => import('./components/AddTourPage'));
const CancellationRefunds = lazy(() => import('./components/CancellationRefunds'));
const Finance = lazy(() => import('./components/Finance'));
const VehicleDesign = lazy(() => import('./components/VehicleDesign'));
const NewVehicleDefinition = lazy(() => import('./components/NewVehicleDefinition'));
const VehicleHistory = lazy(() => import('./components/VehicleHistory'));

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
      
      // Sidebar'da bunlar alt menü başlığı; hash ile doğrudan gelinirse
      // bölümün ilk sayfasına düşsün (önceden Anasayfa gösteriyordu).
      case 'Araç İşlemleri':
        return <VehicleList />;
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
  return (
    <ErrorBoundary resetKey={currentPage}>
      <Suspense fallback={<div className="page-loading">Sayfa yükleniyor...</div>}>
        {renderPage()}
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
