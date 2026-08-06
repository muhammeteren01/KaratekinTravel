import React, { useState, useEffect, useRef } from 'react';

const OpenStreetMapSearch = ({ onLocationSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce için timeout ref
  const searchTimeoutRef = useRef(null);
  // Container ref - dışarı tıklama kontrolü için
  const containerRef = useRef(null);

  const handleSearch = (value) => {
    setSearchValue(value);
    
    // Önceki timeout'u temizle
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length > 2) {
      setIsLoading(true);
      
      // 500ms bekle (debounce)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Nominatim API ile arama yap
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=tr&limit=5&accept-language=tr`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            const formattedSuggestions = data.map(item => ({
              place_id: item.place_id,
              name: item.name || item.display_name.split(',')[0],
              display_name: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              type: item.type,
              class: item.class
            }));
            
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Arama hatası:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const location = {
      id: Date.now(),
      name: suggestion.name,
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lng
    };

    if (onLocationSelect) {
      onLocationSelect(location);
    }

    setSearchValue('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Dışarı tıklama ve ESC tuşu kontrolü
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        setSearchValue('');
      }
    };

    // Event listener'ları ekle
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Component unmount olduğunda timeout'u temizle
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
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
          placeholder="Konum ara... (örn: Ankara, İstanbul)"
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
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #24BAEC',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
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
                {suggestion.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {suggestion.display_name}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                {suggestion.type && suggestion.class && (
                  <span style={{ 
                    background: '#f0f0f0', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {suggestion.type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading animation CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OpenStreetMapSearch; 