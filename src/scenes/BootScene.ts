import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        this.load.image('tallgrass', 'assets/sprites/plants/grasses01.png');
        this.load.image('bush', 'assets/sprites/plants/bush01.png');
        this.load.image('tree', 'assets/sprites/plants/bigtree01.png');
        this.load.spritesheet('terrain', 'assets/tiles/grass_and_water.png', {
            frameWidth: 64,
            frameHeight: 64,
        }) ;

    }
    
    create(): void {
        this.scene.start('GameScene');
    }
}

