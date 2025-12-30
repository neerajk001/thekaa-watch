const express = require('express');
const router = express.Router();
const StatusVote = require('../models/StatusVote');

router.post('/vote', async (req, res) => {
  try {
    const { shopId, userId, isOpen } = req.body;

    if (!shopId || !userId || typeof isOpen !== 'boolean') {
      return res.status(400).json({ error: 'shopId, userId, and isOpen are required' });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const recentVote = await StatusVote.findOne({
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

    const vote = new StatusVote({
      shopId,
      userId,
      isOpen,
      timestamp: new Date()
    });

    await vote.save();

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentVotes = await StatusVote.find({
      shopId,
      timestamp: { $gte: fifteenMinutesAgo }
    }).sort({ timestamp: -1 });

    const openVotes = recentVotes.filter(v => v.isOpen).length;
    const closedVotes = recentVotes.length - openVotes;
    const finalIsOpen = openVotes > closedVotes;
    const minutesAgo = 0;

    res.json({
      success: true,
      openStatus: {
        isOpen: finalIsOpen,
        updatedAgo: minutesAgo,
        confidence: Math.max(openVotes, closedVotes) / recentVotes.length
      },
      voteCount: recentVotes.length
    });

  } catch (error) {
    console.error('Error submitting status vote:', error.message);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const votes = await StatusVote.find({
      shopId,
      timestamp: { $gte: fifteenMinutesAgo }
    }).sort({ timestamp: -1 });

    if (votes.length === 0) {
      return res.json({ openStatus: null, voteCount: 0 });
    }

    const openVotes = votes.filter(v => v.isOpen).length;
    const closedVotes = votes.length - openVotes;
    const isOpen = openVotes > closedVotes;
    const minutesAgo = Math.floor((Date.now() - votes[0].timestamp) / 60000);

    res.json({
      openStatus: {
        isOpen,
        updatedAgo: minutesAgo,
        confidence: Math.max(openVotes, closedVotes) / votes.length
      },
      voteCount: votes.length
    });

  } catch (error) {
    console.error('Error fetching status:', error.message);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

module.exports = router;


