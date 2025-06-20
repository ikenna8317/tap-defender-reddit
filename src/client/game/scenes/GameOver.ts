import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { LeaderboardResponse } from '../../../shared/types/api';

export class GameOver extends Scene {
  private score: number;
  private rank: number;

  constructor() {
    super('GameOver');
  }

  init(data: { score: number; rank: number }) {
    this.score = data.score || 0;
    this.rank = data.rank || -1;
  }

  create() {
    // Dark overlay background
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

    // Game Over title
    this.add.text(512, 150, 'GAME OVER', {
      fontFamily: 'Arial Black',
      fontSize: 64,
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5);

    // Score display
    this.add.text(512, 230, `Final Score: ${this.score}`, {
      fontFamily: 'Arial Black',
      fontSize: 36,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    // Rank display
    if (this.rank > 0) {
      this.add.text(512, 280, `Rank: #${this.rank}`, {
        fontFamily: 'Arial Black',
        fontSize: 28,
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5);
    }

    // Buttons
    this.createButton(512, 380, 'Play Again', '#00ff00', () => {
      this.scene.start('Game');
    });

    this.createButton(512, 450, 'Main Menu', '#ffffff', () => {
      this.scene.start('MainMenu');
    });

    this.createButton(512, 520, 'Leaderboard', '#ffd700', () => {
      this.showLeaderboard();
    });
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void) {
    const button = this.add.text(x, y, text, {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: color,
      backgroundColor: '#444444',
      padding: {
        x: 20,
        y: 10,
      } as Phaser.Types.GameObjects.Text.TextPadding,
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => button.setStyle({ backgroundColor: '#555555' }))
    .on('pointerout', () => button.setStyle({ backgroundColor: '#444444' }))
    .on('pointerdown', onClick);

    return button;
  }

  private async showLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json() as LeaderboardResponse;
      this.scene.start('Leaderboard', { entries: data.entries });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  }
}