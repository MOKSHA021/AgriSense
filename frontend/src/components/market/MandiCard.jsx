import { IndianRupee, MapPin, Route, Store, Trophy } from "lucide-react";
import { useTranslation } from "../../translations";

const MandiCard = ({ mandi, index, isSelected, routeInfo, onSelect, onShowRoute }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={() => onSelect(mandi)}
      className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-lg shadow-xl transition-all duration-300 hover:bg-white/[0.04] ${isSelected
          ? "border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
          : mandi.isBest
            ? "border-teal-500/30"
            : "border-slate-200"
        }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black tracking-tighter text-white shadow-inner ${index === 0 ? "bg-gradient-to-br from-teal-400 to-emerald-500" : index === 1 ? "bg-white/20" : "bg-white/5"
              }`}
          >
            #{index + 1}
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg tracking-tight mb-0.5">
              <Store className="h-4 w-4 text-slate-500" />
              {mandi.name}
            </h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {mandi.district}
              {mandi.date && ` · ${mandi.date}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {mandi.isBest && (
            <span className="flex items-center gap-1 rounded-full bg-teal-500/20 border border-teal-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]">
              <Trophy className="h-3 w-3" />
              {t('mandi.bestDeal')}
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mandi.isRealData
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}
          >
            {mandi.isRealData ? t('mandi.live') : t('mandi.demo')}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mandi.lat && mandi.lng
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : "bg-white/5 border-slate-200 text-slate-500"
              }`}
          >
            <MapPin className="h-3 w-3" />
            {mandi.lat && mandi.lng ? t('mandi.pinned') : t('mandi.locating')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-slate-200 bg-white/5 py-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('mandi.pricePerQtl')}</p>
          <p className="flex items-center justify-center font-bold text-sm text-slate-800">
            <IndianRupee className="h-3.5 w-3.5" />
            {mandi.pricePerUnit?.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/5 py-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('mandi.transport')}</p>
          <p className="font-bold text-sm text-red-400">
            {isSelected && routeInfo ? `-₹${routeInfo.totalCost?.toLocaleString()}` : t('mandi.calcRoute')}
          </p>
        </div>
        <div className="rounded-xl border border-teal-500/10 bg-teal-500/5 py-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-teal-400/60">{t('mandi.grossRev')}</p>
          <p className="font-bold text-base text-teal-400">
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
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-teal-400 hover:to-emerald-400"
        >
          <Route className="h-4 w-4" />
          {t('mandi.recalculateRoute')}
        </button>
      )}

      {isSelected && !mandi.lat && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{t('mandi.locatingCoordinates')}</p>
        </div>
      )}
    </div>
  );
};

export default MandiCard;
