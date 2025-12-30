'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {

    if ('geolocation' in navigator) {
      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationError(null);
          setIsTracking(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError(error.message);
          // Use fallback location only on first error
          if (!userLocation) {
            setUserLocation({ lat: 28.6139, lon: 77.2090 });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000, // Accept cached location if less than 10 seconds old
        }
      );

      // Cleanup: Stop watching when component unmounts
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setLocationError('Geolocation not supported');
      setUserLocation({ lat: 28.6139, lon: 77.2090 });
    }
  }, []);

  if (!userLocation) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">
            {locationError ? `Location error: ${locationError}` : 'Getting your location...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <MapView userLocation={userLocation} isTracking={isTracking} />
    </main>
  );
}

