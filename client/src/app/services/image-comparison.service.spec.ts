import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageComparisonService } from './image-comparison.service';

import { Component } from '@angular/core';

describe('ImageComparisonService', () => {
    let fixture: ComponentFixture<TestComponent>;
    let service: ImageComparisonService;
    let canvas0DiffRef: HTMLCanvasElement;
    let canvas2DiffRef: HTMLCanvasElement;
    let canvas7DiffRef: HTMLCanvasElement;
    let canvas12DiffRef: HTMLCanvasElement;
    const imagePath0Diff = '../../assets/image_tests/image_0_diff.bmp';
    const imagePath2Diff = '../../assets/image_tests/image_2_diff.bmp';
    const imagePath7Diff = '../../assets/image_tests/image_7_diff.bmp';
    const imagePath12Diff = '../../assets/image_tests/image_12_diff.bmp';

    async function loadImage(canvas: HTMLCanvasElement, imagePath: string): Promise<HTMLCanvasElement> {
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const img = new Image() as HTMLImageElement;
        img.src = imagePath;

        return new Promise((resolve) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
        });
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [ImageComparisonService],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        service = TestBed.inject(ImageComparisonService);
        const canvas1: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas1');
        canvas2DiffRef = await loadImage(canvas1, imagePath2Diff);
        const canvas2: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas2');
        canvas7DiffRef = await loadImage(canvas2, imagePath7Diff);
        const canvas3: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas3');
        canvas12DiffRef = await loadImage(canvas3, imagePath12Diff);
        const canvas4: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas4');
        canvas0DiffRef = await loadImage(canvas4, imagePath0Diff);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('should compare canvas images', () => {
        const result = service.detectDifferences(canvas2DiffRef, canvas7DiffRef, 0);
        expect(result).toBeTruthy();
    });
    it('should return 0 diff when images are the same', () => {
        const result = service.detectDifferences(canvas2DiffRef, canvas2DiffRef, 0);
        expect(result.arrayDiff.length).toBe(0);
    });
    it('should return 7 diff when radius is 3 or less for images 2Diff and 7Diff', () => {
        const nDiffs = 7;
        const result = service.detectDifferences(canvas2DiffRef, canvas7DiffRef, 3);
        expect(result.arrayDiff.length).toBe(nDiffs);
    });
    it('should return 6 diff when radius is 9 or more for images 2Diff and 7Diff', () => {
        const nDiffs = 6;
        const radius = 9;
        const result = service.detectDifferences(canvas2DiffRef, canvas7DiffRef, radius);
        expect(result.arrayDiff.length).toBe(nDiffs);
    });
    it('isEasy should be false for images 0Diff and 7Diff.', () => {
        const result = service.detectDifferences(canvas0DiffRef, canvas7DiffRef, 0);
        expect(result.isEasy).toBeFalsy();
    });
    it('isEasy should be true with 6 diffs for images 2Diff and 7Diff.', () => {
        const radius = 9;
        const result = service.detectDifferences(canvas2DiffRef, canvas7DiffRef, radius);
        expect(result.isEasy).toBeTruthy();
    });
    it('isValid should be true for images 2Diff and 7Diff', () => {
        const result = service.detectDifferences(canvas2DiffRef, canvas7DiffRef, 0);
        expect(result.isValid).toBeTruthy();
    });
    it('isValid should be false for images 2Diff and 12Diff', () => {
        const result = service.detectDifferences(canvas2DiffRef, canvas12DiffRef, 0);
        expect(result.isValid).toBeFalsy();
    });
});

@Component({
    template: `
        <canvas class="canvas1" width="640" height="480"></canvas>
        <canvas class="canvas2" width="640" height="480"></canvas>
        <canvas class="canvas3" width="640" height="480"></canvas>
        <canvas class="canvas4" width="640" height="480"></canvas>
    `,
})
class TestComponent {
}

