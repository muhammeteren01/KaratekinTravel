import React, { useEffect, useMemo, useState } from 'react';
import './TripAnalysis.css';
import FilterDropdown from '../components/FilterDropdown';
import StatCard from '../components/StatCard';
import TripTable from '../components/TripTable';
import TripCategoryAnalysis from '../components/TripCategoryAnalysis';
import TripLineAnalysis from '../components/TripLineAnalysis';
import { fetchTripReportApi, fetchTripsApi } from '../services/adminApi';
import { getRangeForFilter, toApiDate } from '../utils/reportDates';

const TripAnalysis = () => {
  const [selectedFilter, setSelectedFilter] = useState('Aylık');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripReport, setTripReport] = useState(null);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError('');
        const { start, end } = getRangeForFilter(selectedFilter);

        const [report, tripList] = await Promise.all([
          fetchTripReportApi(toApiDate(start), toApiDate(end)),
          fetchTripsApi(),
        ]);

        if (!alive) return;
        setTripReport(report);
        setTrips(Array.isArray(tripList) ? tripList : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Analiz verileri yüklenemedi.');
        setTripReport(null);
        setTrips([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadAnalysis();

    return () => {
      alive = false;
    };
  }, [selectedFilter]);

  const tableRows = useMemo(() => {
    const topTrips = tripReport?.topTrips || [];
    const tripMap = Object.fromEntries((trips || []).map((trip) => [String(trip.id), trip]));

    if (topTrips.length) {
      return topTrips.map((trip) => {
        const meta = tripMap[String(trip.tripId)] || {};
        return {
          id: trip.tripId,
          code: String(trip.tripId).slice(0, 8).toUpperCase(),
          name: trip.title || meta.title || 'Tur',
          category: meta.region || meta.city || 'Genel',
          date: meta.dateStart ? new Date(meta.dateStart).toLocaleString('tr-TR') : '—',
          participants: String(trip.joinedCount ?? trip.totalReservations ?? 0),
          rating: Number(trip.avgReviewRating ?? meta.rating ?? 0).toFixed(1),
        };
      });
    }

    return (trips || []).map((trip) => ({
      id: trip.id,
      code: String(trip.id).slice(0, 8).toUpperCase(),
      name: trip.title || 'Tur',
      category: trip.region || trip.city || 'Genel',
      date: trip.dateStart ? new Date(trip.dateStart).toLocaleString('tr-TR') : '—',
      participants: String(trip.joinedCount ?? 0),
      rating: Number(trip.rating ?? 0).toFixed(1),
    }));
  }, [tripReport, trips]);

  const categoryData = useMemo(() => {
    const counts = {};
    tableRows.forEach((row) => {
      const key = row.category || 'Genel';
      counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts);
    if (!labels.length) {
      return { labels: ['Veri yok'], tripCounts: [1], participantCounts: [0] };
    }

    return {
      labels,
      tripCounts: labels.map((label) => counts[label]),
      participantCounts: labels.map((label) => {
        return tableRows
          .filter((row) => row.category === label)
          .reduce((sum, row) => sum + Number(row.participants || 0), 0);
      }),
    };
  }, [tableRows]);

  const lineChartTrips = useMemo(() => {
    return tableRows.slice(0, 6).map((row) => ({
      title: row.name,
      participants: Number(row.participants || 0),
      rating: Number(row.rating || 0),
    }));
  }, [tableRows]);

  return (
    <div className="trip-analysis">
      <div className="trip-analysis__filter-section">
        <div className="trip-analysis__filter-wrapper">
          <span className="trip-analysis__filter-label">Filtrele:</span>
          <FilterDropdown
            value={selectedFilter}
            onChange={setSelectedFilter}
            options={['Aylık', 'Haftalık', 'Günlük']}
          />
        </div>

        {error && <div className="table-error">{error}</div>}
        {loading && !error && <div style={{ color: '#718EBF' }}>Analiz verileri yükleniyor...</div>}

        <div className="trip-analysis__stats-grid">
          <StatCard
            value={String(tripReport?.completedTrips ?? 0)}
            label="Gerçekleşen Gezi"
            icon="card-travel"
            bgColor="#C4F5FF"
          />
          <StatCard
            value={String(tripReport?.totalReservations ?? 0)}
            label="Katılımcı"
            icon="people-alt"
            bgColor="#FEFFBA"
          />
          <StatCard
            value={Number(tripReport?.averageRating ?? 0).toFixed(1)}
            label="Ortalama Puanı"
            icon="heart"
            bgColor="#FFBDBD"
          />
        </div>
      </div>

      <div className="trip-analysis__charts-section">
        <TripCategoryAnalysis
          labels={categoryData.labels}
          tripCounts={categoryData.tripCounts}
          participantCounts={categoryData.participantCounts}
        />
        <TripLineAnalysis trips={lineChartTrips} />
      </div>

      <div className="trip-analysis__table-section">
        <TripTable rows={tableRows} loading={loading} />
      </div>
    </div>
  );
};

export default TripAnalysis;
