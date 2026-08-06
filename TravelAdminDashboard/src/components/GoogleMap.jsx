import React, { useEffect, useRef, useState } from 'react';

const GoogleMap = ({ onLocationAdd, addedStops, onStopRemove }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Google Maps API key - Gerçek kullanım için .env dosyasında VITE_GOOGLE_MAPS_API_KEY olarak tanımlayın
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  useEffect(() => {
    // Google Maps script'ini yükle
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Eğer script zaten yükleniyorsa, bekle
      if (window.googleMapsLoading) {
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            initializeMap();
          }
        }, 100);
        return;
      }

      // Eğer script zaten varsa, yeniden ekleme
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        initializeMap();
        return;
      }

      // Google Maps script'ini yükle
      window.googleMapsLoading = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.googleMapsLoading = false;
        initializeMap();
      };
      script.onerror = () => {
        window.googleMapsLoading = false;
        console.error('Google Maps script yüklenemedi');
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Türkiye merkezi koordinatları
      const center = { lat: 39.9334, lng: 32.8597 };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: center,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Haritaya tıklama olayı
      map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocoding ile adres bilgisi al
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            const locationName = results[0].address_components[0]?.long_name || 'Yeni Konum';
            
            if (onLocationAdd) {
              onLocationAdd({
                id: Date.now(),
                name: locationName,
                address: address,
                lat: lat,
                lng: lng
              });
            }
          }
        });
      });

      setIsMapLoaded(true);
    };

    loadGoogleMapsScript();
  }, []);

  // Marker'ları güncelle
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Mevcut marker'ları temizle
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Yeni marker'ları ekle
    addedStops.forEach((stop, index) => {
      if (stop.lat && stop.lng) {
        const marker = new window.google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map: mapInstanceRef.current,
          title: stop.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${getMarkerColor(index)}" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 24)
          }
        });

        // Marker'a tıklama olayı
        marker.addListener('click', () => {
          if (onStopRemove) {
            onStopRemove(stop.id);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Eğer marker'lar varsa haritayı bu marker'lara göre ayarla
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [addedStops, isMapLoaded]);

  const getMarkerColor = (index) => {
    const colors = ['#6FCF97', '#F2994A', '#DC1500', '#24BAEC', '#9B59B6'];
    return colors[index % colors.length];
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          mapInstanceRef.current.setCenter(pos);
          mapInstanceRef.current.setZoom(15);
        },
        () => {
          console.log('Konum alınamadı');
        }
      );
    }
  };

  // API key kontrolü
  const isValidApiKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

  if (!isValidApiKey) {
    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        border: '1px solid #D1D1D1'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>🗺️</div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Google Maps</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            API key gerekli
          </div>
          <div style={{ fontSize: '11px', marginTop: '8px', color: '#999' }}>
            .env dosyasında VITE_GOOGLE_MAPS_API_KEY tanımlayın
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          border: '1px solid #D1D1D1'
        }}
      />
      
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '210px',
        right: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={handleZoomOut}
          style={{
            width: '32px',
            height: '32px',
            background: 'white',
            border: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.12)'
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
            border: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.12)'
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
            border: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.12)'
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
          background: '#F5F5F5',
          borderRadius: '12px',
          border: '1px solid #D1D1D1'
        }}>
          <div style={{ textAlign: 'center', color: '#999999' }}>
            <div>Harita Yükleniyor...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap; 