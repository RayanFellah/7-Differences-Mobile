import { Injectable, OnDestroy } from '@angular/core';
import { Stack } from '@app/classes/stack';
import { DrawingZoneComponent } from '@app/components/drawing-zone/drawing-zone.component';
import { consts } from '@common/consts';
import { Difficulty, GameCardTemplate } from '@common/game-card-template';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from './communication.service';
import { ImageComparisonService } from './image-comparison.service';


@Injectable({
    providedIn: 'root',
})
export class CreatePageService implements OnDestroy {
    childLeftCanvas: DrawingZoneComponent;
    childRightCanvas: DrawingZoneComponent;
    game: GameCardTemplate;
    canvasHistory: Stack;
    historyPointer: number;
    redoActivated: boolean;
    radius: number;
    destroy$: Subject<any>;
    constructor(
        private readonly imageComparisonService: ImageComparisonService,
        private readonly communicationService: CommunicationService,
    ) {
        this.game = new GameCardTemplate();
        this.game.initDefault();
        const canvasEmpty = document.createElement('canvas');
        canvasEmpty.width = consts.IMAGE_WIDTH;
        canvasEmpty.height = consts.IMAGE_HEIGHT;
        this.redoActivated = false;
        this.destroy$ = new Subject<any>();
        this.canvasHistory = new Stack();
        this.historyPointer = 2;
        this.canvasHistory.push({ canvas: canvasEmpty, id: 0, invert: false });
        this.canvasHistory.push({ canvas: canvasEmpty, id: 1, invert: false });
    };

