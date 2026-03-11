import LocationSearchBox from "./LocationSearchBox";
import { CROPS, STATES } from "./constants";

const MandiForm = ({
  mandiForm, setMandiForm,
  mandiDistricts, districtLoading, districtError,
  mandiError, mandiLoading,
  farmerLocation, farmerAddress,
  clickMode, setClickMode,
  onFarmerSearch, onMandiSearch,
  onSubmit, fetchDistricts,
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/10">
      <h2 className="text-xl font-bold text-white mb-1">🏆 Find Best Mandi</h2>
      <p className="text-white/50 text-sm mb-6">
        Ranked mandis with real road transport costs.
      </p>

      {/* Farmer Location */}
      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white/70">🚜 Farmer Location</label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "farmer" ? null : "farmer")}
            className={`text-xs px-3 py-1 rounded-full transition ${
              clickMode === "farmer"
                ? "bg-blue-700 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {clickMode === "farmer" ? "🖱️ Click Map..." : "📍 Click to Pin"}
          </button>
        </div>
        <LocationSearchBox
          placeholder="Search village / town..."
          onSelect={onFarmerSearch}
        />
        <p className="text-xs text-white/50 truncate">
          📌 {farmerAddress || `${farmerLocation[0].toFixed(4)}, ${farmerLocation[1].toFixed(4)}`}
        </p>
      </div>

      {/* Manual Mandi Location */}
      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white/70">🏪 Pin Mandi Manually</label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "mandi" ? null : "mandi")}
            className={`text-xs px-3 py-1 rounded-full transition ${
              clickMode === "mandi"
                ? "bg-red-700 text-white"
                : "bg-red-400 text-white hover:bg-red-500"
            }`}
          >
            {clickMode === "mandi" ? "🖱️ Click Map..." : "📍 Click to Pin"}
          </button>
        </div>
        <LocationSearchBox
          placeholder="Search mandi / market name..."
          onSelect={(coords) => onMandiSearch(coords)}
        />
      </div>

      {mandiError && (
        <div className="bg-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-500/30">
          ⚠️ {mandiError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Crop */}
        <div>
          <label className="text-sm font-semibold text-white/70 mb-1.5 block">🌾 Crop</label>
          <select
            value={mandiForm.crop}
            onChange={(e) => setMandiForm({ ...mandiForm, crop: e.target.value })}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/10"
          >
            <option value="">Select crop</option>
            {CROPS.map((c) => (
              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm font-semibold text-white/70 mb-1.5 block">⚖️ Quantity (quintals)</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={mandiForm.quantity}
            onChange={(e) => setMandiForm({ ...mandiForm, quantity: e.target.value })}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/10"
          />
        </div>

        {/* State */}
        <div>
          <label className="text-sm font-semibold text-white/70 mb-1.5 block">📍 State</label>
          <select
            value={mandiForm.state}
            onChange={(e) => {
              setMandiForm({ ...mandiForm, state: e.target.value, district: "" });
              fetchDistricts(e.target.value);
            }}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/10"
          >
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="text-sm font-semibold text-white/70 mb-1.5 block">
            🏘️ District
            {districtLoading && (
              <span className="text-xs text-amber-500 ml-2 font-normal">Loading...</span>
            )}
          </label>
          <select
            value={mandiForm.district}
            onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
            required
            disabled={!mandiForm.state || districtLoading}
            className="w-full px-4 py-3 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/10 disabled:opacity-50"
          >
            <option value="">
              {districtLoading ? "Loading districts..." : "Select district"}
            </option>
            {mandiDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {districtError && (
            <p className="text-xs text-red-500 mt-1.5">⚠️ {districtError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={mandiLoading}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 shadow-md transition-all duration-200"
        >
          {mandiLoading ? "⏳ Finding mandis..." : "🏆 Find Best Mandi →"}
        </button>
      </form>
    </div>
  );
};

export default MandiForm;
