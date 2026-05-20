import { IndianRupee, MapPin, Route, Store, Trophy } from "lucide-react";

const MandiCard = ({ mandi, index, isSelected, routeInfo, onSelect, onShowRoute }) => {
  return (
    <div
      onClick={() => onSelect(mandi)}
      className={`cursor-pointer rounded-2xl border bg-black/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/5 ${
        isSelected
          ? "border-green-400 ring-2 ring-green-400/20"
          : mandi.isBest
            ? "border-green-400/40"
            : "border-white/10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white ${
              index === 0 ? "bg-green-500" : index === 1 ? "bg-white/20" : "bg-white/10"
            }`}
          >
            #{index + 1}
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-bold text-white">
              <Store className="h-4 w-4 text-white/60" />
              {mandi.name}
            </h3>
            <p className="text-xs text-white/40">
              {mandi.district}
              {mandi.date && ` - ${mandi.date}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {mandi.isBest && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300">
              <Trophy className="h-3 w-3" />
              Best Deal
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              mandi.isRealData ? "bg-green-500/25 text-green-300" : "bg-amber-500/25 text-amber-300"
            }`}
          >
            {mandi.isRealData ? "Live" : "Demo"}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              mandi.lat && mandi.lng ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"
            }`}
          >
            <MapPin className="h-3 w-3" />
            {mandi.lat && mandi.lng ? "Pinned" : "Locating"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/5 py-2.5">
          <p className="text-xs text-white/40">Price/qtl</p>
          <p className="flex items-center justify-center font-bold text-sm text-white">
            <IndianRupee className="h-3.5 w-3.5" />
            {mandi.pricePerUnit}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 py-2.5">
          <p className="text-xs text-white/40">Transport</p>
          <p className="font-bold text-sm text-green-300">
            {isSelected && routeInfo ? `-${routeInfo.totalCost?.toLocaleString()}` : "after route"}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 py-2.5">
          <p className="text-xs text-white/40">Gross Revenue</p>
          <p className="font-bold text-sm text-green-300">
            {(mandi.pricePerUnit * (mandi.quantity || 1))?.toLocaleString()}
          </p>
        </div>
      </div>

      {isSelected && mandi.lat && mandi.lng && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowRoute();
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-2 text-xs font-bold text-white transition hover:bg-green-600"
        >
          <Route className="h-3.5 w-3.5" />
          Recalculate Route
        </button>
      )}

      {isSelected && !mandi.lat && (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/20 p-2 text-center">
          <p className="text-xs text-amber-300">Still locating this mandi on map...</p>
        </div>
      )}
    </div>
  );
};

export default MandiCard;
