import { Injectable } from '@angular/core';
import { Stack } from '@app/classes/stack';
import { Difference } from '@app/interfaces/difference';
import { ImageComparisonReturnObject } from '@app/interfaces/image-comparison-return-object';
import { consts } from '@common/consts';

enum PixelColor {
    WHITE,
    BLACK,
    RED,
}

enum Direction {
    NONE,
    RIGHT = 4,
    LEFT = -4,
    UP = -consts.IMAGE_WIDTH * consts.PIXEL_SIZE,
    DOWN = consts.IMAGE_WIDTH * consts.PIXEL_SIZE,
}

@Injectable({
    providedIn: 'root',
})
export class ImageComparisonService {
    private imageDataDifference: Uint8ClampedArray;

    detectDifferences(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, radius: number): ImageComparisonReturnObject {
        const ctx1 = canvas1.getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = canvas2.getContext('2d') as CanvasRenderingContext2D;
        const groupsDifference: Difference[] = [];
        const stackDiff = new Stack();

        const imageData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
        const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

        this.imageDataDifference = new Uint8ClampedArray(imageData1.data.length);
        const MAX_PIXEL_VALUE = 255;

        // Puts a black pixel where there is a difference.
        for (let i = 0; i < imageData1.data.length; i += consts.PIXEL_SIZE) {
            if (
                imageData1.data[i] !== imageData2.data[i] ||
                imageData1.data[i + 1] !== imageData2.data[i + 1] ||
                imageData1.data[i + 2] !== imageData2.data[i + 2] ||
                imageData1.data[i + 3] !== imageData2.data[i + 3]
            ) {
                this.imageDataDifference[i] = 0;
                this.imageDataDifference[i + 1] = 0;
                this.imageDataDifference[i + 2] = 0;
                this.imageDataDifference[i + 3] = MAX_PIXEL_VALUE;
            }
        }
        // Borders become larger with the radius
        let e: number;
        let c: number;
        for (let i = 0; i < imageData1.data.length; i += consts.PIXEL_SIZE) {
            if (this.getPixelColor(i) === PixelColor.BLACK) {
                const directions = this.getDotCorner(i);
                if (directions[1] !== Direction.NONE) {
                    // If the second direction is not NONE, it means that it is a corner
                    for (e = 0; e <= radius; e++) {
                        // extend the border in red
                        for (c = 0; c <= radius; c++) {
                            if (e === 0 && c === 0) continue;
                            this.imageDataDifference[i + e * directions[0] + c * directions[1]] = MAX_PIXEL_VALUE;
                            this.imageDataDifference[i + e * directions[0] + c * directions[1] + 3] = MAX_PIXEL_VALUE;
                        }
                    }
                } else if (directions[0] !== Direction.NONE) {
                    // Check if it is a simple border
                    const scaleDirection = this.getDotBorder(i);
                    for (e = 1; e <= radius; e++) {
                        // extend the border in red
                        this.imageDataDifference[i + e * scaleDirection] = MAX_PIXEL_VALUE;
                        this.imageDataDifference[i + e * scaleDirection + 3] = MAX_PIXEL_VALUE;
                    }
                }
            }
        }
        // Regroup the errors
        let currentPos: number | undefined;
        const currentDiff: Difference = {
            points: [],
        };
        let totalPixelDiff = 0;
        const cloneImageDataDifference: Uint8ClampedArray = new Uint8ClampedArray(this.imageDataDifference);
        const N_PIXELS = 4;
        for (let i = 0; i < cloneImageDataDifference.length; i += N_PIXELS) {
            if (cloneImageDataDifference[i + 3] === MAX_PIXEL_VALUE) {
                stackDiff.push(i);

                while (!stackDiff.isEmpty()) {
                    currentPos = stackDiff.pop();
                    if (currentPos) {
                        this.imageDataDifference[currentPos] = 0; // puts the pixel in red to black
                        totalPixelDiff++;
                        cloneImageDataDifference[currentPos + 3] = 0;
                        this.getAllDirections().forEach((direction) => {
                            if (currentPos && cloneImageDataDifference[currentPos + direction + 3] === MAX_PIXEL_VALUE) {
                                stackDiff.push(currentPos + direction);
                            }
                        });
                        currentDiff.points.push(currentPos);
                    }
                }
                groupsDifference.push({
                    points: currentDiff.points,
                });
                currentDiff.points = [];
            }
        }
        const MAX_DIFF = 9;
        const EASY_DIFF_NUMBER = 7;
        const EASY_TRESHOLD = 0.15;
        const isValid = groupsDifference.length >= 3 && groupsDifference.length <= MAX_DIFF;
        const totalPixels = imageData1.data.length / consts.PIXEL_SIZE;
        const isEasy = groupsDifference.length < EASY_DIFF_NUMBER || totalPixelDiff / totalPixels >= EASY_TRESHOLD;

        const objectReturn: ImageComparisonReturnObject = {
            imageDiff: this.imageDataDifference,
            arrayDiff: groupsDifference,
            isValid,
            isEasy,
        };
        return objectReturn;
    }

    private getPixelColor(pos: number): PixelColor {
        const MAX_PIXEL_VALUE = 255;
        if (this.imageDataDifference[pos + 3] === 0) return PixelColor.WHITE;
        else if (this.imageDataDifference[pos + 3] === MAX_PIXEL_VALUE && this.imageDataDifference[pos] === 0) return PixelColor.BLACK;
        else return PixelColor.RED;
    }
    private getDotCorner(pos: number): Direction[] {
        const firstDirection = this.getDotBorder(pos);
        let secondDirection = Direction.NONE;
        if (firstDirection !== Direction.NONE) {
            secondDirection = this.getDotBorder(pos, firstDirection);
            if (secondDirection !== Direction.NONE) {
                return [firstDirection, secondDirection];
            }
        }
        return [firstDirection, secondDirection];
    }

    private getDotBorder(pos: number, directionToRemove: Direction = Direction.NONE): Direction {
        const directions = this.getAllDirections();
        for (const direction of directions) {
            if (direction !== directionToRemove) {
                if (this.getPixelColor(pos + direction) !== PixelColor.BLACK) return direction;
            }
        }
        return Direction.NONE;
    }
    private getAllDirections(): Direction[] {
        return [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];
    }
}
