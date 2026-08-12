import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import StatsCard from '../components/StatsCard';
import Chart from '../components/Chart';
import TripCard from '../components/TripCard';
import DataTable from '../components/DataTable';
import moneyBagIcon from '../assets/icons/money-bag-icon.svg';
import heartIcon from '../assets/icons/heart-icon.svg';
import peopleStatsIcon from '../assets/icons/people-stats-new-icon.svg';
import tripHeartIcon from '../assets/icons/trip-heart-icon.svg';
import tripPlaneIcon from '../assets/icons/trip-plane-icon.svg';
import tripCarIcon from '../assets/icons/trip-car-icon.svg';
import {
  fetchCompanyReportApi,
  fetchFinanceReportApi,
  fetchTripReportApi,
  fetchTripsApi,
} from '../services/adminApi';
import { formatCurrency, getMonthRanges, toApiDate } from '../utils/reportDates';

const TRIP_ICONS = [tripHeartIcon, tripPlaneIcon, tripCarIcon];
const TRIP_ICON_BGS = ['#FFE0EB', '#E7EDFF', '#FFF5D9'];

const FALLBACK_STATS = [
  { title: 'Aylık Kazanç', value: '₺0', icon: moneyBagIcon, iconBgColor: '#DCFAF8', iconColor: 'brightness(0) saturate(100%) invert(85%) sepia(85%) saturate(2618%) hue-rotate(130deg) brightness(95%) contrast(89%)' },
  { title: 'Memnuniyet Oranı', value: '—', icon: heartIcon, iconBgColor: '#FFE0EB', iconColor: 'brightness(0) saturate(100%) invert(65%) sepia(85%) saturate(2618%) hue-rotate(310deg) brightness(95%) contrast(89%)' },
  { title: 'Toplam Rezervasyon', value: '0', icon: peopleStatsIcon, iconBgColor: '#E7EDFF', iconColor: 'none' },
];

