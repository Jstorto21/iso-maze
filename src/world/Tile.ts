import type { TileType } from '../types';

export class Tile {
    type: TileType;
    walkable: boolean;
    buildable: boolean;
    visited = false;

    constructor(type: TileType) {
        this.type = type;

        const isWater = type === 'water_shallow' || type === 'water_deep';
        this.walkable = !isWater;
        this.buildable = type === 'grass' || type === 'dirt';

    }
}