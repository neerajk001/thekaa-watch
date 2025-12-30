'use client';

import { useState } from 'react';
import { submitCrowdVote, submitStatusVote } from '@/lib/api';
import { formatDistance, formatDuration, getCrowdIcon, getCrowdLabel } from '@/lib/utils';

export default function BottomSheet({ shop, userId, route, onClose, onShowRoute, onVoteUpdate, onClearRoute }) {
  const [selectedCrowdLevel, setSelectedCrowdLevel] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [routeMode, setRouteMode] = useState('foot');

  const handleCrowdVote = async (level) => {
    if (isVoting) return;
    
    setIsVoting(true);
    setVoteError(null);
    setSelectedCrowdLevel(level);

    try {
      await submitCrowdVote(shop.osmId, userId, level);
      onVoteUpdate();
      setTimeout(() => setSelectedCrowdLevel(null), 2000);
    } catch (err) {
      console.error('Error voting:', err);
      if (err.response?.status === 429) {
        setVoteError(err.response.data.message || 'Please wait before voting again');
      } else {
        setVoteError('Failed to submit vote');
      }
      setSelectedCrowdLevel(null);
    } finally {
      setIsVoting(false);
    }
  };

  const handleStatusVote = async (isOpen) => {
    if (isVoting) return;
    
    setIsVoting(true);
    setVoteError(null);

    try {
      await submitStatusVote(shop.osmId, userId, isOpen);
      onVoteUpdate();
    } catch (err) {
      console.error('Error voting:', err);
      if (err.response?.status === 429) {
        setVoteError(err.response.data.message || 'Please wait before voting again');
      } else {
        setVoteError('Failed to submit vote');
      }
    } finally {
      setIsVoting(false);
    }
  };

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
          <div className="w-12 h-1 bg-dark-border rounded-full mx-auto mb-3 sm:mb-4"></div>
          
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2">{shop.name}</h2>
              <p className="text-sm text-gray-400">{formatDistance(shop.distance)} away</p>
              {shop.address && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{shop.address}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-hover rounded-full transition-colors flex-shrink-0 active:bg-dark-border"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-dark-bg rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Crowd Level</span>
                <span className="text-xl sm:text-2xl">{getCrowdIcon(shop.crowdLevel)}</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-white">
                {getCrowdLabel(shop.crowdLevel)}
              </p>
            </div>

            <div className="bg-dark-bg rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Status</span>
                <span className="text-xl sm:text-2xl">{shop.openStatus?.isOpen ? '🟢' : '🔴'}</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-white">
                {shop.openStatus ? (shop.openStatus.isOpen ? 'Open' : 'Closed') : 'Unknown'}
              </p>
              {shop.openStatus && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated {shop.openStatus.updatedAgo}m ago
                </p>
              )}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">How crowded is it right now?</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { level: 1, icon: '🟢', label: 'Low' },
                { level: 2, icon: '🟡', label: 'Medium' },
                { level: 3, icon: '🔴', label: 'High' },
              ].map(({ level, icon, label }) => (
                <button
                  key={level}
                  onClick={() => handleCrowdVote(level)}
                  disabled={isVoting}
                  className={`py-3 sm:py-4 px-2 sm:px-4 rounded-xl transition-all active:scale-95 ${
                    selectedCrowdLevel === level
                      ? 'bg-accent-primary text-white'
                      : 'bg-dark-bg hover:bg-dark-hover active:bg-dark-border text-white'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-xl sm:text-2xl mb-1">{icon}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">Is this shop open?</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => handleStatusVote(true)}
                disabled={isVoting}
                className={`py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all active:scale-95 bg-dark-bg hover:bg-dark-hover active:bg-dark-border text-white ${
                  isVoting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1">🟢</div>
                <div className="text-xs sm:text-sm">Open</div>
              </button>
              <button
                onClick={() => handleStatusVote(false)}
                disabled={isVoting}
                className={`py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all active:scale-95 bg-dark-bg hover:bg-dark-hover active:bg-dark-border text-white ${
                  isVoting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1">🔴</div>
                <div className="text-xs sm:text-sm">Closed</div>
              </button>
            </div>
          </div>

          {voteError && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs sm:text-sm text-red-400">
              {voteError}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={toggleRouteMode}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-bg hover:bg-dark-hover active:bg-dark-border rounded-xl transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
            >
              {routeMode === 'foot' ? '🚶 Walking' : '🚗 Driving'}
            </button>
            <button
              onClick={handleRouteClick}
              className="flex-1 bg-accent-primary hover:bg-accent-primary/90 active:bg-accent-primary/80 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all active:scale-95 text-sm sm:text-base"
            >
              {route ? 'Update Route' : 'Show Route'}
            </button>
          </div>

          {route && (
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <div className="p-3 sm:p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Distance</p>
                    <p className="text-base sm:text-lg font-semibold text-white">{formatDistance(route.distance)}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs sm:text-sm text-gray-400">ETA</p>
                    <p className="text-base sm:text-lg font-semibold text-white">{formatDuration(route.duration)}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs sm:text-sm text-gray-400">Mode</p>
                    <p className="text-base sm:text-lg">{route.mode === 'foot' ? '🚶' : '🚗'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClearRoute}
                className="w-full py-2 px-4 bg-dark-bg hover:bg-dark-hover active:bg-dark-border text-gray-400 hover:text-white rounded-xl transition-all active:scale-95 text-xs sm:text-sm"
              >
                Clear Route from Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

