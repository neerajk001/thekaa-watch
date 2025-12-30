export function getUserId() {
  if (typeof window === 'undefined') return null;
  
  let userId = localStorage.getItem('thekawatch_user_id');
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('thekawatch_user_id', userId);
  }
  
  return userId;
}

export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

export function getCrowdIcon(level) {
  if (!level) return '⚪';
  switch (level.level) {
    case 1:
      return '🟢';
    case 2:
      return '🟡';
    case 3:
      return '🔴';
    default:
      return '⚪';
  }
}

export function getCrowdLabel(level) {
  if (!level) return 'Unknown';
  return level.label || 'Unknown';
}


