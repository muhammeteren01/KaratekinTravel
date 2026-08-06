import React, { useEffect, useMemo, useState } from 'react';
import './TourReviews.css';
import ReviewAnalysisChart from './ReviewAnalysisChart';
import AllReviewsList from './AllReviewsList';
import { fetchReviewsApi, fetchTripsApi } from '../services/adminApi';
import { formatDisplayDateTime } from '../utils/reportDates';

const TourReviews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError('');

        const [reviews, trips] = await Promise.all([
          fetchReviewsApi(),
          fetchTripsApi(),
        ]);

        if (!alive) return;

        const tripMap = Object.fromEntries(
          (Array.isArray(trips) ? trips : []).map((trip) => [String(trip.id), trip.title || 'Tur'])
        );

        const normalized = (Array.isArray(reviews) ? reviews : []).map((review) => ({
          id: review.id,
          user: String(review.userId || '').slice(0, 8) || 'Kullanıcı',
          tour: tripMap[String(review.tripId)] || review.tripId || 'Tur',
          rating: Number(review.rating || 0),
          comment: review.comment || '',
          date: formatDisplayDateTime(review.createdAt),
        }));

        setAllReviews(normalized);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Değerlendirmeler yüklenemedi.');
        setAllReviews([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadReviews();

    return () => {
      alive = false;
    };
  }, []);

  const totalReviews = allReviews.length;
  const mostReviewedTour = useMemo(() => {
    const counts = allReviews.reduce((acc, r) => {
      acc[r.tour] = (acc[r.tour] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts);
    if (!entries.length) return { tour: '-', count: 0 };
    const [tour, count] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
    return { tour, count };
  }, [allReviews]);

  const parseDate = (s) => {
    try {
      const [datePart, timePart] = s.split(' - ').map(str => str.trim());
      const [d, m, y] = datePart.split('.').map(Number);
      const [hh, mm] = timePart.split(':').map(Number);
      return new Date(y, m - 1, d, hh, mm);
    } catch {
      return new Date(0);
    }
  };

  const latestReview = useMemo(() => {
    if (!allReviews.length) return null;
    return allReviews.reduce((latest, r) => (latest == null || parseDate(r.date) > parseDate(latest.date) ? r : latest), null);
  }, [allReviews]);

  const recentReviews = useMemo(() => {
    return [...allReviews].sort((a,b)=> parseDate(b.date) - parseDate(a.date)).slice(0,5);
  }, [allReviews]);

  return (
    <div className="tr-container">
      {error && <div className="table-error">{error}</div>}
      {loading && !error && <div style={{ marginBottom: 16, color: '#718EBF' }}>Değerlendirmeler yükleniyor...</div>}

      <div className="tr-stats-row">
        <div className="tr-stat-card">
          <div className="tr-stat-icon tr-stat-icon--orange">
            <img src="/icons/reviews-bars.svg" alt="Toplam Değerlendirme" />
          </div>
          <div className="tr-stat-text">
            <div className="tr-stat-label">Toplam Değerlendirme</div>
            <div className="tr-stat-value">{totalReviews} Yorum</div>
            <div className="tr-stat-sub">Tüm zamanlar</div>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon tr-stat-icon--pink tr-stat-icon--heart">
            <img src="/icons/reviews-heart.svg" alt="En Çok Değerlendirme Alan Tur" />
          </div>
          <div className="tr-stat-text">
            <div className="tr-stat-label">En Çok Değerlendirme Alan Tur</div>
            <div className="tr-stat-value">{mostReviewedTour.tour}</div>
            <div className="tr-stat-sub">{mostReviewedTour.count} yorum</div>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon tr-stat-icon--teal">
            <img src="/icons/reviews-latest.svg" alt="En Son Değerlendirme" />
          </div>
          <div className="tr-stat-text">
            <div className="tr-stat-label">En Son Değerlendirme</div>
            <div className="tr-stat-value">{latestReview ? latestReview.tour : '-'}</div>
            <div className="tr-stat-sub">{latestReview ? latestReview.date : '-'}</div>
          </div>
        </div>
      </div>

      <ReviewAnalysisChart reviews={allReviews} />

      <section className="tr-recent-wrapper">
        <div className="tr-recent-header">
          <h2>En Son Yapılan Değerlendirmeler</h2>
          <p>Aşağıda, turlar için en son yapılan üç değerlendirmeyi inceleyebilirsiniz.</p>
        </div>
        <div className="tr-recent-list tr-recent-list--cards">
          {recentReviews.slice(0,3).map(r => (
            <div className="tr-recent-card" key={r.id}>
              <div className="tr-recent-thumb tr-recent-thumb--person">
                <img src="/icons/people-alt-filled.svg" alt="Kullanıcı" />
              </div>
              <div className="tr-recent-body">
                <div className="tr-recent-meta-row">
                  <div className="tr-recent-meta">
                    <span className="tr-recent-label">Gezi Adı:</span>
                    <span className="tr-recent-link">{r.tour}</span>
                  </div>
                </div>
                <div className="tr-recent-row">
                  <span className="tr-recent-label">Yorum: </span>
                  <span className="tr-recent-link tr-recent-comment">{r.comment}</span>
                </div>
                <div className="tr-recent-row">
                  <span className="tr-recent-label">Tarih: </span>
                  <span className="tr-recent-date-accent">{(r.date || '').split(' - ')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AllReviewsList reviews={allReviews} />
    </div>
  );
};

export default TourReviews;
