import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    // Progress bar background
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath('assets');

    // Load game assets
    this.load.image('grass', 'grass.png');
    this.load.image('enemy-basic', 'enemy-basic.png');
    this.load.image('enemy-armored', 'enemy-armored.png');
    this.load.image('enemy-healer', 'enemy-healer.png');
    this.load.image('innocent', 'innocent.png');
    this.load.image('heart-full', 'heart-full.png');
    this.load.image('heart-empty', 'heart-empty.png');
  }

  create() {
    this.scene.start('MainMenu');
  }
}