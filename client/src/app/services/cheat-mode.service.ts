import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { consts } from '@common/consts';
import { Subject, takeUntil } from 'rxjs';
import { BlinkerService } from './blinker.service';
import { DifferencesDetectionService } from './differences-detection.service';

@Injectable({
    providedIn: 'root',
})
export class CheatModeService implements OnDestroy {
    canvas1: ElementRef<HTMLCanvasElement>;
    canvas2: ElementRef<HTMLCanvasElement>;
    original1: ImageData | undefined;
    original2: ImageData | undefined;
    ctx1: CanvasRenderingContext2D;
    ctx2: CanvasRenderingContext2D;
    blink: ReturnType<typeof setInterval>;
    differenceArray: Difference[] | undefined;
    destroy$ = new Subject<any>();

    constructor(private blinkerService: BlinkerService, private differencesDetectionService: DifferencesDetectionService) {
        this.differencesDetectionService.difference.pipe(takeUntil(this.destroy$)).subscribe((differenceArray) => {
            this.differenceArray = differenceArray;
        });
    }

    init(): void {
        this.blinkerService.canvas1.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.canvas1 = x;
        });
        this.blinkerService.canvas2.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.canvas2 = x;
        });
        this.ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    startBlink(): void {
        this.blinkerService.isBlinking.next(true);
        let flash = true;

        const BLINK_INTERVAL = 250;

        const ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.original1 = ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        this.original2 = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

        this.blink = setInterval(() => {
            if (this.differenceArray) {
                for (const difference of this.differenceArray) {
                    this.blinkerService.flashPixels(difference, this.original1, this.original2, ctx1, ctx2, flash);
                }
            }
            flash = !flash;
        }, BLINK_INTERVAL);
        this.blinkerService.isBlinking.next(false);
    }

    stopBlink(): void {
        clearInterval(this.blink);
        if (this.differenceArray) {
            for (const difference of this.differenceArray) {
                this.blinkerService.flashPixels(difference, this.original1, this.original2, this.ctx1, this.ctx2, false);
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
    setBlinkerService(blinkerService: BlinkerService): void {
        this.blinkerService = blinkerService;
    }

}
