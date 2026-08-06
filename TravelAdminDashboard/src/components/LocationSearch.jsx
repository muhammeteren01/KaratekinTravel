import React, { useState, useEffect, useRef } from 'react';

const LocationSearch = ({ onLocationSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    // Google Maps yüklenene kadar bekle
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      } else {
        // 100ms sonra tekrar kontrol et
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
  }, []);

  const handleSearch = (value) => {
    setSearchValue(value);
    
    if (value.length > 2 && autocompleteService.current) {
      const request = {
        input: value,
        componentRestrictions: { country: 'tr' }, // Türkiye ile sınırla
        types: ['establishment', 'geocode']
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5)); // İlk 5 sonucu göster
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (placesService.current) {
      const request = {
        placeId: suggestion.place_id,
        fields: ['name', 'geometry', 'formatted_address']
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location = {
            id: Date.now(),
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          if (onLocationSelect) {
            onLocationSelect(location);
          }

          setSearchValue('');
          setShowSuggestions(false);
          setSuggestions([]);
        }
      });
    }
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 52px 8px 12px',
        background: '#FBFBFB',
        border: '1px solid #EBEBEB',
        borderRadius: '100px',
        position: 'relative'
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 14L11.1 11.1" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          placeholder="Konum ara..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: '#999999',
            lineHeight: 1.5
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #EBEBEB',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #F0F0F0' : 'none',
                fontSize: '14px',
                color: '#333',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F8F9FA'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                {suggestion.structured_formatting.main_text}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch; 