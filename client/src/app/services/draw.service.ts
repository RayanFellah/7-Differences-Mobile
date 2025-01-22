import { Injectable } from '@angular/core';
import { consts } from '@common/consts';
import { Vec2 } from '@common/vec2';

@Injectable({
  providedIn: 'root',
})
export class DrawService {
  isDrawing: boolean = false;
  constructor() {
    window.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });
  }

  drawPencil(context: CanvasRenderingContext2D, currentPos: Vec2, lastPos: Vec2): void {
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(lastPos.x, lastPos.y);
    context.lineTo(currentPos.x, currentPos.y);
    context.stroke();
  }

  drawRectangle(context: CanvasRenderingContext2D, rectangle: { x: number, y: number, width: number, height: number }) {
    context.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
    context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }

  drawEraser(context: CanvasRenderingContext2D, currentPos: Vec2,) {
    context.clearRect(currentPos.x - context.lineWidth / 2, currentPos.y - context.lineWidth / 2, context.lineWidth, context.lineWidth);
  }

  drawEllipse(context: CanvasRenderingContext2D, roundRect: { x: number, y: number, width: number, height: number }) {
    context.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
    let x = roundRect.width > 0 ? roundRect.x + Math.abs(roundRect.width / 2) : roundRect.x - Math.abs(roundRect.width / 2);
    let y = roundRect.height > 0 ? roundRect.y + Math.abs(roundRect.height / 2) : roundRect.y - Math.abs(roundRect.height / 2);
    context.beginPath();
    console.log(roundRect.width + " width");
    console.log(roundRect.height + " height");
    console.log(x + " x");
    console.log(y + " y");
    //context.roundRect(roundRect.x, roundRect.y, roundRect.width, roundRect.height, [45, 45, 45, 45]);
    context.ellipse(x, y, Math.abs(roundRect.width / 2), Math.abs(roundRect.height / 2), 0, 0, 2 * Math.PI);
    context.fill();
  }


  drawAerosol(context: CanvasRenderingContext2D, data: { x: number, y: number, radius: number, density: number }): void {

    for (let i = 0; i < data.density; i++) {
      // Génération de coordonnées polaires aléatoires dans un cercle
      const angle = Math.random() * Math.PI * 2; // Angle aléatoire
      const distance = Math.random() * data.radius; // Distance aléatoire dans le cercle

      // Calcul des coordonnées cartésiennes à partir des coordonnées polaires
      const x = data.x + Math.cos(angle) * distance;
      const y = data.y + Math.sin(angle) * distance;

      // Dessin d'un pixel à ces coordonnées
      context.fillRect(x, y, 1, 1);
    }
  }

  drawSceau(context: CanvasRenderingContext2D, x: number, y: number) {
    const targetColor = this.getColorAtPixel(context, x, y);
    const fillColor = this.hexToRgb(context.fillStyle as string);
    const tolerance = 10;

    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const pixelsToCheck = [[x, y]];
    const visitedPixels = new Set<string>();

    while (pixelsToCheck.length) {
      const [currentX, currentY] = pixelsToCheck.pop() as [number, number];
      const pixelKey = `${currentX},${currentY}`;
      if (visitedPixels.has(pixelKey)) continue;
      visitedPixels.add(pixelKey);

      if (this.isSameColor(targetColor, this.getColorAtPixel(context, currentX, currentY), tolerance)) {
        this.setPixel(imageData, context.canvas.width, currentX, currentY, fillColor);

        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const nextX = currentX + dx;
          const nextY = currentY + dy;
          const nextPixelKey = `${nextX},${nextY}`;
          if (!visitedPixels.has(nextPixelKey) && nextX >= 0 && nextX < context.canvas.width && nextY >= 0 && nextY < context.canvas.height) {
            pixelsToCheck.push([nextX, nextY]);
          }
        });
      }
    }
    context.putImageData(imageData, 0, 0);
  }


  getColorAtPixel(context: CanvasRenderingContext2D, x: number, y: number): Color {
    const pixelData = context.getImageData(x, y, 1, 1).data;
    return new Color(pixelData[0], pixelData[1], pixelData[2], pixelData[3]);
  }

  isSameColor(color1: Color, color2: Color, tolerance: number): boolean {
    // Convert colors to RGB
    const deltaR = Math.abs(color1.r - color2.r);
    const deltaG = Math.abs(color1.g - color2.g);
    const deltaB = Math.abs(color1.b - color2.b);
    const deltaA = Math.abs(color1.a - color2.a);
    return deltaR + deltaG + deltaB+ deltaA <= tolerance;
  }

  hexToRgb(hex: string): Color {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return new Color(r, g, b);
  }

  setPixel(imageData: ImageData, width: number, x: number, y: number, color: Color) {
    const index = (y * width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = 255; //Alpha
  }
}

class Color {
  r: number;
  g: number;
  b: number;
  a: number = 255;
  constructor(r: number, g: number, b: number, a: number = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
