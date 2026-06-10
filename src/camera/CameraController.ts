import Phaser from 'phaser';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export class CameraController {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;

    scene.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _over: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
      ) => {
        const direction = deltaY > 0 ? -1 : 1;
        const newZoom = this.camera.zoom + direction * ZOOM_STEP;
        this.camera.zoom = Phaser.Math.Clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
      },
    );
  }
}