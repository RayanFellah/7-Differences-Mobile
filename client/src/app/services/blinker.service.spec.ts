import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Difference } from '@app/interfaces/difference';
import { consts } from '@common/consts';
import { BehaviorSubject } from 'rxjs';
import { BlinkerService } from './blinker.service';
import { ImageComparisonService } from './image-comparison.service';

describe('BlinkerService', () => {
    let fixture: ComponentFixture<TestComponent>;
    let service: BlinkerService;
    let imageDetectionService: ImageComparisonService;
    let ctx1: CanvasRenderingContext2D;
    let ctx2: CanvasRenderingContext2D;
    let canvas2DiffRef: ElementRef<HTMLCanvasElement>;
    let canvas7DiffRef: ElementRef<HTMLCanvasElement>;
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

    let differences: Difference[];

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [BlinkerService, ImageComparisonService],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        service = TestBed.inject(BlinkerService);
        imageDetectionService = TestBed.inject(ImageComparisonService);
        const canvas1: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas1');
        const canvas2: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas2');
        canvas2DiffRef = await loadImage(canvas1, imagePath2Diff);
        canvas7DiffRef = await loadImage(canvas2, imagePath7Diff);
        differences = imageDetectionService.detectDifferences(canvas2DiffRef.nativeElement, canvas7DiffRef.nativeElement, consts.DEFAULT_RADIUS).arrayDiff;
        differences.length = 1;

        service.init(canvas2DiffRef, canvas7DiffRef);

        ctx1 = canvas2DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        ctx2 = canvas7DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('init should set all properties', () => {
        service.init(canvas2DiffRef, canvas7DiffRef);
        expect(service.canvas1).toEqual(new BehaviorSubject<ElementRef<HTMLCanvasElement>>(canvas2DiffRef));
        expect(service.canvas2).toEqual(new BehaviorSubject<ElementRef<HTMLCanvasElement>>(canvas7DiffRef));
        expect(service.c1).toEqual(service.canvas1.value);
        expect(service.c2).toEqual(service.canvas2.value);
        expect(service.isBlinking).toEqual(new BehaviorSubject<boolean>(false));
    });

    it('should blink pixels 10 times', fakeAsync(() => {
        const flashPixelSpy = spyOn(service, 'flashPixels');

        service.blinkPixels(differences, ctx1, ctx2);
        tick(2000);
        expect(flashPixelSpy).toHaveBeenCalledTimes(10);
        discardPeriodicTasks();
    }));

    it('should clear the interval after 10 times', fakeAsync(() => {
        service.blinkPixels(differences, ctx1, ctx2);
        tick(2000);
        expect(clearInterval).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should toggle flash state every blink', fakeAsync(() => {
        spyOn(service, 'flashPixels');
        const original1: ImageData | undefined = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const original2: ImageData | undefined = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.blinkPixels(differences, ctx1, ctx2);

        tick(200); // Wait for blink
        expect(service.flashPixels).toHaveBeenCalledWith(differences[0], original1, original2, ctx1, ctx2, true);

        tick(200); // Wait for blink

        expect(service.flashPixels).toHaveBeenCalledWith(differences[0], original1, original2, ctx1, ctx2, false);
        discardPeriodicTasks();
    }));

    it('should call canvas methods', () => {
        const imageData1Spy = spyOn(ctx1, 'getImageData').and.callThrough();
        const imageData2Spy = spyOn(ctx2, 'getImageData').and.callThrough();
        const original1: ImageData | null = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const original2: ImageData | null = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.flashPixels(differences[0], original1, original2, ctx1, ctx2, true);
        expect(imageData1Spy).toHaveBeenCalled();
        expect(imageData2Spy).toHaveBeenCalled();
    });

    it('should not update canvas if ctx1 is null', fakeAsync(() => {
        const data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.blinkPixels(differences, null, ctx2);
        expect(() => {
            data2.data[0] = 0;
            discardPeriodicTasks();
        }).not.toThrow();
    }));

    it('should not update canvas if ctx2 is null', fakeAsync(() => {
        const data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.blinkPixels(differences, ctx1, null);
        expect(() => {
            data2.data[0] = 0;
            discardPeriodicTasks();
        }).not.toThrow();
    }));

    it('should set differences in green in flash is true', () => {
        const point = differences[0].points[0];
        const base = Math.floor(point / consts.PIXEL_SIZE);
        const y = Math.floor(base / consts.IMAGE_WIDTH);
        const x = base - consts.IMAGE_WIDTH * y;
        const N_PIXELS = 4;
        const index = N_PIXELS * (consts.IMAGE_WIDTH * y + x);
        const original1: ImageData | null = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const original2: ImageData | null = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.flashPixels(differences[0], original1, original2, ctx1, ctx2, true);
        const after1: ImageData | null = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const after2: ImageData | null = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

        expect(after1?.data[index + 1]).toEqual(255);
        expect(after1?.data[index + 2]).toEqual(0);
        expect(after1?.data[index + 3]).toEqual(255);
        expect(after2?.data[index + 1]).toEqual(255);
        expect(after2?.data[index + 2]).toEqual(0);
        expect(after2?.data[index + 3]).toEqual(255);
    });

    it('should set differences back to original color if flash is false', () => {
        const point = differences[0].points[0];
        const base = Math.floor(point / consts.PIXEL_SIZE);
        const y = Math.floor(base / consts.IMAGE_WIDTH);
        const x = base - consts.IMAGE_WIDTH * y;
        const N_PIXELS = 4;
        const index = N_PIXELS * (consts.IMAGE_WIDTH * y + x);
        const original1: ImageData | null = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const original2: ImageData | null = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.flashPixels(differences[0], original1, original2, ctx1, ctx2, false);
        const after1: ImageData | null = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const after2: ImageData | null = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

        expect(after1?.data[index + 1]).toEqual(original1?.data[index + 1]);
        expect(after1?.data[index + 2]).toEqual(original1?.data[index + 2]);
        expect(after1?.data[index + 3]).toEqual(original1?.data[index + 3]);
        expect(after2?.data[index + 1]).toEqual(original2?.data[index + 1]);
        expect(after2?.data[index + 2]).toEqual(original2?.data[index + 2]);
        expect(after2?.data[index + 3]).toEqual(original2?.data[index + 3]);
    });
});

@Component({
    template: `
        <canvas class="canvas1" width="640" height="480"></canvas>
        <canvas class="canvas2" width="640" height="480"></canvas>
    `,
})
class TestComponent {}
