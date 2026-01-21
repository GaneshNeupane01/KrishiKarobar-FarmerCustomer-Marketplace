import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

export default function AddressAutocomplete({ onSelect, onChange, placeholder = "Enter address", className = "", value = "" }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  const handleChange = async (e) => {
    const inputValue = e.target.value;
    console.log('🔍 AddressAutocomplete handleChange called with:', inputValue);
    
    // Call the onChange handler to update the parent form
    if (onChange) {
      onChange(e);
    }
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to avoid too many API calls
    timeoutRef.current = setTimeout(async () => {
      if (inputValue.length > 2) {
        setIsLoading(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5&addressdetails=1&countrycodes=np`
          );
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms delay
  };

  const handleSelect = (suggestion) => {
    const address = suggestion.display_name;
    console.log('🔍 AddressAutocomplete handleSelect called with:', { address, suggestion });
    
    // Update parent form with selected address and coordinates
    onSelect({
      address: address,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
    
    // Hide suggestions
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md dark:text-gray-100 dark:placeholder-gray-400 ${className}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors"
              onMouseDown={() => handleSelect(suggestion)}
            >
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {suggestion.display_name.split(',')[0]}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                {suggestion.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && value.length > 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
            No addresses found
          </div>
        </div>
      )}
    </div>
  );
} 