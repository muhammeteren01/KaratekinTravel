import React, { useEffect, useMemo, useState } from 'react';
import './CancellationRefunds.css';
import CancellationStatsCard from './CancellationStatsCard';
import CancellationTable from './CancellationTable';
import CancelledTourDetailsView from './CancelledTourDetailsView';
import TourCancellationForm from './TourCancellationForm';
import RefundRequestsTable from './RefundRequestsTable';
import shoppingCartCancelIcon from '../assets/icons/shopping-cart-cancel.svg';
import directorChairIcon from '../assets/icons/director-chair.svg';
import documentFileSharingIcon from '../assets/icons/document-file-sharing.svg';
import {
  fetchReservationsApi,
  fetchTripReportApi,
  fetchManagedTripsApi,
} from '../services/adminApi';
import { formatDisplayDateTime, getRangeForFilter, toApiDate } from '../utils/reportDates';

const CancellationRefunds = ({ isSidebarCollapsed }) => {
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [activeCard, setActiveCard] = useState(0);
  const [currentView, setCurrentView] = useState('tours');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripReport, setTripReport] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const { start, end } = getRangeForFilter('Aylık');

        const [report, reservationList, tripList] = await Promise.all([
          fetchTripReportApi(toApiDate(start), toApiDate(end)),
          fetchReservationsApi(),
          fetchManagedTripsApi(),
        ]);

        if (!alive) return;
        setTripReport(report);
        setReservations(Array.isArray(reservationList) ? reservationList : []);
        setTrips(Array.isArray(tripList) ? tripList : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'İptal verileri yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();

    return () => {
      alive = false;
    };
  }, []);

  const tripMap = useMemo(
    () => Object.fromEntries(trips.map((trip) => [String(trip.id), trip])),
    [trips]
  );

  const cancelledReservations = useMemo(
    () => reservations.filter((item) => String(item.status || '').toLowerCase() === 'cancelled'),
    [reservations]
  );

  const cancellationData = useMemo(() => {
    const grouped = new Map();

    cancelledReservations.forEach((reservation) => {
      const tripId = String(reservation.tripId);
      const trip = tripMap[tripId];
      const existing = grouped.get(tripId);

      if (existing) {
        existing.cancelCount += 1;
        if (new Date(reservation.updatedAt || reservation.createdAt) > new Date(existing.rawDate)) {
          existing.cancellationDate = formatDisplayDateTime(reservation.updatedAt || reservation.createdAt);
          existing.rawDate = reservation.updatedAt || reservation.createdAt;
        }
      } else {
        grouped.set(tripId, {
          id: tripId,
          tourId: tripId.slice(0, 8).toUpperCase(),
          tourName: trip?.title || tripId,
          cancellationDate: formatDisplayDateTime(reservation.updatedAt || reservation.createdAt),
          cancellationReason: 'Rezervasyon iptali',
          rawDate: reservation.updatedAt || reservation.createdAt,
          cancelCount: 1,
        });
      }
    });

    const fromReport = (tripReport?.topTrips || [])
      .filter((trip) => Number(trip.cancelledReservations || 0) > 0)
      .map((trip) => ({
        id: String(trip.tripId),
        tourId: String(trip.tripId).slice(0, 8).toUpperCase(),
        tourName: trip.title || 'Tur',
        cancellationDate: '—',
        cancellationReason: 'İptal edilen rezervasyon',
        cancelCount: trip.cancelledReservations,
      }));

    const merged = grouped.size ? Array.from(grouped.values()) : fromReport;
    return merged.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));
  }, [cancelledReservations, tripMap, tripReport]);

  const statsData = useMemo(() => [
    {
      title: 'İptal Edilen Turlar',
      value: String(tripReport?.cancelledTrips ?? cancellationData.length),
      icon: shoppingCartCancelIcon,
    },
    {
      title: 'İptal Edilen Biletler',
      value: String(cancelledReservations.length),
      icon: directorChairIcon,
    },
    {
      title: 'Tur İptal İşlemi',
      value: String(cancellationData.length),
      icon: documentFileSharingIcon,
    },
  ], [tripReport, cancellationData, cancelledReservations]);

  const handleDetailsClick = (item) => {
    setSelectedDetails(item);
  };

  const handleCardClick = (index, cardTitle) => {
    setActiveCard(index);

    if (index === 1 || cardTitle === 'İptal Edilen Biletler') {
      setCurrentView('tickets');
    } else if (index === 2 || cardTitle === 'Tur İptal İşlemi') {
      setCurrentView('cancellation');
    } else {
      setCurrentView('tours');
    }
  };

  return (
    <div className={`cancellation-refunds-unique ${isSidebarCollapsed ? 'sidebar-collapsed-unique' : ''}`}>
      <div className="cancellation-content-unique">
        {error && <div className="table-error">{error}</div>}
        {loading && !error && <div style={{ marginBottom: 16, color: '#718EBF' }}>İptal verileri yükleniyor...</div>}

        <div className="stats-cards-container-unique">
          {statsData.map((stat, index) => (
            <CancellationStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              isFirst={index === 0}
              isActive={activeCard === index}
              onClick={() => handleCardClick(index, stat.title)}
            />
          ))}
        </div>

        <div className="mobile-tabs-container">
          <div className="mobile-tabs-nav">
            {statsData.map((stat, index) => (
              <button
                key={index}
                className={`mobile-tab-button ${activeCard === index ? 'active' : ''}`}
                onClick={() => handleCardClick(index, stat.title)}
              >
                {stat.title === 'İptal Edilen Turlar' ? 'Turlar' :
                 stat.title === 'İptal Edilen Biletler' ? 'Biletler' :
                 stat.title === 'Tur İptal İşlemi' ? 'İptal İşlemi' : stat.title}
                <span className="mobile-tab-badge">{stat.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="table-section-unique">
          {selectedDetails && currentView === 'tours' ? (
            <CancelledTourDetailsView 
              tour={selectedDetails}
              onBack={() => setSelectedDetails(null)}
            />
          ) : currentView === 'tours' ? (
            <CancellationTable 
              data={cancellationData}
              onDetailsClick={handleDetailsClick}
            />
          ) : currentView === 'tickets' ? (
            <RefundRequestsTable />
          ) : (
            <TourCancellationForm 
              onCancel={(data) => {
                handleDetailsClick(data);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CancellationRefunds;
