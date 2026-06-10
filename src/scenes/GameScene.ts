import Phaser from 'phaser';
import { TILE, MAP } from '../config';
import { tileToScreen, screenToTile} from '../world/IsoMath';
import { CameraController } from '../camera/CameraController';
import { TileMap } from '../world/TileMap';
import type { TileType } from '../types';
import { Player } from '../entities/Player';
import { makeRng } from '../world/Rng';

const CULL_MARGIN = 2;

const TILE_FRAMES: Record<TileType, number> = {
  grass: 0,
  dirt: 0,
  sand: 0,
  water_shallow: 23,
  water_deep: 23,
}

const DECORATIONS = {
  tree: { key: 'tree', scale: 1, originX: 0.56, originY: 0.95, solid: true },
  bush: { key: 'bush', scale: 0.5, originX: 0.5, originY: 0.5, solid: false},
  tallgrass: { key: 'tallgrass', scale: 0.6, originX: 0.5, originY: 0.8, solid: false}
} as const;

type DecorationType = keyof typeof DECORATIONS;

const LEVEL_SEED = 1337;
const SCATTER_DENSITY = 0.15;
const SPAWN_X = 115;
const SPAWN_Y = 115;
const SPAWN_CLEAR_RADIUS = 3;
const MATTED_TINT = 0xc0a060;

export class GameScene extends Phaser.Scene {
  private highlight!: Phaser.GameObjects.Graphics;
  private fpsText!: Phaser.GameObjects.Text;
  private lastRange = { minX: -1, minY: -1, maxX: -1, maxY: -1};
  private tileMap = new TileMap();
  private tileSprites: Phaser.GameObjects.Image[] = [];
  private player!: Player;
  private decorations = new Map<number, DecorationType>();
  private decoSprites: Phaser.GameObjects.Image[] = [];
  private visTiles = 0;
  private visDeco = 0;

  constructor() {
    super('GameScene');
  }


