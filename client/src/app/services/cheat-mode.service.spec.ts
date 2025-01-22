import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Difference } from '@app/interfaces/difference';
import { consts } from '@common/consts';
import { BlinkerService } from './blinker.service';
import { CheatModeService } from './cheat-mode.service';
import { ImageComparisonService } from './image-comparison.service';

describe('CheatModeService', () => {
    let service: CheatModeService;
    let fixture: ComponentFixture<TestComponent>;
    let blinkerService: BlinkerService;
    let imageComparisonService: ImageComparisonService;
    let canvas0DiffRef: ElementRef<HTMLCanvasElement>;
    let canvas2DiffRef: ElementRef<HTMLCanvasElement>;
    const imagePath0Diff = '../../assets/image_tests/image_0_diff.bmp';
    const imagePath2Diff = '../../assets/image_tests/image_2_diff.bmp';

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

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [CheatModeService, BlinkerService, ImageComparisonService],
        });
        service = TestBed.inject(CheatModeService);
        fixture = TestBed.createComponent(TestComponent);
        blinkerService = TestBed.inject(BlinkerService);
        imageComparisonService = TestBed.inject(ImageComparisonService);

        const canvas1: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas1');
        const canvas2: HTMLCanvasElement = fixture.debugElement.nativeElement.querySelector('.canvas2');
        canvas0DiffRef = await loadImage(canvas1, imagePath0Diff);
        canvas2DiffRef = await loadImage(canvas2, imagePath2Diff);
        service.canvas1 = canvas0DiffRef;
        service.canvas2 = canvas2DiffRef;
        service.ctx1 = canvas0DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        service.ctx2 = canvas2DiffRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        service.original1 = service.ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.original2 = service.ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        service.differenceArray = imageComparisonService.detectDifferences(canvas0DiffRef.nativeElement, canvas2DiffRef.nativeElement, consts.DEFAULT_RADIUS).arrayDiff as Difference[];
        blinkerService.init(canvas0DiffRef, canvas2DiffRef);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('stopBlink should clear the interval', () => {
        service.stopBlink();
        expect(clearInterval).toHaveBeenCalled();
    });

    describe('init', () => {

        it('should subscribe to blinkerService.canvas1', () => {
            const subscribeSpy = spyOn(blinkerService.canvas1, 'subscribe');
            service.init();
            expect(subscribeSpy).toHaveBeenCalled();
        });

        it('should subscribe to blinkerService.canvas2', () => {
            const subscribeSpy = spyOn(blinkerService.canvas2, 'subscribe');
            service.init();
            expect(subscribeSpy).toHaveBeenCalled();
        });
    });
    it('startBlink should call flashPixels', fakeAsync(() => {
        const flashPixelsSpy = spyOn(blinkerService, 'flashPixels');
        service.startBlink();
        tick(1000);
        expect(flashPixelsSpy).toHaveBeenCalled();
        service.stopBlink();
        discardPeriodicTasks();
    }));
    it('should call blinkPixel 8 times in a second', fakeAsync(() => {
        const flashPixelSpy = spyOn(blinkerService, 'flashPixels');
        service.startBlink();
        tick(1000);
        expect(flashPixelSpy).toHaveBeenCalledTimes(8);
        discardPeriodicTasks();
    }));
});

@Component({
    template: `
    <canvas class="canvas1" width="640" height="480"></canvas>
    <canvas class="canvas2" width="640" height="480"></canvas>
`,
})
class TestComponent {}
