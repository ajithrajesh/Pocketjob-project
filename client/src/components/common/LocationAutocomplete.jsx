import { useState, useEffect, useRef } from "react";

const POPULAR_LOCATIONS = [
  "Kochi",
  "Bangalore",
  "Thrissur",
  "Trivandrum",
  "Kozhikode",
  "Kollam",
  "Kottayam",
  "Palakkad",
  "Kannur",
  "Alappuzha",
  "Malappuram",
  "Pathanamthitta",
  "Idukki",
  "Wayanad",
  "Kasaragod",
  "Chennai",
  "Mumbai",
  "Delhi",
  "Hyderabad"
];

function LocationAutocomplete({ value, onChange, placeholder, className, style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Filter locations as the user types
  useEffect(() => {
    if (value && value.trim()) {
      const query = value.toLowerCase().trim();
      const filtered = POPULAR_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (loc) => {
    onChange(loc);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="location-suggestions-container" style={style}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="location-suggestions-list">
          {suggestions.map((loc, index) => (
            <li
              key={index}
              className="location-suggestion-item"
              onClick={() => handleSelect(loc)}
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationAutocomplete;
