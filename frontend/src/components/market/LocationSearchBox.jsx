import { useRef, useState } from "react";
import { Loader, MapPin, Search } from "lucide-react";

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, { headers: { "Accept-Language": "en-US,en;q=0.9" } });
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
    if (val.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await nominatimSearch(`${val}, India`);
        setResults(data.slice(0, 4));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (result) => {
    onSelect([parseFloat(result.lat), parseFloat(result.lon)], result.display_name);
    setQuery(result.display_name.split(",")[0]);
    setResults([]);
  };

  return (
    <div className="relative">
      {label && <label className="mb-1 block text-xs font-semibold text-white/60">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        {loading && <Loader className="h-4 w-4 animate-spin text-white/50" />}
      </div>

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-[9999] mt-1 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl">
          {results.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="flex cursor-pointer items-start gap-2 border-b border-white/10 px-3 py-2 text-xs text-white/75 last:border-0 hover:bg-white/10"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
              <span>{result.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchBox;
