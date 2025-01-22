import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DrawService } from '@app/services/draw.service';
import { ToolbarSelectService } from '@app/services/toolbar-select.service';
import { consts } from '@common/consts';
import { Vec2 } from '@common/vec2';
import { Subject, takeUntil } from 'rxjs';
import { toolType } from '../toolbar-tools/toolbar-tools.component';

@Component({
    selector: 'app-drawing-zone',
    templateUrl: './drawing-zone.component.html',
    styleUrls: ['./drawing-zone.component.scss'],
    providers: [DrawService]
})

export class DrawingZoneComponent implements OnInit, OnDestroy {
    tool: toolType;
    ctxForeground: CanvasRenderingContext2D;
    ctxBackground: CanvasRenderingContext2D;
    ctxOverlay: CanvasRenderingContext2D;
    shiftPressed: boolean = false;
    pencilWidth: number = 15;
    eraserWidth: number = 15;
    radius: number = 15;
    density: number = 100;
    intervalHandler: any;
    isMoving: boolean = false;
    destroy$ = new Subject<any>();

    constructor(
        readonly drawService: DrawService,
        private readonly toolbarService: ToolbarSelectService
    ) {
        this.toolbarService.toolSelected.pipe(takeUntil(this.destroy$)).subscribe((tool) => {
            this.tool = tool;
        });
        this.toolbarService.colorSelected.pipe(takeUntil(this.destroy$)).subscribe((color) => {
            this.ctxForeground.strokeStyle = color;
            this.ctxForeground.fillStyle = color;
            this.ctxOverlay.fillStyle = color;
        });
        this.toolbarService.pencilWidthSelected.pipe(takeUntil(this.destroy$)).subscribe((width) => {
            this.pencilWidth = width;
        });
        this.toolbarService.eraserWidthSelected.pipe(takeUntil(this.destroy$)).subscribe((width) => {
            this.eraserWidth = width;
        });
        this.toolbarService.radiusSelected.pipe(takeUntil(this.destroy$)).subscribe((radius) => {
            this.radius = radius;
        });
        this.toolbarService.densitySelected.pipe(takeUntil(this.destroy$)).subscribe((density) => {
            this.density = density;
        });
    }


    @Input() imageBackground: ImageBitmap;
    @ViewChild('background', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('foreground', { static: true }) canvasF: ElementRef<HTMLCanvasElement>;
    @ViewChild('overlay', { static: true }) canvasO: ElementRef<HTMLCanvasElement>;
    @Output() foregroundChanged = new EventEmitter<HTMLCanvasElement>();
    lastPos: Vec2 = { x: 0, y: 0 };
    currentPos: Vec2 = { x: 0, y: 0 };
    ngOnInit(): void {
        const canvasBackgroundNativeElement = this.canvas.nativeElement;
        const canvasForegroundNativeElement = this.canvasF.nativeElement;
        const canvasOverlayNativeElement = this.canvasO.nativeElement;
        canvasBackgroundNativeElement.width = consts.IMAGE_WIDTH;
        canvasBackgroundNativeElement.height = consts.IMAGE_HEIGHT;
        canvasForegroundNativeElement.width = consts.IMAGE_WIDTH;
        canvasForegroundNativeElement.height = consts.IMAGE_HEIGHT;
        canvasOverlayNativeElement.width = consts.IMAGE_WIDTH;
        canvasOverlayNativeElement.height = consts.IMAGE_HEIGHT;
        this.ctxBackground = canvasBackgroundNativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctxForeground = canvasForegroundNativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctxOverlay = canvasOverlayNativeElement.getContext('2d') as CanvasRenderingContext2D;
        const img = new Image();
        img.src = '../../../client/src/assets/image_tests/image_0_diff.bmp';
        img.onload = () => {
            this.ctxBackground.drawImage(img, 0, 0);
        }
    }
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.drawService.isDrawing = true;
        this.lastPos = this.getPosition(event);
        if (this.tool === toolType.aerosol) {
            this.currentPos = this.getPosition(event);
            this.intervalHandler = setInterval(()=>{this.aerosolComportement(event)}, 100);
        }else if(this.tool == toolType.sceau){
            this.currentPos = this.getPosition(event);
            this.draw();
        }
    }
    

