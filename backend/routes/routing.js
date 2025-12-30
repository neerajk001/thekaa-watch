const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/route', async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon, mode = 'foot' } = req.query;

    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ error: 'fromLat, fromLon, toLat, and toLon are required' });
    }

    const profile = mode === 'car' ? 'car' : 'foot';
    const url = `${process.env.OSRM_API_URL}/route/v1/${profile}/${fromLon},${fromLat};${toLon},${toLat}`;

    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: false
      },
      timeout: 10000
    });

    if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({ error: 'No route found' });
    }

    const route = response.data.routes[0];
    
    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMin = Math.ceil(route.duration / 60);

    res.json({
      distance: parseFloat(distanceKm),
      duration: durationMin,
      geometry: route.geometry,
      mode: profile
    });

  } catch (error) {
    console.error('Error fetching route:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch route',
      message: error.message 
    });
  }
});

module.exports = router;


