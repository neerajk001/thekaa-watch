const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');
const Shop = require('../models/Shop');
const CrowdVote = require('../models/CrowdVote');
const StatusVote = require('../models/StatusVote');

const cache = new NodeCache({ stdTTL: 300 });

function buildOverpassQuery(lat, lon, radius = 3000) {
  return `
    [out:json][timeout:25];
    (
      node["shop"="alcohol"](around:${radius},${lat},${lon});
      node["shop"="beverages"](around:${radius},${lat},${lon});
      node["amenity"="bar"](around:${radius},${lat},${lon});
      way["shop"="alcohol"](around:${radius},${lat},${lon});
      way["shop"="beverages"](around:${radius},${lat},${lon});
      way["amenity"="bar"](around:${radius},${lat},${lon});
    );
    out center;
  `;
}

function normalizeShop(element) {
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;
  
  if (!lat || !lon) return null;

  const tags = element.tags || {};
  let type = 'alcohol';
  if (tags.shop === 'beverages') type = 'beverages';
  if (tags.amenity === 'bar') type = 'bar';

  return {
    osmId: `${element.type}_${element.id}`,
    name: tags.name || tags['name:en'] || `${type.charAt(0).toUpperCase() + type.slice(1)} Shop`,
    lat,
    lon,
    type,
    address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']]
      .filter(Boolean)
      .join(', ') || ''
  };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getCrowdLevel(shopId) {
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
  
  const votes = await CrowdVote.find({
    shopId,
    timestamp: { $gte: twentyMinutesAgo }
  });

  if (votes.length === 0) return null;

  const avgLevel = votes.reduce((sum, v) => sum + v.level, 0) / votes.length;
  
  if (avgLevel <= 1.5) return { level: 1, icon: '🟢', label: 'Low' };
  if (avgLevel <= 2.5) return { level: 2, icon: '🟡', label: 'Medium' };
  return { level: 3, icon: '🔴', label: 'High' };
}

async function getOpenStatus(shopId) {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const votes = await StatusVote.find({
    shopId,
    timestamp: { $gte: fifteenMinutesAgo }
  }).sort({ timestamp: -1 });

  if (votes.length === 0) return null;

  const openVotes = votes.filter(v => v.isOpen).length;
  const closedVotes = votes.length - openVotes;
  
  const isOpen = openVotes > closedVotes;
  const latestVote = votes[0];
  const minutesAgo = Math.floor((Date.now() - latestVote.timestamp) / 60000);

  return {
    isOpen,
    updatedAgo: minutesAgo,
    confidence: Math.max(openVotes, closedVotes) / votes.length
  };
}

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 3000 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' });
    }

    const cacheKey = `shops_${lat}_${lon}_${radius}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const query = buildOverpassQuery(parseFloat(lat), parseFloat(lon), parseInt(radius));
    
    const response = await axios.post(
      process.env.OVERPASS_API_URL,
      query,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 30000
      }
    );

    const elements = response.data.elements || [];
    const shops = elements
      .map(normalizeShop)
      .filter(Boolean);

    for (const shop of shops) {
      await Shop.findOneAndUpdate(
        { osmId: shop.osmId },
        { ...shop, lastSeen: new Date() },
        { upsert: true, new: true }
      );
    }

    const enrichedShops = await Promise.all(
      shops.map(async (shop) => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lon),
          shop.lat,
          shop.lon
        );

        const [crowdLevel, openStatus] = await Promise.all([
          getCrowdLevel(shop.osmId),
          getOpenStatus(shop.osmId)
        ]);

        return {
          ...shop,
          distance: parseFloat(distance.toFixed(2)),
          crowdLevel,
          openStatus
        };
      })
    );

    enrichedShops.sort((a, b) => a.distance - b.distance);

    const result = {
      shops: enrichedShops,
      count: enrichedShops.length,
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, result);
    res.json(result);

  } catch (error) {
    console.error('Error fetching shops:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch shops',
      message: error.message 
    });
  }
});

router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { userLat, userLon } = req.query;

    const shop = await Shop.findOne({ osmId: shopId });
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const [crowdLevel, openStatus] = await Promise.all([
      getCrowdLevel(shopId),
      getOpenStatus(shopId)
    ]);

    let distance = null;
    if (userLat && userLon) {
      distance = calculateDistance(
        parseFloat(userLat),
        parseFloat(userLon),
        shop.lat,
        shop.lon
      );
    }

    res.json({
      ...shop.toObject(),
      distance: distance ? parseFloat(distance.toFixed(2)) : null,
      crowdLevel,
      openStatus
    });

  } catch (error) {
    console.error('Error fetching shop:', error.message);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

module.exports = router;


