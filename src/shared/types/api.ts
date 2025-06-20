export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type GameOverResponse = {
  type: 'gameOver';
  postId: string;
  score: number;
  rank: number;
};

export type LeaderboardEntry = {
  username: string;
  score: number;
  rank: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  postId: string;
  entries: LeaderboardEntry[];
};