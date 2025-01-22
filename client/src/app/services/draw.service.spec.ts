import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawService } from '@app/services/draw.service';
import { consts } from '@common/consts';

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = consts.IMAGE_WIDTH;
    const CANVAS_HEIGHT = consts.IMAGE_HEIGHT;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DrawService],
        });
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawPencil should call all the methods to draw a line', () => {
        spyOn(ctxStub, 'beginPath');
        spyOn(ctxStub, 'moveTo');
        spyOn(ctxStub, 'lineTo');
        spyOn(ctxStub, 'stroke');
        service.drawPencil(ctxStub, { x: 1, y: 2 }, { x: 3, y: 4 });
        expect(ctxStub.beginPath).toHaveBeenCalled();
        expect(ctxStub.moveTo).toHaveBeenCalledWith(3, 4);
        expect(ctxStub.lineTo).toHaveBeenCalledWith(1, 2);
        expect(ctxStub.stroke).toHaveBeenCalled();
    });

    it('drawRectangle should call all the methods to draw a rectangle', () => {
        spyOn(ctxStub, 'clearRect');
        spyOn(ctxStub, 'fillRect');
        service.drawRectangle(ctxStub, { x: 1, y: 2, width: 3, height: 4 });
        expect(ctxStub.clearRect).toHaveBeenCalledWith(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        expect(ctxStub.fillRect).toHaveBeenCalledWith(1, 2, 3, 4);
    });

    it('drawEraser should call all the methods to erase', () => {
        spyOn(ctxStub, 'clearRect');
        ctxStub.lineWidth = 2;
        service.drawEraser(ctxStub, { x: 5, y: 5 });
        expect(ctxStub.clearRect).toHaveBeenCalledWith(4, 4, 2, 2);
    });

    it('isDrawing should return false if mouse is up', () => {
        service.isDrawing = true;
        window.dispatchEvent(new Event('mouseup'));
        expect(service.isDrawing).toBeFalse();
    });
});
