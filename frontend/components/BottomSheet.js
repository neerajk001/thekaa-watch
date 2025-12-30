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
      <div className="bg-dark-surface rounded-t-3xl shadow-2xl border-t border-dark-border max-h-[70vh] overflow-y-auto">
        <div className="px-6 py-4">
          <div className="w-12 h-1 bg-dark-border rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{shop.name}</h2>
              <p className="text-sm text-gray-400">{formatDistance(shop.distance)} away</p>
              {shop.address && (
                <p className="text-xs text-gray-500 mt-1">{shop.address}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-hover rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-bg rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Crowd Level</span>
                <span className="text-2xl">{getCrowdIcon(shop.crowdLevel)}</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {getCrowdLabel(shop.crowdLevel)}
              </p>
            </div>

            <div className="bg-dark-bg rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Status</span>
                <span className="text-2xl">{shop.openStatus?.isOpen ? '🟢' : '🔴'}</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {shop.openStatus ? (shop.openStatus.isOpen ? 'Open' : 'Closed') : 'Unknown'}
              </p>
              {shop.openStatus && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated {shop.openStatus.updatedAgo}m ago
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">How crowded is it right now?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 1, icon: '🟢', label: 'Low' },
                { level: 2, icon: '🟡', label: 'Medium' },
                { level: 3, icon: '🔴', label: 'High' },
              ].map(({ level, icon, label }) => (
                <button
                  key={level}
                  onClick={() => handleCrowdVote(level)}
                  disabled={isVoting}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    selectedCrowdLevel === level
                      ? 'bg-accent-primary text-white'
                      : 'bg-dark-bg hover:bg-dark-hover text-white'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Is this shop open?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStatusVote(true)}
                disabled={isVoting}
                className={`py-3 px-4 rounded-xl transition-all bg-dark-bg hover:bg-dark-hover text-white ${
                  isVoting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-2xl mb-1">🟢</div>
                <div className="text-sm">Open</div>
              </button>
              <button
                onClick={() => handleStatusVote(false)}
                disabled={isVoting}
                className={`py-3 px-4 rounded-xl transition-all bg-dark-bg hover:bg-dark-hover text-white ${
                  isVoting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-2xl mb-1">🔴</div>
                <div className="text-sm">Closed</div>
              </button>
            </div>
          </div>

          {voteError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {voteError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={toggleRouteMode}
              className="px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-xl transition-colors text-sm"
            >
              {routeMode === 'foot' ? '🚶 Walking' : '🚗 Driving'}
            </button>
            <button
              onClick={handleRouteClick}
              className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              {route ? 'Update Route' : 'Show Route'}
            </button>
          </div>

          {route && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Distance</p>
                    <p className="text-lg font-semibold text-white">{formatDistance(route.distance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ETA</p>
                    <p className="text-lg font-semibold text-white">{formatDuration(route.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Mode</p>
                    <p className="text-lg">{route.mode === 'foot' ? '🚶' : '🚗'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClearRoute}
                className="w-full py-2 px-4 bg-dark-bg hover:bg-dark-hover text-gray-400 hover:text-white rounded-xl transition-colors text-sm"
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