    aerosolComportement(event: MouseEvent) {
        //this.currentPos = this.getPosition(event);
        console.log(this.currentPos.x + " " + this.currentPos.y + " pos");
        this.drawService.drawAerosol(this.ctxForeground, { x: this.currentPos.x, y: this.currentPos.y, radius: this.radius, density: this.density });
        this.lastPos = this.currentPos;
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.currentPos = this.getPosition(event);
        this.draw();
        if (this.intervalHandler !== null && this.tool === toolType.aerosol) {
            console.log('clear interval');
            clearInterval(this.intervalHandler);
            this.intervalHandler = null;
            //this.isMoving = false;
        }
        this.clearOvelay();
        this.drawService.isDrawing = false;
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = this.canvasF.nativeElement.width;
        canvasTemp.height = this.canvasF.nativeElement.height;
        const ctxTemp = canvasTemp.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        ctxTemp.drawImage(this.canvasF.nativeElement, 0, 0);
        this.foregroundChanged.emit(canvasTemp);
    }

    clearOvelay() {
        const canvasOverlayNativeElement = this.canvasO.nativeElement;
        this.ctxForeground.drawImage(canvasOverlayNativeElement, 0, 0);
        this.ctxOverlay.clearRect(0, 0, canvasOverlayNativeElement.width, canvasOverlayNativeElement.height);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(): void {
        if (!this.drawService.isDrawing) {
            this.clearOvelay();
        }
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        event.preventDefault();
        if (this.drawService.isDrawing ) {
            this.currentPos = this.getPosition(event);
            if(this.tool !== toolType.aerosol){
                this.draw();
            }
        }
    }


    getPosition(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    draw() {
        switch (this.tool) {
            case toolType.pen:
                this.ctxForeground.lineWidth = this.pencilWidth;
                this.drawService.drawPencil(this.ctxForeground, this.currentPos, this.lastPos);
                this.lastPos = this.currentPos;
                break;
            case toolType.eraser:
                this.ctxForeground.lineWidth = this.eraserWidth;
                this.drawService.drawEraser(this.ctxForeground, this.currentPos);
                this.lastPos = this.currentPos;
                break;
            case toolType.rectangle:
                this.detectIfRectOrSquare();
                break;
            case toolType.ellipse:
                this.detectIfCircleOrEllipse();
                break;
            case toolType.sceau:
                this.drawService.drawSceau(this.ctxForeground, this.currentPos.x, this.currentPos.y);
                break;
        }
    }
    detectIfRectOrSquare() {
        if (this.shiftPressed) {
            const newWidth = this.currentPos.x - this.lastPos.x;
            const newHeight = this.currentPos.y - this.lastPos.y;
            const negatifWidth = newWidth >= 0 ? 1 : -1;
            const negatifHeight = newHeight >= 0 ? 1 : -1;
            const square = {
                x: this.lastPos.x,
                y: this.lastPos.y,
                width: Math.abs(newWidth) >= Math.abs(newHeight) ? negatifWidth * (Math.abs(newHeight)) : negatifWidth * (Math.abs(newWidth)),
                height: Math.abs(newWidth) >= Math.abs(newHeight) ? negatifHeight * (Math.abs(newHeight)) : negatifHeight * (Math.abs(newWidth))
            };
            this.drawService.drawRectangle(this.ctxOverlay, square);

        } else {
            this.drawService.drawRectangle(this.ctxOverlay, { x: this.lastPos.x, y: this.lastPos.y, width: this.currentPos.x - this.lastPos.x, height: this.currentPos.y - this.lastPos.y });
        }
    }

    detectIfCircleOrEllipse() {
        if (this.shiftPressed) {
            const newWidth = this.currentPos.x - this.lastPos.x;
            const newHeight = this.currentPos.y - this.lastPos.y;
            const negatifWidth = newWidth >= 0 ? 1 : -1;
            const negatifHeight = newHeight >= 0 ? 1 : -1;
            const circle = {
                x: this.lastPos.x,
                y: this.lastPos.y,
                width: Math.abs(newWidth) >= Math.abs(newHeight) ? negatifWidth * (Math.abs(newHeight)) : negatifWidth * (Math.abs(newWidth)),
                height: Math.abs(newWidth) >= Math.abs(newHeight) ? negatifHeight * (Math.abs(newHeight)) : negatifHeight * (Math.abs(newWidth))
            };
            this.drawService.drawEllipse(this.ctxOverlay, circle);
        } else {
            this.drawService.drawEllipse(this.ctxOverlay, { x: this.lastPos.x, y: this.lastPos.y, width: this.currentPos.x - this.lastPos.x, height: this.currentPos.y - this.lastPos.y });
        }
    }
    

    @HostListener('window:keydown.shift', ['$event'])
    shiftDown(): void {
        this.shiftPressed = true;
    }

    @HostListener('window:keyup.shift', ['$event'])
    onShiftUp(): void {
        this.shiftPressed = false;
    }

    ngOnDestroy(): void {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}
