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
    <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl">
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-white tracking-tight">
        <Trophy className="h-5 w-5 text-teal-400" />
        Find Best Mandi
      </h2>
      <p className="mb-8 text-sm text-white/40 font-medium">
        Ranked mandis with road distance and transport cost.
      </p>

      <div className="mb-6 space-y-3 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <MapPin className="h-3.5 w-3.5" />
            Farmer Location
          </label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "farmer" ? null : "farmer")}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${clickMode === "farmer"
                ? "bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
          >
            {clickMode === "farmer" ? "Click Map..." : "Pin on Map"}
          </button>
        </div>
        <LocationSearchBox placeholder="Search village / town..." onSelect={onFarmerSearch} />
        <p className="truncate text-xs font-medium text-white/40">
          {farmerAddress || `${farmerLocation[0].toFixed(4)}, ${farmerLocation[1].toFixed(4)}`}
        </p>
      </div>

      <div className="mb-8 space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
            <Store className="h-3.5 w-3.5" />
            Pin Mandi Manually
          </label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "mandi" ? null : "mandi")}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${clickMode === "mandi"
                ? "bg-white/20 text-white shadow-lg"
                : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
          >
            {clickMode === "mandi" ? "Click Map..." : "Pin on Map"}
          </button>
        </div>
        <LocationSearchBox placeholder="Search mandi / market name..." onSelect={onMandiSearch} />
      </div>

      {mandiError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {mandiError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50">
            <Wheat className="h-3.5 w-3.5" />
            Crop
          </label>
          <select
            value={mandiForm.crop}
            onChange={(e) => setMandiForm({ ...mandiForm, crop: e.target.value })}
            required
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors focus:border-teal-500 focus:outline-none"
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
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50">
            <Scale className="h-3.5 w-3.5" />
            Quantity (quintals)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={mandiForm.quantity}
            onChange={(e) => setMandiForm({ ...mandiForm, quantity: e.target.value })}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white placeholder:text-white/20 transition-colors focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50">
              <MapPin className="h-3.5 w-3.5" />
              State
            </label>
            <select
              value={mandiForm.state}
              onChange={(e) => {
                setMandiForm({ ...mandiForm, state: e.target.value, district: "" });
                fetchDistricts(e.target.value);
              }}
              required
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors focus:border-teal-500 focus:outline-none"
            >
              <option value="" className="bg-zinc-900 text-white">
                Select
              </option>
              {STATES.map((state) => (
                <option key={state} value={state} className="bg-zinc-900 text-white">
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50">
              <MapPin className="h-3.5 w-3.5" />
              District
            </label>
            <select
              value={mandiForm.district}
              onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
              required
              disabled={!mandiForm.state || districtLoading}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors focus:border-teal-500 focus:outline-none disabled:opacity-30"
            >
              <option value="" className="bg-zinc-900 text-white">
                {districtLoading ? "..." : "Select"}
              </option>
              {mandiDistricts.map((district) => (
                <option key={district} value={district} className="bg-zinc-900 text-white">
                  {district}
                </option>
              ))}
            </select>
            {districtError && <p className="mt-1.5 text-[10px] text-red-400">{districtError}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={mandiLoading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-4 font-bold text-white shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50"
        >
          <PackageSearch className="h-5 w-5" />
          {mandiLoading ? "Calculating Routes..." : "Find Best Mandi"}
        </button>
      </form>
    </div>
  );
};

export default MandiForm;
