import { useState, useEffect, useRef } from "react";

const POPULAR_CATEGORIES = [
  "Catering",
  "Warehouse",
  "Driver",
  "Delivery",
  "Housekeeping",
  "Event Staff",
  "Valet Parking"
];

function CategoryAutocomplete({ value, onChange, placeholder, className, style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Filter categories as the user types
  useEffect(() => {
    if (value && value.trim()) {
      const query = value.toLowerCase().trim();
      const filtered = POPULAR_CATEGORIES.filter(cat => 
        cat.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(POPULAR_CATEGORIES); // Show all categories when input is empty but focused
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

  const handleSelect = (cat) => {
    onChange(cat);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="category-suggestions-container" style={style}>
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
        <ul className="category-suggestions-list">
          {suggestions.map((cat, index) => (
            <li
              key={index}
              className="category-suggestion-item"
              onClick={() => handleSelect(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoryAutocomplete;
