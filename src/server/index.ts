import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse, GameOverResponse, LeaderboardResponse, LeaderboardEntry } from '../shared/types/api';
import { createServer, context } from '@devvit/server';
import { redis } from '@devvit/redis';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// Initialize game data
router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const count = await redis.get('count');
      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

// Submit game score and get rank
router.post<{ postId: string }, GameOverResponse | { status: string; message: string }, { score: number }>(
  '/api/game-over',
  async (req, res): Promise<void> => {
    const { postId, userId, username } = context;
    
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    if (!userId || !username) {
      res.status(400).json({
        status: 'error',
        message: 'User authentication required',
      });
      return;
    }

    try {
      const { score } = req.body;
      
      if (typeof score !== 'number' || score < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Valid score is required',
        });
        return;
      }

      // Store user's best score
      const userScoreKey = `user_score:${userId}`;
      const currentBest = await redis.get(userScoreKey);
      const currentBestScore = currentBest ? parseInt(currentBest) : 0;

      if (score > currentBestScore) {
        await redis.set(userScoreKey, score.toString());
        await redis.set(`user_name:${userId}`, username);
      }

      // Get all user scores to calculate rank
      const userKeys = await redis.keys('user_score:*');
      const scores: Array<{ userId: string; score: number; username: string }> = [];

      for (const key of userKeys) {
        const userIdFromKey = key.replace('user_score:', '');
        const userScore = await redis.get(key);
        const userName = await redis.get(`user_name:${userIdFromKey}`);
        
        if (userScore && userName) {
          scores.push({
            userId: userIdFromKey,
            score: parseInt(userScore),
            username: userName
          });
        }
      }

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Find user's rank
      const userRank = scores.findIndex(s => s.userId === userId) + 1;

      res.json({
        type: 'gameOver',
        postId,
        score,
        rank: userRank
      });
    } catch (error) {
      console.error(`Game Over API Error for post ${postId}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process game over'
      });
    }
  }
);

// Get leaderboard
router.get<{ postId: string }, LeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    try {
      // Get all user scores
      const userKeys = await redis.keys('user_score:*');
      const scores: Array<{ userId: string; score: number; username: string }> = [];

      for (const key of userKeys) {
        const userIdFromKey = key.replace('user_score:', '');
        const userScore = await redis.get(key);
        const userName = await redis.get(`user_name:${userIdFromKey}`);
        
        if (userScore && userName) {
          scores.push({
            userId: userIdFromKey,
            score: parseInt(userScore),
            username: userName
          });
        }
      }

      // Sort by score descending and create leaderboard entries
      scores.sort((a, b) => b.score - a.score);
      
      const entries: LeaderboardEntry[] = scores.slice(0, 50).map((score, index) => ({
        username: score.username,
        score: score.score,
        rank: index + 1
      }));

      res.json({
        type: 'leaderboard',
        postId,
        entries
      });
    } catch (error) {
      console.error(`Leaderboard API Error for post ${postId}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch leaderboard'
      });
    }
  }
);

// Legacy increment endpoint (keeping for compatibility)
router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

// Legacy decrement endpoint (keeping for compatibility)
router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

app.use(router);

const port = process.env.WEBBIT_PORT || 3000;
const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));