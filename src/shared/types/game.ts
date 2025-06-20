export interface GameState {
  score: number;
  health: number;
  wave: number;
  gameTime: number;
  isGameOver: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  type: 'basic' | 'armored' | 'healer';
  armor: number;
  timeLeft: number;
  maxTime: number;
}

export interface Innocent {
  id: string;
  x: number;
  y: number;
  timeLeft: number;
  maxTime: number;
}

export interface GameConfig {
  maxHealth: number;
  enemySpawnRate: number;
  innocentSpawnRate: number;
  enemyLifetime: number;
  innocentLifetime: number;
  waveProgressionRate: number;
}