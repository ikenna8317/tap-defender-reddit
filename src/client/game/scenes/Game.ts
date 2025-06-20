import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { GameState, Enemy, Innocent, GameConfig } from '../../../shared/types/game';
import { GameOverResponse } from '../../../shared/types/api';

export class Game extends Scene {
  private gameState: GameState;
  private config: GameConfig;
  private enemies: Map<string, { sprite: Phaser.GameObjects.Sprite; data: Enemy }>;
  private innocents: Map<string, { sprite: Phaser.GameObjects.Sprite; data: Innocent }>;
  private hearts: Phaser.GameObjects.Sprite[];
  private scoreText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.TileSprite;
  private enemySpawnTimer: Phaser.Time.TimerEvent;
  private innocentSpawnTimer: Phaser.Time.TimerEvent;
  private gameTimer: Phaser.Time.TimerEvent;
  private jumpScareOverlay: Phaser.GameObjects.Rectangle;
  private jumpScareSprite: Phaser.GameObjects.Sprite;

  constructor() {
    super('Game');
    this.initializeGameState();
  }

  private initializeGameState() {
    this.gameState = {
      score: 0,
      health: 3,
      wave: 1,
      gameTime: 0,
      isGameOver: false
    };

    this.config = {
      maxHealth: 3,
      enemySpawnRate: 2000,
      innocentSpawnRate: 3000,
      enemyLifetime: 4000,
      innocentLifetime: 5000,
      waveProgressionRate: 30000
    };

    this.enemies = new Map();
    this.innocents = new Map();
    this.hearts = [];
  }

  create() {
    // Create tiled grass background
    this.background = this.add.tileSprite(0, 0, 1024, 768, 'grass');
    this.background.setOrigin(0, 0);

    // Create UI elements
    this.createUI();

    // Create jump scare overlay (initially hidden)
    this.jumpScareOverlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0);
    this.jumpScareOverlay.setDepth(1000);
    this.jumpScareSprite = this.add.sprite(512, 384, 'enemy-basic');
    this.jumpScareSprite.setVisible(false);
    this.jumpScareSprite.setDepth(1001);

    // Start game timers
    this.startGameTimers();

