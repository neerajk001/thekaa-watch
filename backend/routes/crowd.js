const express = require('express');
const router = express.Router();
const CrowdVote = require('../models/CrowdVote');

router.post('/vote', async (req, res) => {
  try {
    const { shopId, userId, level } = req.body;

    if (!shopId || !userId || !level) {
      return res.status(400).json({ error: 'shopId, userId, and level are required' });
    }

    if (level < 1 || level > 3) {
      return res.status(400).json({ error: 'level must be between 1 and 3' });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const recentVote = await CrowdVote.findOne({
      shopId,
      userId,
      timestamp: { $gte: tenMinutesAgo }
    });

    if (recentVote) {
      const waitTime = Math.ceil((recentVote.timestamp.getTime() + 10 * 60 * 1000 - Date.now()) / 60000);
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `Please wait ${waitTime} more minute(s) before voting again`,
        waitMinutes: waitTime
      });
    }

    const vote = new CrowdVote({
      shopId,
      userId,
      level,
      timestamp: new Date()
    });

    await vote.save();

    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const recentVotes = await CrowdVote.find({
      shopId,
      timestamp: { $gte: twentyMinutesAgo }
    });

    const avgLevel = recentVotes.reduce((sum, v) => sum + v.level, 0) / recentVotes.length;
    
    let crowdLevel;
    if (avgLevel <= 1.5) {
      crowdLevel = { level: 1, icon: '🟢', label: 'Low' };
    } else if (avgLevel <= 2.5) {
      crowdLevel = { level: 2, icon: '🟡', label: 'Medium' };
    } else {
      crowdLevel = { level: 3, icon: '🔴', label: 'High' };
    }

    res.json({
      success: true,
      crowdLevel,
      voteCount: recentVotes.length
    });

  } catch (error) {
    console.error('Error submitting crowd vote:', error.message);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const votes = await CrowdVote.find({
      shopId,
      timestamp: { $gte: twentyMinutesAgo }
    });

    if (votes.length === 0) {
      return res.json({ crowdLevel: null, voteCount: 0 });
    }

    const avgLevel = votes.reduce((sum, v) => sum + v.level, 0) / votes.length;
    
    let crowdLevel;
    if (avgLevel <= 1.5) {
      crowdLevel = { level: 1, icon: '🟢', label: 'Low' };
    } else if (avgLevel <= 2.5) {
      crowdLevel = { level: 2, icon: '🟡', label: 'Medium' };
    } else {
      crowdLevel = { level: 3, icon: '🔴', label: 'High' };
    }

    res.json({
      crowdLevel,
      voteCount: votes.length
    });

  } catch (error) {
    console.error('Error fetching crowd level:', error.message);
    res.status(500).json({ error: 'Failed to fetch crowd level' });
  }
});

module.exports = router;


