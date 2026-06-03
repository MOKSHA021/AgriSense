import { IndianRupee, MapPin, Route, Store, Trophy } from "lucide-react";

const MandiCard = ({ mandi, index, isSelected, routeInfo, onSelect, onShowRoute }) => {
  return (
    <div
      onClick={() => onSelect(mandi)}
      className={`cursor-pointer rounded-3xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        isSelected
          ? "border-[#1E8E5A] ring-2 ring-[#1E8E5A]/10"
          : mandi.isBest
            ? "border-[#2BB673]/30"
            : "border-slate-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-black tracking-tighter shadow-sm border ${
              index === 0 
                ? "bg-[#E6F5EE] text-[#0F6B4A] border-emerald-200" 
                : index === 1 
                  ? "bg-slate-50 text-slate-500 border-slate-200" 
                  : "bg-white text-slate-400 border-slate-100"
            }`}
          >
            #{index + 1}
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-base tracking-tight mb-0.5 font-heading">
              <Store className="h-4 w-4 text-slate-400" />
              {mandi.name}
            </h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {mandi.district}
              {mandi.date && ` · ${mandi.date}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {mandi.isBest && (
            <span className="flex items-center gap-1 rounded-full bg-[#E6F5EE] border border-emerald-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#0F6B4A] shadow-sm">
              <Trophy className="h-3 w-3" />
              Best Deal
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
              mandi.isRealData 
                ? "bg-emerald-50 border-emerald-200 text-[#0F6B4A]" 
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            {mandi.isRealData ? "Live" : "Demo"}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
              mandi.lat && mandi.lng 
                ? "bg-blue-50 border-blue-200 text-[#2F80ED]" 
                : "bg-slate-50 border-slate-100 text-slate-400"
            }`}
          >
            <MapPin className="h-3 w-3" />
            {mandi.lat && mandi.lng ? "Pinned" : "Locating"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 py-3">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Price/qtl</p>
          <p className="flex items-center justify-center font-black text-sm text-slate-800">
            <IndianRupee className="h-3.5 w-3.5" />
            {mandi.pricePerUnit?.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 py-3">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Transport</p>
          <p className="font-black text-sm text-red-650">
            {isSelected && routeInfo ? `-₹${routeInfo.totalCost?.toLocaleString()}` : "calc route"}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100/50 bg-[#E6F5EE]/40 py-3">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#0F6B4A]/60">Net Profit</p>
          <p className="font-black text-base text-[#0F6B4A]">
            ₹{(mandi.pricePerUnit * (mandi.quantity || 1))?.toLocaleString()}
          </p>
        </div>
      </div>

      {isSelected && mandi.lat && mandi.lng && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowRoute();
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1E8E5A] hover:bg-[#0F6B4A] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#1E8E5A]/10 transition active:scale-95"
        >
          <Route className="h-4 w-4" />
          Show Map Route
        </button>
      )}

      {isSelected && !mandi.lat && (
        <div className="mt-4 rounded-xl border border-amber-250 bg-amber-50/60 p-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700">Locating market coordinates...</p>
        </div>
      )}
    </div>
  );
};

export default MandiCard;