    // Enable input
    this.input.on('pointerdown', this.handleClick, this);
  }

  private createUI() {
    // Score display
    this.scoreText = this.add.text(20, 20, `Score: ${this.gameState.score}`, {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });

    // Wave display
    this.waveText = this.add.text(20, 60, `Wave: ${this.gameState.wave}`, {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });

    // Health hearts
    for (let i = 0; i < this.config.maxHealth; i++) {
      const heart = this.add.sprite(512 - 60 + (i * 40), 40, 'heart-full');
      heart.setScale(0.8);
      this.hearts.push(heart);
    }
  }

  private startGameTimers() {
    // Enemy spawn timer
    this.enemySpawnTimer = this.time.addEvent({
      delay: this.config.enemySpawnRate,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // Innocent spawn timer
    this.innocentSpawnTimer = this.time.addEvent({
      delay: this.config.innocentSpawnRate,
      callback: this.spawnInnocent,
      callbackScope: this,
      loop: true
    });

    // Game progression timer
    this.gameTimer = this.time.addEvent({
      delay: 100,
      callback: this.updateGame,
      callbackScope: this,
      loop: true
    });

    // Wave progression timer
    this.time.addEvent({
      delay: this.config.waveProgressionRate,
      callback: this.progressWave,
      callbackScope: this,
      loop: true
    });
  }

  private spawnEnemy() {
    if (this.gameState.isGameOver) return;

    const enemyId = `enemy_${Date.now()}_${Math.random()}`;
    const x = Phaser.Math.Between(50, 974);
    const y = Phaser.Math.Between(100, 668);
    
    // Determine enemy type based on wave
    let enemyType: 'basic' | 'armored' | 'healer' = 'basic';
    let armor = 0;
    
    if (this.gameState.wave >= 3) {
      const rand = Math.random();
      if (rand < 0.1) {
        enemyType = 'healer';
      } else if (rand < 0.4) {
        enemyType = 'armored';
        armor = Phaser.Math.Between(1, Math.min(5, Math.floor(this.gameState.wave / 2)));
      }
    }

    const enemy: Enemy = {
      id: enemyId,
      x,
      y,
      type: enemyType,
      armor,
      timeLeft: this.config.enemyLifetime,
      maxTime: this.config.enemyLifetime
    };

    const sprite = this.add.sprite(x, y, `enemy-${enemyType}`);
    sprite.setInteractive();
    sprite.setScale(0.8);
    
    // Add armor indicator if armored
    if (enemyType === 'armored' && armor > 0) {
      const armorText = this.add.text(x, y - 30, armor.toString(), {
        fontFamily: 'Arial Black',
        fontSize: 16,
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
      
      sprite.setData('armorText', armorText);
    }

    this.enemies.set(enemyId, { sprite, data: enemy });

    // Add spawn animation
    sprite.setScale(0);
    this.tweens.add({
      targets: sprite,
      scale: 0.8,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  private spawnInnocent() {
    if (this.gameState.isGameOver) return;

    const innocentId = `innocent_${Date.now()}_${Math.random()}`;
    const x = Phaser.Math.Between(50, 974);
    const y = Phaser.Math.Between(100, 668);

    const innocent: Innocent = {
      id: innocentId,
      x,
      y,
      timeLeft: this.config.innocentLifetime,
      maxTime: this.config.innocentLifetime
    };

    const sprite = this.add.sprite(x, y, 'innocent');
    sprite.setInteractive();
    sprite.setScale(0.8);

    this.innocents.set(innocentId, { sprite, data: innocent });

    // Add spawn animation
    sprite.setScale(0);
    this.tweens.add({
      targets: sprite,
      scale: 0.8,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  private handleClick(pointer: Phaser.Input.Pointer) {
    if (this.gameState.isGameOver) return;

    const clickedObjects = this.input.hitTestPointer(pointer);
    
    for (const obj of clickedObjects) {
      // Check if clicked on enemy
      for (const [enemyId, enemyData] of this.enemies.entries()) {
        if (enemyData.sprite === obj) {
          this.handleEnemyClick(enemyId);
          return;
        }
      }

      // Check if clicked on innocent
      for (const [innocentId, innocentData] of this.innocents.entries()) {
        if (innocentData.sprite === obj) {
          this.handleInnocentClick(innocentId);
          return;
        }
      }
    }
  }

  private handleEnemyClick(enemyId: string) {
    const enemyData = this.enemies.get(enemyId);
    if (!enemyData) return;

    const { sprite, data } = enemyData;

    if (data.type === 'armored' && data.armor > 0) {
      // Reduce armor
      data.armor--;
      data.timeLeft = data.maxTime; // Reset timer
      
      // Update armor display
      const armorText = sprite.getData('armorText') as Phaser.GameObjects.Text;
      if (armorText) {
        if (data.armor > 0) {
          armorText.setText(data.armor.toString());
        } else {
          armorText.destroy();
        }
      }

      // Stun animation
      this.tweens.add({
        targets: sprite,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      return;
    }

    // Kill enemy
    this.gameState.score++;
    
    if (data.type === 'healer') {
      this.gameState.health = Math.min(this.config.maxHealth, this.gameState.health + 1);
      this.updateHealthDisplay();
    }

    this.updateScoreDisplay();
    this.removeEnemy(enemyId);

    // Death animation
    this.tweens.add({
      targets: sprite,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => sprite.destroy()
    });
  }

  private handleInnocentClick(innocentId: string) {
    const innocentData = this.innocents.get(innocentId);
    if (!innocentData) return;

    const { sprite } = innocentData;

    // Penalty for killing innocent
    this.gameState.score = Math.max(0, this.gameState.score - 1);
    this.gameState.health--;

    this.updateScoreDisplay();
    this.updateHealthDisplay();
    this.removeInnocent(innocentId);

    // Death animation
    this.tweens.add({
      targets: sprite,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => sprite.destroy()
    });

    if (this.gameState.health <= 0) {
      this.gameOver();
    }
  }

  private updateGame() {
    if (this.gameState.isGameOver) return;

    this.gameState.gameTime += 100;

    // Update enemies
    for (const [enemyId, enemyData] of this.enemies.entries()) {
      enemyData.data.timeLeft -= 100;
      
      if (enemyData.data.timeLeft <= 0) {
        this.triggerJumpScare(enemyData.sprite);
        this.removeEnemy(enemyId);
        this.gameState.health--;
        this.updateHealthDisplay();
        
        if (this.gameState.health <= 0) {
          this.gameOver();
          return;
        }
      } else if (enemyData.data.timeLeft <= 1000) {
        // Warning animation when time is running out
        const alpha = Math.sin(this.gameState.gameTime / 100) * 0.5 + 0.5;
        enemyData.sprite.setAlpha(alpha);
      }
    }

    // Update innocents
    for (const [innocentId, innocentData] of this.innocents.entries()) {
      innocentData.data.timeLeft -= 100;
      
      if (innocentData.data.timeLeft <= 0) {
        this.removeInnocent(innocentId);
      }
    }
  }

  private triggerJumpScare(enemySprite: Phaser.GameObjects.Sprite) {
    this.jumpScareOverlay.setAlpha(0.8);
    this.jumpScareSprite.setVisible(true);
    this.jumpScareSprite.setTexture(enemySprite.texture.key);
    this.jumpScareSprite.setScale(0.8);

    this.tweens.add({
      targets: this.jumpScareSprite,
      scale: 3,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.jumpScareOverlay.setAlpha(0);
        this.jumpScareSprite.setVisible(false);
      }
    });
  }

  private progressWave() {
    if (this.gameState.isGameOver) return;

    this.gameState.wave++;
    this.updateWaveDisplay();

    // Increase difficulty
    const difficultyMultiplier = Math.max(0.3, 1 - (this.gameState.wave * 0.1));
    this.enemySpawnTimer.delay = this.config.enemySpawnRate * difficultyMultiplier;
    this.innocentSpawnTimer.delay = this.config.innocentSpawnRate * difficultyMultiplier;
  }

  private removeEnemy(enemyId: string) {
    const enemyData = this.enemies.get(enemyId);
    if (enemyData) {
      const armorText = enemyData.sprite.getData('armorText') as Phaser.GameObjects.Text;
      if (armorText) armorText.destroy();
      this.enemies.delete(enemyId);
    }
  }

  private removeInnocent(innocentId: string) {
    this.innocents.delete(innocentId);
  }

  private updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.gameState.score}`);
  }

  private updateWaveDisplay() {
    this.waveText.setText(`Wave: ${this.gameState.wave}`);
  }

  private updateHealthDisplay() {
    for (let i = 0; i < this.hearts.length; i++) {
      if (i < this.gameState.health) {
        this.hearts[i].setTexture('heart-full');
      } else {
        this.hearts[i].setTexture('heart-empty');
      }
    }
  }

  private async gameOver() {
    this.gameState.isGameOver = true;

    // Stop all timers
    this.enemySpawnTimer.destroy();
    this.innocentSpawnTimer.destroy();
    this.gameTimer.destroy();

    // Clear all sprites
    for (const [, enemyData] of this.enemies.entries()) {
      const armorText = enemyData.sprite.getData('armorText') as Phaser.GameObjects.Text;
      if (armorText) armorText.destroy();
      enemyData.sprite.destroy();
    }
    for (const [, innocentData] of this.innocents.entries()) {
      innocentData.sprite.destroy();
    }

    // Submit score to server
    try {
      const response = await fetch('/api/game-over', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: this.gameState.score })
      });
      
      if (response.ok) {
        const data = await response.json() as GameOverResponse;
        this.scene.start('GameOver', { 
          score: this.gameState.score, 
          rank: data.rank 
        });
      } else {
        this.scene.start('GameOver', { 
          score: this.gameState.score, 
          rank: -1 
        });
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      this.scene.start('GameOver', { 
        score: this.gameState.score, 
        rank: -1 
      });
    }
  }
}