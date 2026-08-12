import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icon sorunu için fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OpenStreetMap = ({ onLocationAdd, addedStops, onStopRemove }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Harita/marker effect'leri mount'ta veya duraklar değiştiğinde çalışıyor.
  // Callback prop'ları bağımlılığa eklemek haritayı yeniden kurardı; bunun
  // yerine en güncel referansı ref üzerinden okuyoruz (stale closure olmaz).
  const onLocationAddRef = useRef(onLocationAdd);
  const onStopRemoveRef = useRef(onStopRemove);
  onLocationAddRef.current = onLocationAdd;
  onStopRemoveRef.current = onStopRemove;

  useEffect(() => {
    if (!mapRef.current) return;

    // Türkiye merkezi koordinatları
    const center = [39.9334, 32.8597];

    // Harita oluştur
    const map = L.map(mapRef.current, {
      center: center,
      zoom: 6,
      zoomControl: false // Kendi zoom kontrolümüzü kullanacağız
    });

    // OpenStreetMap tile layer ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Haritaya tıklama olayı
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // Reverse geocoding ile adres bilgisi al (Nominatim API)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr`
        );
        const data = await response.json();
        
        const locationName = data.name || data.display_name?.split(',')[0] || 'Yeni Konum';
        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        if (onLocationAddRef.current) {
          onLocationAddRef.current({
            id: Date.now(),
            name: locationName,
            address: address,
            lat: lat,
            lng: lng
          });
        }
      } catch (error) {
        console.error('Adres bilgisi alınamadı:', error);
        // Hata durumunda koordinatları kullan
        if (onLocationAddRef.current) {
          onLocationAddRef.current({
            id: Date.now(),
            name: 'Yeni Konum',
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat: lat,
            lng: lng
          });
        }
      }
    });

    setIsMapLoaded(true);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Marker'ları güncelle
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Mevcut marker'ları temizle
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Yeni marker'ları ekle
    addedStops.forEach((stop, index) => {
      if (stop.lat && stop.lng) {
        // Özel marker ikonu oluştur
        const customIcon = L.divIcon({
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: ${getMarkerColor(index)};
              border: 2px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>${stop.name}</strong><br>
              <small>${stop.address}</small><br>
              <button onclick="window.removeStop(${stop.id})" style="
                margin-top: 8px;
                padding: 4px 8px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Kaldır</button>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });

    // Global remove function
    window.removeStop = (stopId) => {
      if (onStopRemoveRef.current) {
        onStopRemoveRef.current(stopId);
      }
    };

    // Eğer marker'lar varsa haritayı bu marker'lara göre ayarla
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [addedStops, isMapLoaded]);

  const getMarkerColor = (index) => {
    const colors = ['#6FCF97', '#F2994A', '#DC1500', '#24BAEC', '#9B59B6'];
    return colors[index % colors.length];
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.setView([latitude, longitude], 15);
        },
        () => {
          console.warn('Konum alınamadı; harita varsayılan merkezde açılıyor.');
        }
      );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          border: '1px solid #D1D1D1',
          overflow: 'hidden'
        }}
      />
      
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10000
      }}>
        <button
          onClick={handleZoomOut}
          style={{
            width: '32px',
            height: '32px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9H15" stroke="#535353" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <button
          onClick={handleZoomIn}
          style={{
            width: '32px',
            height: '32px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3V15M3 9H15" stroke="#535353" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <button
          onClick={handleMyLocation}
          style={{
            width: '32px',
            height: '32px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5C6.5 1.5 4.5 3.5 4.5 6C4.5 10.5 9 16.5 9 16.5S13.5 10.5 13.5 6C13.5 3.5 11.5 1.5 9 1.5Z" stroke="#535353" strokeWidth="2"/>
            <circle cx="9" cy="6" r="1.5" stroke="#535353" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {!isMapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>🗺️</div>
            <div>Harita yükleniyor...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMap; 