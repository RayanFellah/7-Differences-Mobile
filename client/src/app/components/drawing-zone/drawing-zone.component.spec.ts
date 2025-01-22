import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarSelectService } from '@app/services/toolbar-select.service';
import { consts } from '@common/consts';
import { toolType } from '../toolbar-tools/toolbar-tools.component';

import { DrawingZoneComponent } from './drawing-zone.component';

describe('DrawingZoneComponent', () => {
    let component: DrawingZoneComponent;
    let fixture: ComponentFixture<DrawingZoneComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingZoneComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingZoneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a canvas', () => {
        expect(component.canvas).toBeTruthy();
    });

    it('should have a canvas with a context', () => {
        expect(component.canvas.nativeElement.getContext('2d')).toBeTruthy();
    });

    it('onMouseDown should change last pos and isDrawing of DrawService', () => {
        spyOn(component, 'getPosition').and.returnValue({ x: 10, y: 10 });

        const event = new MouseEvent('mousedown');
        spyOn(event, 'preventDefault');
        component.onMouseDown(event);
        expect(component.drawService.isDrawing).toBeTrue();
        expect(component.lastPos).toEqual({ x: 10, y: 10 });
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('onMouseUp should change currentPos and isDrawing of DrawService, call the necessary function, and emit ForegroudChanged', () => {
        spyOn(component, 'getPosition').and.returnValue({ x: 10, y: 10 });
        spyOn(component, 'draw');
        spyOn(component, 'clearOvelay');
        spyOn(component.foregroundChanged, 'emit');

        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
        spyOn(ctx, 'drawImage')
        component.onMouseUp(new MouseEvent('mouseup'));
        expect(component.drawService.isDrawing).toBeFalse();
        expect(component.currentPos).toEqual({ x: 10, y: 10 });
        expect(component.draw).toHaveBeenCalled();
        expect(component.clearOvelay).toHaveBeenCalled();
        expect(component.foregroundChanged.emit).toHaveBeenCalledWith(canvasTemp);
        expect(canvasTemp.toDataURL().toString()).toEqual(component.canvasF.nativeElement.toDataURL().toString());
    });

    it('clearOvelay should call drawImage on ctxForeground', () => {
        spyOn(component.ctxForeground, 'drawImage');
        spyOn(component.ctxOverlay, 'clearRect');
        component.clearOvelay();
        expect(component.ctxForeground.drawImage).toHaveBeenCalled();
        expect(component.ctxOverlay.clearRect).toHaveBeenCalled();
    });

    it('onMouseMove should call getPosition and draw if isDrawing of DrawService is true', () => {
        spyOn(component, 'getPosition').and.returnValue({ x: 10, y: 10 });
        spyOn(component, 'draw');
        const event = new MouseEvent('mouseMove');
        spyOn(event, 'preventDefault');
        component.drawService.isDrawing = true;
        component.onMouseMove(event);
        expect(component.getPosition).toHaveBeenCalled();
        expect(component.draw).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('onMouseEnter should call clearOverlay if isDrawing of DrawService is false', () => {
        spyOn(component, 'clearOvelay');
        component.drawService.isDrawing = true;
        component.onMouseEnter();
        expect(component.clearOvelay).not.toHaveBeenCalled();
    });

    it('onMouseEnter should not call clearOverlay if isDrawing of DrawService is true', () => {
        spyOn(component, 'clearOvelay');
        component.drawService.isDrawing = false;
        component.onMouseEnter();
        expect(component.clearOvelay).toHaveBeenCalled();
    });

    it('onMouseMove should not call getPosition and draw if isDrawing of DrawService is false', () => {
        spyOn(component, 'getPosition');
        spyOn(component, 'draw');
        const event = new MouseEvent('mouseMove');
        spyOn(event, 'preventDefault');
        component.drawService.isDrawing = false;
        component.onMouseMove(event);
        expect(component.getPosition).not.toHaveBeenCalled();
        expect(component.draw).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('getPosition should return the position of the mouse', () => {
        const event = new MouseEvent('mouseMove');
        const rect = component.canvas.nativeElement.getBoundingClientRect();
        component.canvas.nativeElement.dispatchEvent(event);
        const x = Math.trunc(event.clientX - rect.left);
        const y = Math.trunc(event.clientY - rect.top);
        expect(component.getPosition(event)).toEqual({ x, y });
    });

    it('draw should call drawPencil if tool is pencil and change lastpos to currrentpos', () => {
        spyOn(component.drawService, 'drawPencil');
        component.tool = toolType.pen;
        component.lastPos = { x: 5, y: 5 };
        component.currentPos = { x: 30, y: 20 };
        component.draw();
        expect(component.drawService.drawPencil).toHaveBeenCalledWith(component.ctxForeground, { x: 30, y: 20 }, { x: 5, y: 5 });
        expect(component.lastPos).toEqual(component.currentPos);
    });

    it('draw should call drawEraser if tool is eraser and change lastpos to currrentpos', () => {
        spyOn(component.drawService, 'drawEraser');
        component.tool = toolType.eraser;
        component.currentPos = { x: 30, y: 20 };
        component.draw();
        expect(component.drawService.drawEraser).toHaveBeenCalledWith(component.ctxForeground, { x: 30, y: 20 });
        expect(component.lastPos).toEqual(component.currentPos);
    });

    it('draw should call detectIfRectOrSquare if tool is rectangle', () => {
        spyOn(component, 'detectIfRectOrSquare');
        component.tool = toolType.rectangle;
        component.draw();
        expect(component.detectIfRectOrSquare).toHaveBeenCalled();
    });

    it('detectIfRectOrSquare should draw a rectangle if shiftPressed is false', () => {
        spyOn(component.drawService, 'drawRectangle');
        component.shiftPressed = false;
        component.detectIfRectOrSquare();
        expect(component.drawService.drawRectangle).toHaveBeenCalled();
    });

    it('detectIfRectOrSquare should draw a square if shiftPressed is true', () => {
        spyOn(component.drawService, 'drawRectangle');
        component.shiftPressed = true;
        component.detectIfRectOrSquare();
        expect(component.drawService.drawRectangle).toHaveBeenCalled();
    });

    it('detectIfRectOrSquare should draw a square with positve width and height if shiftPressed is true and currentPos>lastPos', () => {

        spyOn(component.drawService, 'drawRectangle');
        component.shiftPressed = true;
        component.lastPos = { x: 5, y: 5 };
        component.currentPos = { x: 30, y: 20 };
        component.detectIfRectOrSquare();
        expect(component.drawService.drawRectangle).toHaveBeenCalledWith(component.ctxOverlay, {
            x: component.lastPos.x,
            y: component.lastPos.y,
            width: 15,
            height: 15
        });
    });

    it('detectIfRectOrSquare should draw a square with negative width and height if shiftPressed is true and currentPos<lastPos', () => {

        spyOn(component.drawService, 'drawRectangle');
        component.shiftPressed = true;
        component.lastPos = { x: 20, y: 30 };
        component.currentPos = { x: 5, y: 5 };
        component.detectIfRectOrSquare();
        expect(component.drawService.drawRectangle).toHaveBeenCalledWith(component.ctxOverlay, {
            x: component.lastPos.x,
            y: component.lastPos.y,
            width: -15,
            height: -15
        });
    });

    it('detectIfRectOrSquare should draw a square with negative width and positive height if shiftPressed is true and currentPos.x<lastPos.x', () => {
        spyOn(component.drawService, 'drawRectangle');
        component.shiftPressed = true;
        component.lastPos = { x: 30, y: 5 };
        component.currentPos = { x: 5, y: 20 };
        component.detectIfRectOrSquare();
        expect(component.drawService.drawRectangle).toHaveBeenCalledWith(component.ctxOverlay, {
            x: component.lastPos.x,
            y: component.lastPos.y,
            width: -15,
            height: 15
        });
    });

    it('detectIfRectOrSquare should draw a square with positive width and negative height if shiftPressed is true and currentPos.y<lastPos.y', () => {
        spyOn(component.drawService, 'drawRectangle');
        component.shiftPressed = true;
        component.lastPos = { x: 5, y: 20 };
        component.currentPos = { x: 30, y: 5 };
        component.detectIfRectOrSquare();
        expect(component.drawService.drawRectangle).toHaveBeenCalledWith(component.ctxOverlay, {
            x: component.lastPos.x,
            y: component.lastPos.y,
            width: 15,
            height: -15
        });
    });

    it('shiftDown should set shiftPressed to true', () => {
        component.shiftPressed = false;
        component.shiftDown();
        expect(component.shiftPressed).toEqual(true);
    });

    it('onshiftUp should set shiftPressed to false', () => {
        component.shiftPressed = true;
        component.onShiftUp();
        expect(component.shiftPressed).toEqual(false);
    });
    describe('oservable', () => {
        let toolbarService: ToolbarSelectService;
        beforeEach(() => {
            toolbarService = TestBed.inject(ToolbarSelectService);
        });
        it('tool should change when the observable in toolbarService is modified', () => {

            toolbarService.toolSelected.next(toolType.rectangle);
            expect(component.tool).toEqual(toolType.rectangle);
        });

        it('stroke style and fill style of the foreground and fill style of the overlay should change when the observable in toolbarService is modified', () => {
            toolbarService.colorSelected.next('#000000');
            expect(component.ctxForeground.strokeStyle).toEqual('#000000');
            expect(component.ctxForeground.fillStyle).toEqual('#000000');
            expect(component.ctxOverlay.fillStyle).toEqual('#000000');
        });

        it('pencil width should change when the observable in toolbarService is modified', () => {
            toolbarService.pencilWidthSelected.next(5);
            expect(component.pencilWidth).toEqual(5);
        });

        it('eraser width should change when the observable in toolbarService is modified', () => {
            toolbarService.eraserWidthSelected.next(5);
            expect(component.eraserWidth).toEqual(5);
        });
    });
});


