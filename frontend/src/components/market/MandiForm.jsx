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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h2 className="mb-1.5 flex items-center gap-2 text-lg font-bold text-slate-800 tracking-tight font-heading">
        <Trophy className="h-5 w-5 text-[#1E8E5A]" />
        Find Best Mandi
      </h2>
      <p className="mb-6 text-xs font-semibold text-slate-450">
        Ranked mandis with real road distance and transport cost calculation.
      </p>

      {/* Farmer Location Detection */}
      <div className="mb-5 space-y-3 rounded-2xl border border-emerald-100 bg-[#E6F5EE]/40 p-4 shadow-inner">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#0F6B4A]">
            <MapPin className="h-3.5 w-3.5" />
            Farmer Location
          </label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "farmer" ? null : "farmer")}
            className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all border ${
              clickMode === "farmer"
                ? "bg-[#1E8E5A] text-white border-[#1E8E5A] shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {clickMode === "farmer" ? "Click Map..." : "Pin on Map"}
          </button>
        </div>
        <LocationSearchBox placeholder="Search village / town..." onSelect={onFarmerSearch} />
        <p className="truncate text-xs font-bold text-slate-500">
          {farmerAddress || `${farmerLocation[0].toFixed(4)}, ${farmerLocation[1].toFixed(4)}`}
        </p>
      </div>

      {/* Mandi manual pinning */}
      <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Store className="h-3.5 w-3.5" />
            Pin Mandi Manually
          </label>
          <button
            type="button"
            onClick={() => setClickMode(clickMode === "mandi" ? null : "mandi")}
            className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all border ${
              clickMode === "mandi"
                ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {clickMode === "mandi" ? "Click Map..." : "Pin on Map"}
          </button>
        </div>
        <LocationSearchBox placeholder="Search mandi / market name..." onSelect={onMandiSearch} />
      </div>

      {mandiError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-650">
          {mandiError}
        </div>
      )}

      {/* Inputs form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Wheat className="h-4 w-4 text-slate-400" />
            Crop
          </label>
          <select
            value={mandiForm.crop}
            onChange={(e) => setMandiForm({ ...mandiForm, crop: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 appearance-none"
          >
            <option value="" className="bg-white text-slate-800">
              Select crop
            </option>
            {CROPS.map((crop) => (
              <option key={crop.name} value={crop.name} className="bg-white text-slate-800">
                {crop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Scale className="h-4 w-4 text-slate-400" />
            Quantity (quintals)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={mandiForm.quantity}
            onChange={(e) => setMandiForm({ ...mandiForm, quantity: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              State
            </label>
            <select
              value={mandiForm.state}
              onChange={(e) => {
                setMandiForm({ ...mandiForm, state: e.target.value, district: "" });
                fetchDistricts(e.target.value);
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 appearance-none"
            >
              <option value="" className="bg-white text-slate-800">
                Select
              </option>
              {STATES.map((state) => (
                <option key={state} value={state} className="bg-white text-slate-800">
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              District
            </label>
            <select
              value={mandiForm.district}
              onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
              required
              disabled={!mandiForm.state || districtLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 appearance-none disabled:opacity-30"
            >
              <option value="" className="bg-white text-slate-800">
                {districtLoading ? "..." : "Select"}
              </option>
              {mandiDistricts.map((district) => (
                <option key={district} value={district} className="bg-white text-slate-800">
                  {district}
                </option>
              ))}
            </select>
            {districtError && <p className="mt-1.5 text-[10px] font-bold text-red-500">{districtError}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={mandiLoading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1E8E5A] hover:bg-[#0F6B4A] py-3.5 font-bold text-white text-xs uppercase tracking-wider shadow-md shadow-[#1E8E5A]/10 transition-all duration-300 disabled:opacity-50 active:scale-95"
        >
          <PackageSearch className="h-4 w-4" />
          {mandiLoading ? "Calculating Routes..." : "Find Best Mandi"}
        </button>
      </form>
    </div>
  );
};

export default MandiForm;
