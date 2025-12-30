'use client';

import { useState } from 'react';
import { formatDistance, formatDuration } from '@/lib/utils';

export default function BottomSheet({ shop, route, onClose, onShowRoute, onClearRoute }) {
  const [routeMode, setRouteMode] = useState('foot');

  const handleRouteClick = () => {
    onShowRoute(routeMode);
  };

  const toggleRouteMode = () => {
    const newMode = routeMode === 'foot' ? 'car' : 'foot';
    setRouteMode(newMode);
    if (route) {
      onShowRoute(newMode);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] animate-slide-up">
      <div className="bg-dark-surface rounded-t-3xl shadow-2xl border-t border-dark-border max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="w-12 h-1 bg-dark-border rounded-full mx-auto mb-4 sm:mb-6"></div>
          
          <div className="flex items-start justify-between mb-6 sm:mb-8 gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 line-clamp-2">{shop.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg sm:text-xl">📍</span>
                <p className="text-base sm:text-lg text-gray-300">{formatDistance(shop.distance)} away</p>
              </div>
              {shop.address && (
                <p className="text-sm text-gray-400 line-clamp-2">{shop.address}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-dark-hover rounded-full transition-colors flex-shrink-0 active:bg-dark-border"
              aria-label="Close"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-dark-bg rounded-xl">
              <span className="text-2xl">
                {routeMode === 'foot' ? '🚶' : '🚗'}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Travel Mode</p>
                <p className="text-base font-semibold text-white">
                  {routeMode === 'foot' ? 'Walking' : 'Driving'}
                </p>
              </div>
              <button
                onClick={toggleRouteMode}
                className="px-4 py-2 bg-dark-surface hover:bg-dark-hover active:bg-dark-border rounded-lg transition-all active:scale-95 text-sm text-gray-300"
              >
                Switch
              </button>
            </div>

            <button
              onClick={handleRouteClick}
              className="w-full bg-accent-primary hover:bg-accent-primary/90 active:bg-accent-primary/80 text-white py-4 sm:py-5 px-6 rounded-xl font-bold transition-all active:scale-95 text-base sm:text-lg shadow-lg shadow-accent-primary/20"
            >
              {route ? '🔄 Update Route' : '🗺️ Show Route'}
            </button>
          </div>

          {route && (
            <div className="mt-4 space-y-3">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Distance</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{formatDistance(route.distance)}</p>
                  </div>
                  <div className="text-center border-x border-dark-border">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">ETA</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{formatDuration(route.duration)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Mode</p>
                    <p className="text-xl sm:text-2xl">{route.mode === 'foot' ? '🚶' : '🚗'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClearRoute}
                className="w-full py-3 px-4 bg-dark-bg hover:bg-dark-hover active:bg-dark-border text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 text-sm font-medium"
              >
                ✕ Clear Route
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

