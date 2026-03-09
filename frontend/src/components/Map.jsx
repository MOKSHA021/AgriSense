import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Click to set farm location
function LocationPicker({ onSetFarm }) {
  useMapEvents({
    click: (e) => onSetFarm(e.latlng),
  });
  return null;
}

const MandiMap = ({ mandis, onRouteUpdate }) => {
  const [farmPos, setFarmPos] = useState([26.85, 80.95]); // Lucknow
  const [routeControl, setRouteControl] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFarmPos([pos.coords.latitude, pos.coords.longitude])
      );
    }
  }, []);

  const showRouteToMandi = (mandi) => {
    if (routeControl) mapRef.current.removeControl(routeControl);
    
    const destLat = mandi.lat || 26.85;
    const destLng = mandi.lng || 80.95;
    
    const control = L.Routing.control({
      waypoints: [L.latLng(farmPos), L.latLng(destLat, destLng)],
      lineOptions: { styles: [{ color: '#10b981', opacity: 0.8, weight: 6 }] },
      show: false,
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1/driving/' }),
    }).addTo(mapRef.current);

    control.on('routesfound', (e) => {
      const route = e.routes[0];
      onRouteUpdate({
        mandiName: mandi.name,
        distanceKm: route.summary.totalDistance / 1000,
        durationMin: route.summary.totalTime / 60,
        transportCost: 40 * (route.summary.totalDistance / 1000), // ₹40/km default
      });
    });
    setRouteControl(control);
  };

  return (
    <MapContainer
      center={farmPos}
      zoom={7}
      style={{ height: '450px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker onSetFarm={setFarmPos} />
      
      {/* Farm marker */}
      <Marker position={farmPos}>
        <Popup>🚜 Your Farm<br/>Click map to adjust location</Popup>
      </Marker>
      
      {/* Mandi markers */}
      {mandis.map((mandi, i) => {
        const lat = mandi.lat || 26.85;
        const lng = mandi.lng || 80.95;
        return (
          <Marker key={i} position={[lat, lng]} eventHandlers={{ click: () => showRouteToMandi(mandi) }}>
            <Popup>
              <div className="min-w-[220px]">
                <h4 className="font-bold">{mandi.name}</h4>
                <p>₹{mandi.pricePerUnit}/qtl | Net: ₹{mandi.netRevenue?.toLocaleString()}</p>
                {mandi.isBest && <span className="bg-amber-100 text-amber-800 px-2 py-1 text-xs rounded-full">🏆 BEST</span>}
                <br/>
                <button 
                  className="mt-2 w-full bg-green-500 text-white py-1 px-2 rounded text-xs"
                  onClick={() => showRouteToMandi(mandi)}
                >
                  Show Route →
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MandiMap;