const FALLBACK_REVENUE = [
  { month: 'Oca', value: 0 },
  { month: 'Şub', value: 0 },
  { month: 'Mar', value: 0 },
  { month: 'Nis', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Haz', value: 0 },
];

const Dashboard = ({ isSidebarCollapsed }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [financeReport, setFinanceReport] = useState(null);
  const [tripReport, setTripReport] = useState(null);
  const [companyReport, setCompanyReport] = useState(null);
  const [trips, setTrips] = useState([]);
  const [monthlyFinance, setMonthlyFinance] = useState(FALLBACK_REVENUE);

  useEffect(() => {
    let alive = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const ranges = getMonthRanges(6);

        const [finance, trip, company, tripList, ...monthlyReports] = await Promise.all([
          fetchFinanceReportApi(toApiDate(monthStart), toApiDate(now)),
          fetchTripReportApi(toApiDate(monthStart), toApiDate(now)),
          fetchCompanyReportApi(toApiDate(monthStart), toApiDate(now)),
          fetchTripsApi(),
          ...ranges.map(({ start, end }) => fetchFinanceReportApi(toApiDate(start), toApiDate(end)).catch(() => null)),
        ]);

        if (!alive) return;

        setFinanceReport(finance);
        setTripReport(trip);
        setCompanyReport(company);
        setTrips(Array.isArray(tripList) ? tripList : []);

        setMonthlyFinance(
          ranges.map(({ label }, index) => ({
            month: label,
            value: Number(monthlyReports[index]?.netProfit ?? monthlyReports[index]?.totalRevenue ?? 0),
          }))
        );
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Anasayfa verileri yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      alive = false;
    };
  }, []);

  const statsData = useMemo(() => {
    const earnings = financeReport?.netProfit ?? financeReport?.totalRevenue;
    const rating = Number(tripReport?.averageRating ?? companyReport?.averageCompanyRating ?? 0);
    const reservations = tripReport?.totalReservations ?? 0;

    return [
      {
        ...FALLBACK_STATS[0],
        value: earnings != null ? formatCurrency(earnings) : '₺0',
      },
      {
        ...FALLBACK_STATS[1],
        value: rating > 0 ? `${rating.toFixed(1)}/5` : '—',
      },
      {
        ...FALLBACK_STATS[2],
        value: String(reservations),
      },
    ];
  }, [financeReport, tripReport, companyReport]);

  const profileData = useMemo(() => {
    const topTrips = tripReport?.topTrips || [];
    if (!topTrips.length) {
      return FALLBACK_REVENUE.map((item) => ({ ...item, value: 0 }));
    }

    // Grafik "Profil Ziyaretleri" başlıklı; katılımcı sayısına düşmek veriyi
    // yanlış etiketler, bu yüzden yalnızca viewCount kullanılıyor.
    return topTrips.slice(0, 6).map((trip, index) => ({
      month: trip.title?.slice(0, 8) || `Tur ${index + 1}`,
      value: Number(trip.viewCount ?? 0),
    }));
  }, [tripReport]);

  const upcomingTrips = useMemo(() => {
    const now = Date.now();
    const upcoming = (trips || [])
      .filter((trip) => {
        if (!trip.dateStart) return true;
        const start = new Date(trip.dateStart).getTime();
        return !Number.isNaN(start) ? start >= now : true;
      })
      .slice(0, 3);

    if (!upcoming.length) {
      return (tripReport?.topTrips || []).slice(0, 3).map((trip, index) => ({
        icon: TRIP_ICONS[index % TRIP_ICONS.length],
        iconBg: TRIP_ICON_BGS[index % TRIP_ICON_BGS.length],
        name: trip.title || 'Tur',
        // API tur bazında gelir döndürmüyor; uydurma tutar yerine "—" göster.
        revenue: '—',
        participation:
          trip.capacity > 0 ? `${Math.round((trip.joinedCount / trip.capacity) * 100)}%` : '—',
      }));
    }

    return upcoming.map((trip, index) => {
      const capacity = Number(trip.capacity || 0);
      const joined = Number(trip.joinedCount || 0);
      const participation = capacity > 0 ? `${Math.round((joined / capacity) * 100)}%` : '—';
      const price = trip.pricing?.basePrice;

      return {
        icon: TRIP_ICONS[index % TRIP_ICONS.length],
        iconBg: TRIP_ICON_BGS[index % TRIP_ICON_BGS.length],
        name: trip.title || 'Tur',
        revenue: price != null ? formatCurrency(price, trip.pricing?.currency) : '—',
        participation,
      };
    });
  }, [trips, tripReport]);

  const interestingTrips = useMemo(() => {
    const source = tripReport?.topTrips?.length
      ? tripReport.topTrips
      : (trips || []).slice(0, 5);

    return source.slice(0, 5).map((trip, index) => {
      const rating = trip.avgReviewRating ?? trip.rating;
      const price = trip.pricing?.basePrice;

      return {
        id: `${String(index + 1).padStart(2, '0')}.`,
        name: trip.title || 'Tur',
        // Gelir alanı API'de yok (TripStaticsDto fiyat taşımıyor); rezervasyon sayısını
        // çarpıp tutar uydurmak yerine gerçek fiyat varsa onu, yoksa "—" göster.
        price: price != null ? formatCurrency(price, trip.pricing?.currency) : '—',
        return: rating != null ? `+${Number(rating).toFixed(1)}` : '—',
        isPositive: Number(rating ?? 0) >= 3,
      };
    });
  }, [tripReport, trips]);

  return (
    <div className={`dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="dashboard-content">
        {error && <div className="table-error" style={{ marginBottom: 16 }}>{error}</div>}
        {loading && !error && (
          <div style={{ marginBottom: 16, color: '#718EBF' }}>Anasayfa verileri yükleniyor...</div>
        )}

        <div className="stats-section">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        <div className="charts-section">
          <Chart
            title="Aylık Gelir"
            data={monthlyFinance}
            color="#24BAEC"
            height={300}
          />
          <Chart
            title="Profil Ziyaretleri"
            data={profileData}
            color="#FF7029"
            height={300}
          />
        </div>

        <div className="bottom-section">
          <TripCard
            title="Yaklaşan Gezilerim"
            trips={upcomingTrips}
          />
          <DataTable rows={interestingTrips} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
