import type { TileType } from './types';

export const TILE_COLORS: Record<TileType, number> = {
  grass: 0x4a7c3a,
  dirt: 0x8a6d3b,
  sand: 0xd9c27a,
  water_shallow: 0x4a90b8,
  water_deep: 0x2a5a8a,
};


export const TILE = {
    width: 64,
    height: 32,
} as const;

export const MAP = {
    width: 256,
    height: 256,
} as const;

export const GAME = {
    backgroundColor: '#1a1a2e',
} as const;

