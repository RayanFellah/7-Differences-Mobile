import { ElementRef, Injectable } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { consts } from '@common/consts';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class BlinkerService {
    canvas1: BehaviorSubject<ElementRef<HTMLCanvasElement>>;
    canvas2: BehaviorSubject<ElementRef<HTMLCanvasElement>>;
    isBlinking: Subject<boolean>;
    c1: ElementRef<HTMLCanvasElement>;
    c2: ElementRef<HTMLCanvasElement>;
    clearAllBlink: Subject<boolean> = new Subject<boolean>();
    init(cnv1: ElementRef<HTMLCanvasElement>, cnv2: ElementRef<HTMLCanvasElement>) {
        this.canvas1 = new BehaviorSubject<ElementRef<HTMLCanvasElement>>(cnv1);
        this.canvas2 = new BehaviorSubject<ElementRef<HTMLCanvasElement>>(cnv2);
        this.isBlinking = new BehaviorSubject<boolean>(false);
        this.c1 = this.canvas1.value;
        this.c2 = this.canvas2.value;
    }

    flashPixels(
        difference: Difference | undefined,
        original1: ImageData | undefined,
        original2: ImageData | undefined,
        ctx1: CanvasRenderingContext2D | null,
        ctx2: CanvasRenderingContext2D | null,
        flash: boolean,
    ) {
        if (difference) {
            if (ctx1 && ctx2 && flash) {
                const data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                const data1: ImageData = ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

                for (const point of difference.points) {
                    const base = Math.floor(point / consts.PIXEL_SIZE);
                    const y = Math.floor(base / consts.IMAGE_WIDTH);
                    const x = base - consts.IMAGE_WIDTH * y;
                    const N_PIXELS = 4;
                    const index = N_PIXELS * (consts.IMAGE_WIDTH * y + x);
                    data1.data[index] = data2.data[index] = 0;
                    data1.data[index + 1] = data2.data[index + 1] = 255;
                    data1.data[index + 2] = data2.data[index + 2] = 0;
                    data1.data[index + 3] = data2.data[index + 3] = 255;
                }
                const canvasCtx1 = this.c1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                const canvasCtx2 = this.c2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                canvasCtx1.putImageData(data1, 0, 0);
                canvasCtx2.putImageData(data2, 0, 0);
                this.canvas1.next(this.c1);
                this.canvas2.next(this.c2);
            } else if (ctx1 && original1 && original2 && ctx2 && !flash) {
                const data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                const data1: ImageData = ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

                for (const point of difference.points) {
                    const N_PIXELS = 4;
                    const base = Math.floor(point / N_PIXELS);
                    const y = Math.floor(base / consts.IMAGE_WIDTH);
                    const x = base - consts.IMAGE_WIDTH * y;
                    const index = consts.PIXEL_SIZE * (consts.IMAGE_WIDTH * y + x);
                    data1.data[index] = original1.data[index];
                    data1.data[index + 1] = original1.data[index + 1];
                    data1.data[index + 2] = original1.data[index + 2];
                    data1.data[index + 3] = original1.data[index + 3];

                    data2.data[index] = original2.data[index];
                    data2.data[index + 1] = original2.data[index + 1];
                    data2.data[index + 2] = original2.data[index + 2];
                    data2.data[index + 3] = original2.data[index + 3];
                }
                const canvasCtx1 = this.c1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                const canvasCtx2 = this.c2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                canvasCtx1.putImageData(data1, 0, 0);
                canvasCtx2.putImageData(data2, 0, 0);
                this.canvas1.next(this.c1);
                this.canvas2.next(this.c2);
            }
        }
        this.isBlinking.next(false);
    }

    blinkPixels(differenceArray: Difference[] | undefined, ctx1: CanvasRenderingContext2D | null, ctx2: CanvasRenderingContext2D | null) {
        this.isBlinking.next(true);
        let flash = true;
        let count = 0;

        const BLINK_INTERVAL = 200;
        const MAX_COUNT = 10;

        const original1: ImageData | undefined = ctx1?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        const original2: ImageData | undefined = ctx2?.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

        const blink: ReturnType<typeof setInterval> = setInterval(() => {
            this.clearAllBlink.subscribe((value) => {
                if (value) {
                    clearInterval(blink);
                }
            });
            if (differenceArray) {
                for (const difference of differenceArray) {
                    this.flashPixels(difference, original1, original2, ctx1, ctx2, flash);
                }
            }
            flash = !flash;
            count++;

            if (count === MAX_COUNT) {
                clearInterval(blink);
            }
        }, BLINK_INTERVAL);
    }
}
