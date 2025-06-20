import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { LeaderboardEntry } from '../../../shared/types/api';

export class Leaderboard extends Scene {
  private entries: LeaderboardEntry[];

  constructor() {
    super('Leaderboard');
  }

  init(data: { entries: LeaderboardEntry[] }) {
    this.entries = data.entries || [];
  }

  create() {
    // Dark overlay background
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.9);

    // Title
    this.add.text(512, 80, 'LEADERBOARD', {
      fontFamily: 'Arial Black',
      fontSize: 48,
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    // Headers
    this.add.text(200, 140, 'Rank', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(512, 140, 'Player', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(824, 140, 'Score', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Leaderboard entries
    const maxEntries = Math.min(10, this.entries.length);
    for (let i = 0; i < maxEntries; i++) {
      const entry = this.entries[i];
      const y = 180 + (i * 40);
      
      // Rank color based on position
      let rankColor = '#ffffff';
      if (i === 0) rankColor = '#ffd700'; // Gold
      else if (i === 1) rankColor = '#c0c0c0'; // Silver
      else if (i === 2) rankColor = '#cd7f32'; // Bronze

      this.add.text(200, y, `#${entry.rank}`, {
        fontFamily: 'Arial Black',
        fontSize: 20,
        color: rankColor,
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.add.text(512, y, entry.username, {
        fontFamily: 'Arial Black',
        fontSize: 20,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.add.text(824, y, entry.score.toString(), {
        fontFamily: 'Arial Black',
        fontSize: 20,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // Back button
    this.createButton(512, 650, 'Back', '#ffffff', () => {
      this.scene.start('GameOver', { score: 0, rank: -1 });
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
}