import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Difference } from '@app/interfaces/difference';
import { consts } from '@common/consts';
import { ImageComparisonService } from './image-comparison.service';

import { ImageUpdateService } from './image-update.service';

describe('ImageUpdateService', () => {
    let fixture: ComponentFixture<TestComponent>;
    let service: ImageUpdateService;
    let imageDetectionService: ImageComparisonService;
    let canvas2DiffRef: ElementRef<HTMLCanvasElement>;
    let canvas7DiffRef: ElementRef<HTMLCanvasElement>;
    let img1: ImageBitmap;
    let img2: ImageBitmap;
    const imagePath2Diff = '../../assets/image_tests/image_2_diff.bmp';
    const imagePath7Diff = '../../assets/image_tests/image_7_diff.bmp';

    const loadImage = async (canvas: HTMLCanvasElement, imagePath: string): Promise<ElementRef<HTMLCanvasElement>> => {
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const img = new Image() as HTMLImageElement;
        img.src = imagePath;
        return new Promise((resolve) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                resolve(new ElementRef<HTMLCanvasElement>(canvas));
            };
        });
    };

    const getImageBitMap = async (src: string): Promise<ImageBitmap> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = src;
            image.onload = () => {
                createImageBitmap(image)
                    .then((btmp) => {
                        resolve(btmp);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            };
            image.onerror = (err) => {
                reject(err);
            };
        });
    };

    let differences: Difference[];

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [ImageUpdateService, ImageComparisonService],
        }).compileComponents();
        fixture = TestBed.createComponent(TestComponent);
        service = TestBed.inject(ImageUpdateService);
        imageDetectionService = TestBed.inject(ImageComparisonService);
        const canvas1: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas1');
        const canvas2: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas2');
        canvas2DiffRef = await loadImage(canvas1, imagePath2Diff);
        canvas7DiffRef = await loadImage(canvas2, imagePath7Diff);
        img1 = (await getImageBitMap(imagePath2Diff)) as ImageBitmap;
        img2 = (await getImageBitMap(imagePath7Diff)) as ImageBitmap;
        differences = imageDetectionService.detectDifferences(canvas2DiffRef.nativeElement, canvas7DiffRef.nativeElement, consts.DEFAULT_RADIUS).arrayDiff;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('updateImage should update the image', () => {
        const result = service.updateImage(differences, canvas2DiffRef, canvas7DiffRef, img1, img2);
        expect(result).toBeTruthy();
    });

    it('update image should return an object of 2 canvas', () => {
        const result = service.updateImage(differences, canvas2DiffRef, canvas7DiffRef, img1, img2);
        expect(result.c1).toBeTruthy();
        expect(result.c2).toBeTruthy();
    });

    it('should update the data', () => {
        const difference = differences[0];
        const ctx1 = canvas2DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = canvas7DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const data1: ImageData = ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        let data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const data2Original: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        data2 = service.updateData(difference, data1, data2);
        expect(data2).toBeTruthy();
        expect(data2Original.data).not.toEqual(data2.data);
    });

    it('should put data1 to data2 in differences area', () => {
        const difference = differences[0];
        const point = difference.points[0]; // test for the first point
        const base = Math.floor(point / consts.PIXEL_SIZE);
        const y = Math.floor(base / consts.IMAGE_WIDTH);
        const x = base - consts.IMAGE_WIDTH * y;
        const index = consts.PIXEL_SIZE * (consts.IMAGE_WIDTH * y + x);

        const ctx1 = canvas2DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = canvas7DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const data1: ImageData = ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        let data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        data2 = service.updateData(difference, data1, data2);
        expect(data2.data[index]).toEqual(data1.data[index]);
        expect(data2.data[index + 1]).toEqual(data1.data[index + 1]);
        expect(data2.data[index + 2]).toEqual(data1.data[index + 2]);
        expect(data2.data[index + 3]).toEqual(data1.data[index + 3]);
    });
});

@Component({
    template: `
        <canvas class="canvas1" width="640" height="480"></canvas>
        <canvas class="canvas2" width="640" height="480"></canvas>
    `,
})
class TestComponent {}
