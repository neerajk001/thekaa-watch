import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const fetchNearbyShops = async (lat, lon, radius = 3000) => {
  const response = await api.get('/shops/nearby', {
    params: { lat, lon, radius },
  });
  return response.data;
};

export const fetchShopDetails = async (shopId, userLat, userLon) => {
  const response = await api.get(`/shops/${shopId}`, {
    params: { userLat, userLon },
  });
  return response.data;
};

export const submitCrowdVote = async (shopId, userId, level) => {
  const response = await api.post('/crowd/vote', {
    shopId,
    userId,
    level,
  });
  return response.data;
};

export const fetchCrowdLevel = async (shopId) => {
  const response = await api.get(`/crowd/${shopId}`);
  return response.data;
};

export const submitStatusVote = async (shopId, userId, isOpen) => {
  const response = await api.post('/status/vote', {
    shopId,
    userId,
    isOpen,
  });
  return response.data;
};

export const fetchOpenStatus = async (shopId) => {
  const response = await api.get(`/status/${shopId}`);
  return response.data;
};

export const fetchRoute = async (fromLat, fromLon, toLat, toLon, mode = 'foot') => {
  const response = await api.get('/routing/route', {
    params: { fromLat, fromLon, toLat, toLon, mode },
  });
  return response.data;
};

export default api;


