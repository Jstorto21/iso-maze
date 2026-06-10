import { TILE } from '../config';

const HALF_W = TILE.width / 2;
const HALF_H = TILE.height /2;

export interface ScreenPoint {
    x: number; 
    y: number;
}

export interface TilePoint { 
    x: number;
    y: number;
}

export function tileToScreen( tileX: number, tileY: number): ScreenPoint {
   return {
        x: (tileX - tileY) * HALF_W,
        y: (tileX + tileY) * HALF_H,
    };

}

export function screenToTile (screenX: number, screenY: number): TilePoint {
    return{
        x: (screenX / HALF_W + screenY / HALF_H) / 2,
        y: (screenY / HALF_H - screenX / HALF_W) / 2,
    };
}