import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.TileSprite;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    // Tiled grass background
    this.background = this.add.tileSprite(0, 0, 1024, 768, 'grass');
    this.background.setOrigin(0, 0);

    // Game title
    this.title = this.add
      .text(512, 200, 'TAP IT DEFENDER', {
        fontFamily: 'Arial Black',
        fontSize: 64,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(512, 280, 'Defend against the invasion!', {
        fontFamily: 'Arial Black',
        fontSize: 24,
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Instructions
    const instructions = [
      'Tap enemies to eliminate them (+1 point)',
      'Avoid tapping innocents (-1 point, -1 health)',
      'Don\'t let enemies escape (jump scare, -1 health)',
      'Armored enemies need multiple taps',
      'Healer enemies restore 1 health when defeated'
    ];

    for (let i = 0; i < instructions.length; i++) {
      this.add.text(512, 350 + (i * 25), instructions[i], {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      }).setOrigin(0.5);
    }

    // Start button
    this.createButton(512, 550, 'START GAME', '#00ff00', () => {
      this.scene.start('Game');
    });

    // Leaderboard button
    this.createButton(512, 620, 'LEADERBOARD', '#ffd700', () => {
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

      const data = await response.json();
      this.scene.start('Leaderboard', { entries: data.entries });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  }
}