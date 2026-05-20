import { MapPin, PackageSearch, Scale, Store, Trophy, Wheat } from "lucide-react";
import LocationSearchBox from "./LocationSearchBox";
import { CROPS, STATES } from "./constants";

const MandiForm = ({
  mandiForm,
  setMandiForm,
  mandiDistricts,
  districtLoading,
  districtError,
  mandiError,
  mandiLoading,
  farmerLocation,
  farmerAddress,
  clickMode,
  setClickMode,
  onFarmerSearch,
  onMandiSearch,
  onSubmit,
  fetchDistricts,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-lg backdrop-blur-xl">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
        <Trophy className="h-5 w-5 text-green-400" />
        Find Best Mandi
      </h2>
      <p className="mb-6 text-sm text-white/50">
        Ranked mandis with road distance and transport cost.
      </p>

      <div className="mb-4 space-y-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
            <MapPin className="h-4 w-4 text-green-400" />
            Farmer Location
          </label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "farmer" ? null : "farmer")}
            className={`rounded-full px-3 py-1 text-xs transition ${
              clickMode === "farmer"
                ? "bg-green-700 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {clickMode === "farmer" ? "Click Map..." : "Click to Pin"}
          </button>
        </div>
        <LocationSearchBox placeholder="Search village / town..." onSelect={onFarmerSearch} />
        <p className="truncate text-xs text-white/50">
          {farmerAddress || `${farmerLocation[0].toFixed(4)}, ${farmerLocation[1].toFixed(4)}`}
        </p>
      </div>

      <div className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
            <Store className="h-4 w-4 text-green-400" />
            Pin Mandi Manually
          </label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "mandi" ? null : "mandi")}
            className={`rounded-full px-3 py-1 text-xs transition ${
              clickMode === "mandi"
                ? "bg-green-700 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {clickMode === "mandi" ? "Click Map..." : "Click to Pin"}
          </button>
        </div>
        <LocationSearchBox placeholder="Search mandi / market name..." onSelect={onMandiSearch} />
      </div>

      {mandiError && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-300">
          {mandiError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Wheat className="h-4 w-4 text-green-400" />
            Crop
          </label>
          <select
            value={mandiForm.crop}
            onChange={(e) => setMandiForm({ ...mandiForm, crop: e.target.value })}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="bg-zinc-900 text-white">
              Select crop
            </option>
            {CROPS.map((crop) => (
              <option key={crop.name} value={crop.name} className="bg-zinc-900 text-white">
                {crop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Scale className="h-4 w-4 text-green-400" />
            Quantity (quintals)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={mandiForm.quantity}
            onChange={(e) => setMandiForm({ ...mandiForm, quantity: e.target.value })}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/70">
            <MapPin className="h-4 w-4 text-green-400" />
            State
          </label>
          <select
            value={mandiForm.state}
            onChange={(e) => {
              setMandiForm({ ...mandiForm, state: e.target.value, district: "" });
              fetchDistricts(e.target.value);
            }}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="bg-zinc-900 text-white">
              Select state
            </option>
            {STATES.map((state) => (
              <option key={state} value={state} className="bg-zinc-900 text-white">
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/70">
            <MapPin className="h-4 w-4 text-green-400" />
            District
            {districtLoading && (
              <span className="ml-2 text-xs font-normal text-green-400">Loading...</span>
            )}
          </label>
          <select
            value={mandiForm.district}
            onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
            required
            disabled={!mandiForm.state || districtLoading}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
          >
            <option value="" className="bg-zinc-900 text-white">
              {districtLoading ? "Loading districts..." : "Select district"}
            </option>
            {mandiDistricts.map((district) => (
              <option key={district} value={district} className="bg-zinc-900 text-white">
                {district}
              </option>
            ))}
          </select>
          {districtError && <p className="mt-1.5 text-xs text-red-300">{districtError}</p>}
        </div>

        <button
          type="submit"
          disabled={mandiLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-3.5 font-bold text-white shadow-md shadow-green-900/20 transition-all duration-200 hover:bg-green-600 disabled:opacity-50"
        >
          <PackageSearch className="h-4 w-4" />
          {mandiLoading ? "Finding mandis..." : "Find Best Mandi"}
        </button>
      </form>
    </div>
  );
};

export default MandiForm;