  create(): void {
    this.authorMap();
    this.highlight = this.add.graphics().setDepth(1000);

    new CameraController(this);

    const start = tileToScreen(SPAWN_X, SPAWN_Y);
    this.player = new Player(this, this.tileMap, start.x, start.y);
    this.cameras.main.centerOn(start.x, start.y);

   
    this.scatterDecorations(LEVEL_SEED);
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const tile = screenToTile(pointer.worldX, pointer.worldY);
      this.drawHighlight(Math.floor(tile.x), Math.floor(tile.y));
    });

    this.fpsText = this.add
      .text(8, 8, '', {fontFamily: 'monospace', fontSize: '14px', color: '#00ff00'})
      .setDepth(1000);
    
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this.markVisited(this.player.x, this.player.y);
    this.drawVisibileTiles();


    const cam = this.cameras.main;
    const corner = cam.getWorldPoint(8,8);
    this.fpsText.setScale(1 / cam.zoom);
    this.fpsText.setPosition(corner.x, corner.y);
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)} Zoom: ${cam.zoom.toFixed(2)} Tile: ${this.visTiles} Deco: ${this.visDeco}`);
  }

  private markVisited(worldX: number, worldY: number): void {
    const t = screenToTile(worldX, worldY);
    const tileX = Math.floor(t.x);
    const tileY = Math.floor(t.y);
    if (!this.tileMap.inBounds(tileX, tileY)) {
      return;
    }
    const tile = this.tileMap.getTile(tileX, tileY);
    if (!tile.visited) {
      tile.visited = true;
      this.lastRange = {minX: -1, minY: -1, maxX: -1, maxY: -1};
    }
  }

  private drawVisibileTiles(): void {
    const view = this.cameras.main.worldView;

    const corners = [
      screenToTile(view.x, view.y),
      screenToTile(view.right, view.y),
      screenToTile(view.x, view.bottom),
      screenToTile(view.right, view.bottom),
    ];
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);

    const minX = Math.max(0, Math.floor(Math.min(...xs)) - CULL_MARGIN);
    const maxX = Math.min(MAP.width - 1, Math.ceil(Math.max(...xs)) + CULL_MARGIN);
    const minY = Math.max(0, Math.floor(Math.min(...ys)) - CULL_MARGIN);
    const maxY = Math.min(MAP.height - 1, Math.ceil(Math.max(...ys)) + CULL_MARGIN);

    const r = this.lastRange;
    if (minX === r.minX && minY === r.minY && maxX === r.maxX && maxY === r.maxY) {
      return;
    }
    this.lastRange = { minX, minY, maxX, maxY };

    let i = 0;
    let d = 0;
    for (let tileY = minY; tileY <= maxY; tileY++) {
      for (let tileX = minX; tileX <= maxX; tileX++) {
        const tile = this.tileMap.getTile(tileX, tileY);
        const p = tileToScreen(tileX, tileY);
        
        let img = this.tileSprites[i];
        if (!img) {
            img = this.add.image(0, 0, 'terrain', 0).setOrigin(0.5, 0.75);
            this.tileSprites[i] = img;
        }
        img.setPosition(p.x, p.y);
        img.setFrame(TILE_FRAMES[tile.type]);
        if (tile.visited && tile.type === 'grass') {
          img.setTint(MATTED_TINT);
        } else {
          img.clearTint();
        }
        img.setVisible(true);
        i++;

        const deco = this.decorations.get(tileY * MAP.width + tileX);
        if (deco) {
          const cfg = DECORATIONS[deco];
          let dimg = this.decoSprites[d];
          if (!dimg) {
            dimg = this.add.image(0, 0, cfg.key);
            this.decoSprites[d] = dimg;
          }
          dimg.setTexture(cfg.key)
            .setPosition(p.x, p.y)
            .setOrigin(cfg.originX, cfg.originY)
            .setScale(cfg.scale)
            .setDepth(tileX + tileY)
            .setVisible(true);
          d++;
        }
      }
    }
    this.visTiles = i;
    this.visDeco = d;
    for (; i < this.tileSprites.length; i++) {
      this.tileSprites[i].setVisible(false);
    }
    for (; d < this.decoSprites.length; d++) {
      this.decoSprites[d].setVisible(false);
    }
  }



  private authorMap(): void {
    const map = this.tileMap;

    for (let x = 105; x < 155; x++) {
      map.setType(x, 125, 'dirt');
      map.setType(x, 126, 'dirt');
    }

    for (let y = 100; y < 160; y++) {
      map.setType(128, y, 'sand');
      map.setType(129, y, 'water_shallow');
      map.setType(130, y, 'water_deep');
      map.setType(131, y, 'water_deep');
      map.setType(132, y, 'water_shallow');
      map.setType(133, y, 'sand');
    }
  }

  private drawHighlight(tileX: number, tileY: number): void {
    const halfW = TILE.width / 2;
    const halfH = TILE.height / 2;
    const center = tileToScreen(tileX, tileY);

    this.highlight.clear();
    this.highlight.fillStyle(0xffff00, 0.35);
    this.highlight.beginPath();
    this.highlight.moveTo(center.x, center.y - halfH);
    this.highlight.lineTo(center.x + halfW, center.y);
    this.highlight.lineTo(center.x, center.y + halfH);
    this.highlight.lineTo(center.x - halfW, center.y);
    this.highlight.closePath();
    this.highlight.fillPath();
  }

  private placeDecoration(type: DecorationType, tileX: number, tileY: number): void {
    this.decorations.set(tileY * MAP.width + tileX, type);
    if (DECORATIONS[type].solid) {
      this.tileMap.getTile(tileX, tileY).walkable = false;
    }

  }

  private scatterDecorations(seed: number): void {
    const rng = makeRng(seed);

    for (let tileY = 0; tileY < MAP.height; tileY++) {
      for (let tileX = 0; tileX < MAP.width; tileX++) {
        const tile = this.tileMap.getTile(tileX, tileY);
        if (tile.type !== 'grass') {
          continue;
        }

        const nearSpawn = 
          Math.abs(tileX - SPAWN_X) <= SPAWN_CLEAR_RADIUS &&
          Math.abs(tileY - SPAWN_Y) <= SPAWN_CLEAR_RADIUS;
        if (nearSpawn) {
          continue;
        }

        if (rng() > SCATTER_DENSITY) {
          continue
        }

        const roll = rng();
        let type: DecorationType;
        if (roll < 0.15) {
          type = 'tree';
        } else if (roll < 0.45) {
          type = 'bush';
        } else {
          type = 'tallgrass';
        }
        this.placeDecoration(type, tileX, tileY);
      }
    }
  }
}
