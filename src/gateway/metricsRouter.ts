import { Router } from 'express';
import {
    getMetricSummary,
    getRequestsPerMinute,
    getLatencyMetrics,
    getErrorRate,
    getTopEndpoints,
    getRecentRequests,
} from '../db/metrics';

const router = Router();

router.get('/summary', async(req, res) => {
    try {
        const summary = await getMetricSummary();
        res.json(summary);
    }catch (err) {
        console.error('Metrices summary error:', err);
        res.status(500).json({ error: 'Failed to fetch metrices' });
    }
});

router.get('/requests-per-minute', async (req, res) => {
  try {
    res.json(await getRequestsPerMinute());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request rate' });
  }
});

router.get('/latency', async (req, res) => {
  try {
    res.json(await getLatencyMetrics());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latency metrics' });
  }
});

router.get('/errors', async (req, res) => {
  try {
    res.json(await getErrorRate());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch error rate' });
  }
});

router.get('/top-endpoints', async (req, res) => {
  try {
    res.json(await getTopEndpoints());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top endpoints' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json(await getRecentRequests(limit));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent requests' });
  }
});

export default router;
