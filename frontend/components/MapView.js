'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchNearbyShops, fetchRoute } from '@/lib/api';
import BottomSheet from './BottomSheet';
import Header from './Header';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const shopIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40C16 40 32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="#6366f1"/>
      <circle cx="16" cy="16" r="8" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lon], map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

export default function MapView({ userLocation, userId, isTracking }) {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  const loadShops = useCallback(async () => {
    try {
      const data = await fetchNearbyShops(userLocation.lat, userLocation.lon);
      setShops(data.shops || []);
      setError(null);
    } catch (err) {
      console.error('Error loading shops:', err);
      setError('Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    loadShops();
    
    pollIntervalRef.current = setInterval(() => {
      loadShops();
    }, 15000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [loadShops]);

  const handleShopClick = (shop) => {
    // Only clear route if clicking a different shop
    if (selectedShop?.osmId !== shop.osmId) {
      setRoute(null);
    }
    setSelectedShop(shop);
  };

  const handleShowRoute = async (mode = 'foot') => {
    if (!selectedShop) return;

    try {
      const routeData = await fetchRoute(
        userLocation.lat,
        userLocation.lon,
        selectedShop.lat,
        selectedShop.lon,
        mode
      );

      const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      setRoute({
        coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        mode: routeData.mode,
      });
    } catch (err) {
      console.error('Error fetching route:', err);
      alert('Failed to get route. Please try again.');
    }
  };

  const handleCloseBottomSheet = () => {
    setSelectedShop(null);
    // Keep route visible after closing bottom sheet
    // User can still see the route on the map
  };

  const handleVoteUpdate = () => {
    loadShops();
  };

  const handleClearRoute = () => {
    setRoute(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      <Header shopsCount={shops.length} isTracking={isTracking} />
      
      <MapContainer
        center={[userLocation.lat, userLocation.lon]}
        zoom={14}
        className="h-full w-full"
        zoomControl={true}
      >
        <MapUpdater center={userLocation} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Your Location</p>
            </div>
          </Popup>
        </Marker>

        {shops.map((shop) => (
          <Marker
            key={shop.osmId}
            position={[shop.lat, shop.lon]}
            icon={shopIcon}
            eventHandlers={{
              click: () => handleShopClick(shop),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{shop.name}</p>
                <p className="text-xs text-gray-400 mt-1">{shop.distance}km away</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {route && (
          <Polyline
            positions={route.coordinates}
            color="#10b981"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          {error}
        </div>
      )}

      {selectedShop && (
        <BottomSheet
          shop={selectedShop}
          userId={userId}
          route={route}
          onClose={handleCloseBottomSheet}
          onShowRoute={handleShowRoute}
          onVoteUpdate={handleVoteUpdate}
          onClearRoute={handleClearRoute}
        />
      )}
    </div>
  );
}

