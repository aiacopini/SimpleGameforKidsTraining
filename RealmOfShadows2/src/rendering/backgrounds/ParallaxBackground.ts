import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/game';

export interface ParallaxLayer {
  depth: number;  // 0=farthest, 1=foreground
  draw: (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, width: number, height: number) => void;
}

export class ParallaxBackground {
  layers: ParallaxLayer[] = [];

  addLayer(layer: ParallaxLayer) {
    this.layers.push(layer);
    this.layers.sort((a, b) => a.depth - b.depth); // far layers first
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    for (const layer of this.layers) {
      const offsetX = cameraX * layer.depth;
      const offsetY = cameraY * layer.depth * 0.3;
      layer.draw(ctx, offsetX, offsetY, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }
}
