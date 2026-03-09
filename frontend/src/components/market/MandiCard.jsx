const MandiCard = ({ mandi, index, isSelected, routeInfo, onSelect, onShowRoute }) => {
  return (
    <div
      onClick={() => onSelect(mandi)}
      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer
        ${isSelected
          ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50"
          : mandi.isBest
          ? "border-amber-300 ring-1 ring-amber-100"
          : "border-gray-100"
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
            <h3 className="font-bold text-gray-800">{mandi.name}</h3>
            <p className="text-xs text-gray-400">
              {mandi.district}{mandi.date && ` · ${mandi.date}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {mandi.isBest && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
              🏆 BEST DEAL
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${mandi.isRealData ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {mandi.isRealData ? "🟢 Live" : "🟡 Mock"}
          </span>
          {/* Pin status */}
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${mandi.lat && mandi.lng
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-400 animate-pulse"}`}>
            {mandi.lat && mandi.lng ? "📍 Pinned" : "🔍 Locating..."}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded-xl py-2.5">
          <p className="text-xs text-gray-400">Price/qtl</p>
          <p className="font-bold text-blue-600 text-sm">₹{mandi.pricePerUnit}</p>
        </div>
        <div className="bg-red-50 rounded-xl py-2.5">
          <p className="text-xs text-gray-400">Transport</p>
          <p className="font-bold text-red-400 text-sm">
            {isSelected && routeInfo
              ? `-₹${routeInfo.totalCost?.toLocaleString()}`
              : "📏 after route"}
          </p>
        </div>
        <div className={`rounded-xl py-2.5 ${mandi.isBest ? "bg-amber-50" : "bg-emerald-50"}`}>
          <p className="text-xs text-gray-400">Gross Revenue</p>
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
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-xs text-yellow-700">
            🔍 Still locating this mandi on map...
          </p>
        </div>
      )}
    </div>
  );
};

export default MandiCard;
