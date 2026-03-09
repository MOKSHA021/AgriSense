import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { calculateTransportCost } from "../../utils/transportCost";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const farmerIcon = new L.Icon({
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const mandiIcon = new L.Icon({
  iconUrl:   "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// ── Routing: real road distance → accurate cost ──
function RoutingMachine({ farmerPos, mandiPos, quantity, onRouteFound }) {
  const map = useMap();
  const ref = useRef(null);

  useEffect(() => {
    if (!map || !farmerPos || !mandiPos) return;
    if (ref.current) { map.removeControl(ref.current); ref.current = null; }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(farmerPos[0], farmerPos[1]),
        L.latLng(mandiPos[0],  mandiPos[1]),
      ],
      routeWhileDragging: false,
      addWaypoints:       false,
      draggableWaypoints: false,
      fitSelectedRoutes:  true,
      showAlternatives:   false,
      lineOptions: {
        styles: [{ color: "#f59e0b", weight: 5, opacity: 0.85 }],
      },
      createMarker: () => null,
    });

    control.on("routesfound", (e) => {
      const route       = e.routes[0];
      const distanceKm  = parseFloat((route.summary.totalDistance / 1000).toFixed(1));
      const durationMin = Math.round(route.summary.totalTime / 60);

      const { totalCost, breakdown, truckType } =
        calculateTransportCost(distanceKm, quantity);

      onRouteFound({ distanceKm, durationMin, totalCost, breakdown, truckType });
    });

    control.addTo(map);
    ref.current = control;

    return () => { if (ref.current) map.removeControl(ref.current); };
  }, [map, farmerPos, mandiPos, quantity]);

  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 12, { duration: 1.2 });
  }, [position]);
  return null;
}

function ClickHandler({ mode, onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (mode) onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const MandiMap = ({
  farmerLocation,
  farmerAddress,
  mandiLocation,
  selectedMandi,
  clickMode,
  onMapClick,
  flyTarget,
  showRoute,
  quantity,
  onRouteFound,
  onFarmerMove,
}) => {
  return (
    <MapContainer
      center={farmerLocation}
      zoom={8}
      style={{
        height: "450px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        cursor: clickMode ? "crosshair" : "default",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler mode={clickMode} onMapClick={onMapClick} />
      {flyTarget && <FlyTo position={flyTarget} />}

      {/* 🔵 Farmer marker */}
      <Marker position={farmerLocation} icon={farmerIcon}>
        <Popup>
          <div className="min-w-[170px]">
            <h4 className="font-bold text-base mb-1">🚜 Your Farm</h4>
            <p className="text-xs text-gray-500 mb-2">
              {farmerAddress || `${farmerLocation[0].toFixed(4)}, ${farmerLocation[1].toFixed(4)}`}
            </p>
            <button
              className="w-full bg-blue-500 text-white py-1 px-2 rounded text-xs hover:bg-blue-600"
              onClick={onFarmerMove}
            >
              📍 Move Pin
            </button>
          </div>
        </Popup>
      </Marker>

      {/* 🔴 Mandi marker — set when card is clicked */}
      {mandiLocation && (
        <Marker position={mandiLocation} icon={mandiIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <h4 className="font-bold text-base mb-1">
                🏪 {selectedMandi?.name || "Pinned Mandi"}
              </h4>
              {selectedMandi && (
                <p className="text-xs text-gray-500">
                  {selectedMandi.district} · ₹{selectedMandi.pricePerUnit}/qtl
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Route — drawn on "Show Route" click */}
      {showRoute && mandiLocation && (
        <RoutingMachine
          farmerPos={farmerLocation}
          mandiPos={mandiLocation}
          quantity={quantity}
          onRouteFound={onRouteFound}
        />
      )}
    </MapContainer>
  );
};

export default MandiMap;
