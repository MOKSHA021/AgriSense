const MandiCard = ({ mandi, index, isSelected, routeInfo, onSelect, onShowRoute }) => {
  return (
    <div
      onClick={() => onSelect(mandi)}
      className={`bg-black/40 backdrop-blur-md rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer
       ${isSelected
         ? "border-amber-400 ring-2 ring-amber-400/30 bg-amber-500/20"
         : mandi.isBest
         ? "border-amber-400/50 ring-1 ring-amber-400/20"
         : "border-white/10"
       }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm
            ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-orange-300"}`}>
            #{index + 1}
          </div>
          <div>
            <h3 className="font-bold text-white">{mandi.name}</h3>
            <p className="text-xs text-white/40">
              {mandi.district}{mandi.date && ` · ${mandi.date}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {mandi.isBest && (
            <span className="text-xs font-bold bg-amber-500/30 text-amber-300 px-3 py-1 rounded-full">
              🏆 BEST DEAL
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${mandi.isRealData ? "bg-green-500/30 text-green-300" : "bg-yellow-500/30 text-yellow-300"}`}>
            {mandi.isRealData ? "🟢 Live" : "🟡 Mock"}
          </span>
          {/* Pin status */}
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${mandi.lat && mandi.lng
              ? "bg-blue-500/30 text-blue-300"
              : "bg-white/10 text-white/40 animate-pulse"}`}>
            {mandi.lat && mandi.lng ? "📍 Pinned" : "🔍 Locating..."}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-500/20 rounded-xl py-2.5">
          <p className="text-xs text-white/40">Price/qtl</p>
          <p className="font-bold text-blue-300 text-sm">₹{mandi.pricePerUnit}</p>
        </div>
        <div className="bg-red-500/20 rounded-xl py-2.5">
          <p className="text-xs text-white/40">Transport</p>
          <p className="font-bold text-red-300 text-sm">
            {isSelected && routeInfo
              ? `-₹${routeInfo.totalCost?.toLocaleString()}`
              : "📏 after route"}
          </p>
        </div>
        <div className={`rounded-xl py-2.5 ${mandi.isBest ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
          <p className="text-xs text-white/40">Gross Revenue</p>
          <p className={`font-bold text-sm ${mandi.isBest ? "text-amber-600" : "text-emerald-600"}`}>
            ₹{(mandi.pricePerUnit * (mandi.quantity || 1))?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Show Route — only when pin is ready */}
      {isSelected && mandi.lat && mandi.lng && (
        <button
          onClick={(e) => { e.stopPropagation(); onShowRoute(); }}
          className="mt-3 w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition"
        >
          🗺️ Show Route on Map
        </button>
      )}

      {/* No coords warning */}
      {isSelected && !mandi.lat && (
        <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
          <p className="text-xs text-yellow-300">
            🔍 Still locating this mandi on map...
          </p>
        </div>
      )}
    </div>
  );
};

export default MandiCard;