    async detection(leftCanvas: HTMLCanvasElement, rightCanvas: HTMLCanvasElement): Promise<string> {
        return new Promise((resolve, reject) => {
            console.log('detecte');
            const objectReturn = this.imageComparisonService.detectDifferences(
                leftCanvas,
                rightCanvas,
                this.radius,
            );
            if (objectReturn && objectReturn.isValid) {
                const imageDataDifference = objectReturn.imageDiff;
                this.game.differences = objectReturn.arrayDiff;
                this.game.difficulty = objectReturn.isEasy ? Difficulty.Easy : Difficulty.Hard;
                const newCanvas = document.createElement('canvas');
                newCanvas.width = consts.IMAGE_WIDTH;
                newCanvas.height = consts.IMAGE_HEIGHT;
                const ctxD = newCanvas.getContext('2d');
                if (ctxD) {
                    const palette = ctxD.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT); // x,y,w,h
                    palette.data.set(imageDataDifference);
                    ctxD.putImageData(palette, 0, 0);
                    resolve(newCanvas.toDataURL());
                }
            }
            reject("<h2>Le nombre de différences n'est pas valide!</h2> <h3>3 à 9 différences requises</h3>");
        });
    }

    async uploadImage(img: string): Promise<string> {
        return new Promise((resolve, reject) => {
            console.log('upimage');
            const res = this.communicationService.uploadImage(img);
            res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
                if (response.status === consts.HTTP_STATUS_CREATED && response.body) {
                    resolve(response.body);
                } else {
                    reject(new Error('Error while uploading image'));
                }
            });
        });
    }

    async uploadGame(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            (async () => {
                console.log('up10')
                const img1 = localStorage.getItem('img1') as string;
                const img2 = localStorage.getItem('img2') as string;
                console.log('up0')
                console.log(img1, img2);

                if (this.game.isComplete()) {

                    console.log('up1');
                    this.game.img1ID = await this.uploadImage(img1);
                    this.game.img2ID = await this.uploadImage(img2);
                    console.log('up2');
                    const res = this.communicationService.uploadGameCard(this.game);
                    console.log('up3');
                    res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
                        if (response.status === consts.HTTP_STATUS_CREATED) {
                            console.log('success');
                            resolve();
                        } else {
                            console.log('fail  ');
                            alert(response.status);
                            reject(new Error('Error while uploading game card'));
                        }
                    });
                } else {
                    reject(new Error('Game card is not complete'));
                }
            })();
        });
    }

    drawCanvas(imgSrc: string, canvas: HTMLCanvasElement) {
        console.log('drawCanvas');

        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(img, 0, 0);
        };
    }

    redo() {
        const storage = this.canvasHistory.storage;
        if (this.historyPointer < storage.length) {
            const leftCanvasForeground = this.childLeftCanvas.canvasF.nativeElement;
            const rightCanvasForeground = this.childRightCanvas.canvasF.nativeElement;
            const ctxLeft = leftCanvasForeground.getContext('2d') as CanvasRenderingContext2D;
            const ctxRight = rightCanvasForeground.getContext('2d') as CanvasRenderingContext2D;
            if (storage[this.historyPointer].invert) {
                ctxLeft.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                ctxLeft.drawImage(storage[this.historyPointer].canvas, 0, 0);
                this.historyPointer++;
                ctxRight.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                ctxRight.drawImage(storage[this.historyPointer].canvas, 0, 0);
                this.historyPointer++;
            } else {
                if (storage[this.historyPointer].id === 0) {
                    ctxLeft.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                    ctxLeft.drawImage(storage[this.historyPointer].canvas, 0, 0);
                } else {
                    ctxRight.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                    ctxRight.drawImage(storage[this.historyPointer].canvas, 0, 0);
                }
                this.historyPointer++;

            }
            this.redoActivated = true;
        }
    }
    undo() {
        const storage = this.canvasHistory.storage;
        if (this.historyPointer <= 2) return;
        const leftCanvasForeground = this.childLeftCanvas.canvasF.nativeElement;
        const rightCanvasForeground = this.childRightCanvas.canvasF.nativeElement;
        const ctxLeft = leftCanvasForeground.getContext('2d') as CanvasRenderingContext2D;
        const ctxRight = rightCanvasForeground.getContext('2d') as CanvasRenderingContext2D;
        const history = storage[this.historyPointer - 1]
        if (history.invert) {

            ctxRight.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            ctxRight.drawImage(storage[this.checkLastCorrespondingId(1, true) - 1].canvas, 0, 0);
            this.historyPointer--;
            ctxLeft.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            ctxLeft.drawImage(storage[this.checkLastCorrespondingId(0, true) - 1].canvas, 0, 0);
            this.historyPointer--;

        } else {

            if (history.id === 0) {
                ctxLeft.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                ctxLeft.drawImage(storage[this.checkLastCorrespondingId(0, true) - 1].canvas, 0, 0);

                this.historyPointer--;

            } else if (history.id === 1) {
                ctxRight.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                ctxRight.drawImage(storage[this.checkLastCorrespondingId(1, true) - 1].canvas, 0, 0);
                this.historyPointer--;
            }
        }
    }

    undoAll() {
        const leftCanvasForeground = this.childLeftCanvas.canvasF.nativeElement;
        const rightCanvasForeground = this.childRightCanvas.canvasF.nativeElement;
        const ctxLeft = leftCanvasForeground.getContext('2d') as CanvasRenderingContext2D;
        const ctxRight = rightCanvasForeground.getContext('2d') as CanvasRenderingContext2D;
        ctxLeft.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        ctxRight.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        this.historyPointer = 2;
    }

    updateCanvasHistory(canvasAdded: HTMLCanvasElement, id: number, convasExchanged?: HTMLCanvasElement) {
        const storage = this.canvasHistory.storage;
        if (this.compareCanvasWithLastId(canvasAdded, id)) {
            const canvasTemp = document.createElement('canvas');
            canvasTemp.width = consts.IMAGE_WIDTH;
            canvasTemp.height = consts.IMAGE_HEIGHT;
            const ctx1 = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
            ctx1.drawImage(canvasAdded, 0, 0);
            if (id === 3 && convasExchanged) {
                const canvasTemp2 = document.createElement('canvas');
                canvasTemp2.width = consts.IMAGE_WIDTH;
                canvasTemp2.height = consts.IMAGE_HEIGHT;
                const ctx2 = canvasTemp2.getContext('2d') as CanvasRenderingContext2D;
                ctx2.drawImage(convasExchanged, 0, 0);
                this.historyPointer++;
                storage[this.historyPointer - 1] = { canvas: canvasTemp, id: 0, invert: true };
                this.historyPointer++;
                storage[this.historyPointer - 1] = { canvas: canvasTemp2, id: 1, invert: true };
            } else {
                this.historyPointer++;
                storage[this.historyPointer - 1] = { canvas: canvasTemp, id: id, invert: false };
            }
        }
        if (this.redoActivated) {
            storage.splice(this.historyPointer);
            this.redoActivated = false;
        }
    }
    checkLastCorrespondingId(id: number, undo: boolean): number {
        let i = undo ? this.historyPointer - 1 : this.historyPointer;
        while (i !== 0 && id !== this.canvasHistory.storage[i - 1].id) {
            i--;
        }
        return i;
    }

    compareCanvasWithLastId(canvasAdded: HTMLCanvasElement, i: number): boolean {
        if (i !== 3) {
            const ctx = this.canvasHistory.storage[this.checkLastCorrespondingId(i, false) - 1].canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const ctxAdded = canvasAdded.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const imageDataLastId = ctx.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT).data.toString()
            const imageDataNew = ctxAdded.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT).data.toString();
            return imageDataLastId !== imageDataNew;
        } return true;
    }

    combineLeftImage() {
        const canvasTempLeft = document.createElement('canvas');
        canvasTempLeft.width = consts.IMAGE_WIDTH;
        canvasTempLeft.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTempLeft.getContext('2d') as CanvasRenderingContext2D;
        const leftCanvasBackground = this.childLeftCanvas.canvas.nativeElement;
        const leftCanvasForeground = this.childLeftCanvas.canvasF.nativeElement;
        ctx.drawImage(leftCanvasBackground, 0, 0);
        ctx.drawImage(leftCanvasForeground, 0, 0);
        return canvasTempLeft;
    }
    combineRightImage() {
        const canvasTempRight = document.createElement('canvas');
        canvasTempRight.width = consts.IMAGE_WIDTH;
        canvasTempRight.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTempRight.getContext('2d') as CanvasRenderingContext2D;
        const rightCanvasBackground = this.childRightCanvas.canvas.nativeElement;
        const rightCanvasForeground = this.childRightCanvas.canvasF.nativeElement;
        ctx.drawImage(rightCanvasBackground, 0, 0);
        ctx.drawImage(rightCanvasForeground, 0, 0);
        return canvasTempRight;
    }

    ngOnDestroy() {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}