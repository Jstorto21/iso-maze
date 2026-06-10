import { MAP } from '../config';
import { Tile } from './Tile';
import type { TileType } from '../types';

export class TileMap {
    readonly width: number;
    readonly height: number;
    private tiles: Tile[];

    constructor(width = MAP.width, height= MAP.height) {
        this.width = width;
        this.height = height;
        this.tiles = new Array(width * height);

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i] = new Tile('grass');
        }
    }
    private index(x: number, y: number): number {
        return y * this.width + x;
    }

    inBounds(x: number, y: number): boolean {
        return x>= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[this.index(x,y)];
    }

    setType(x: number, y: number, type: TileType): void {
        this.tiles[this.index(x, y)] = new Tile(type);
    }
}