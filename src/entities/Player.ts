import Phaser from "phaser";
import { screenToTile } from "../world/IsoMath";
import { TileMap } from "../world/TileMap";

const MOVE_SPEED = 200; 
const MARKER_Y_OFFSET = -44;

export class Player {
    x: number;
    y: number;
    private marker: Phaser.GameObjects.Arc;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private tileMap: TileMap;

    constructor(scene: Phaser.Scene, tileMap: TileMap, x: number, y: number) {
        this.tileMap = tileMap;
        this.x = x;
        this.y = y;
        this.marker = scene.add.circle(x, y, 10, 0xff3333).setDepth(500);
        this.cursors = scene.input.keyboard!.createCursorKeys();
    }

    update(delta: number): void {
        const dist = MOVE_SPEED * (delta / 1000);
        let dx = 0;
        let dy = 0;
        if (this.cursors.left.isDown) dx -= dist;
        if (this.cursors.right.isDown) dx += dist;
        if (this.cursors.up.isDown) dy -= dist;
        if (this.cursors.down.isDown) dy += dist;

        if (this.canWalk(this.x + dx, this.y)) {
            this.x += dx;
        }
        if (this.canWalk(this.x, this.y + dy)) {
            this.y += dy;
        }

        this.marker.setPosition(this.x, this.y + MARKER_Y_OFFSET);
        const t = screenToTile(this.x, this.y);
        this.marker.setDepth(t.x + t.y);
    }

    private canWalk(worldX: number, worldY: number): boolean {
        const t = screenToTile(worldX, worldY);
        const tileX = Math.floor(t.x);
        const tileY = Math.floor(t.y);
        if (!this.tileMap.inBounds(tileX, tileY)) {
            return false;
        }
        return this.tileMap.getTile(tileX, tileY).walkable;
    }
}
