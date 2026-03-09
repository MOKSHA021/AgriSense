import { useState, useRef } from "react";

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, { headers: { "User-Agent": "AgriSense/1.0" } });
  return res.json();
}

const LocationSearchBox = ({ label, placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await nominatimSearch(val + ", India");
        setResults(data.slice(0, 4));
      } catch { setResults([]); }
      setLoading(false);
    }, 500);
  };

  const handleSelect = (r) => {
    onSelect([parseFloat(r.lat), parseFloat(r.lon)], r.display_name);
    setQuery(r.display_name.split(",")[0]);
    setResults([]);
  };

  return (
    <div className="relative">
      {label && <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>}
      <div className="flex gap-2 items-center">
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {loading && <span className="text-xs text-gray-400 animate-pulse">🔍</span>}
      </div>
      {results.length > 0 && (
        <ul className="absolute z-[9999] top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => handleSelect(r)}
              className="px-3 py-2 text-xs text-gray-700 hover:bg-amber-50 cursor-pointer border-b last:border-0"
            >
              📍 {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchBox;
