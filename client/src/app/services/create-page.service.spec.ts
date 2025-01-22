import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DrawingZoneComponent } from '@app/components/drawing-zone/drawing-zone.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { consts } from '@common/consts';
import { Subject, of } from 'rxjs';
import { CommunicationService } from './communication.service';
import { CreatePageService } from './create-page.service';
import { ImageComparisonService } from './image-comparison.service';

export class MatDialogMock {
    closeAll() {}
    open() {
        return {};
    }
}

describe('CreatePageService', () => {
    let service: CreatePageService;
    let leftCanvas: ComponentFixture<DrawingZoneComponent>;
    let rightCanvas: ComponentFixture<DrawingZoneComponent>;
    let leftCanvasInstance: DrawingZoneComponent;
    let rightCanvasInstance: DrawingZoneComponent;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let imageComparisonServiceSpy: jasmine.SpyObj<ImageComparisonService>;
    let imageUploadedSubject: Subject<HttpResponse<string>>
    let routerSpy: jasmine.SpyObj<Router>;


    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['uploadImage', 'uploadGame', 'uploadGameCard']);
        imageComparisonServiceSpy = jasmine.createSpyObj('ImageComparisonService', ['detectDifferences']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({

            declarations: [DrawingZoneComponent, CreatePageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: ImageComparisonService, useValue: imageComparisonServiceSpy },
            ]
        }).compileComponents();
        leftCanvas = TestBed.createComponent(DrawingZoneComponent);
        rightCanvas = TestBed.createComponent(DrawingZoneComponent);
        leftCanvasInstance = leftCanvas.componentInstance;
        rightCanvasInstance = rightCanvas.componentInstance;
        imageUploadedSubject = new Subject<HttpResponse<string>>();
        (communicationServiceSpy.uploadImage as jasmine.Spy).and.returnValue(
            imageUploadedSubject.asObservable()
        );
        service = TestBed.inject(CreatePageService);

        service.childLeftCanvas = leftCanvasInstance;
        service.childRightCanvas = rightCanvasInstance;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('uploadImage should resolve with the correct url if the image is uploaded successfully', async () => {
        const url = 'testUrl';
        const img = 'testImg';

        communicationServiceSpy.uploadImage.and.returnValue(of(new HttpResponse({
            status: consts.HTTP_STATUS_CREATED,
            body: url
        })));
        const res = await service.uploadImage(img);
        expect(res).toEqual(url);
    });

    it('uploadImage should reject if the image is not uploaded successfully', async () => {
        const url = 'testUrl';
        const img = 'testImg';
        communicationServiceSpy.uploadImage.and.returnValue(of(new HttpResponse({
            status: consts.HTTP_BAD_REQUEST,
            body: url
        })));
        try {
            await service.uploadImage(img);
        } catch (err) {
            expect(err).toBeDefined();
        }
    });

    it('uploadGame should reject if the game is not complete', async () => {
        const url = 'testUrl';
        service.game.isComplete = () => false;
        spyOn(service, 'uploadImage').and.returnValue(Promise.resolve(''));
        communicationServiceSpy.uploadGameCard.and.returnValue(of(new HttpResponse({
            status: consts.HTTP_STATUS_CREATED,
            body: url
        })));
        try {
            await service.uploadGame();
        } catch (err) {
            expect(err).toBeDefined();
        }
    });

    it('uploadGame should reject if the images are not uploaded successfully', async () => {
        const url = 'testUrl';
        service.game.isComplete = () => true;
        spyOn(service, 'uploadImage').and.returnValue(Promise.resolve(''));
        communicationServiceSpy.uploadGameCard.and.returnValue(of(new HttpResponse({
            status: consts.HTTP_STATUS_CREATED,
            body: url
        })));
        try {
            await service.uploadGame();
        } catch (err) {
            expect(err).toBeDefined();
        }
    });

    it('uploadGame should make an alert if the game is not uploaded successfully', async () => {
        const url = 'testUrl';
        service.game.isComplete = () => true;
        spyOn(service, 'uploadImage').and.returnValue(Promise.resolve(''));
        communicationServiceSpy.uploadGameCard.and.returnValue(of(new HttpResponse({
            status: consts.HTTP_BAD_REQUEST,
            body: url
        })));
        try {
            await service.uploadGame();
        } catch (err) {
            expect(err).toBeDefined();
        }
    });

    it('should call detectDifference when detection is called', async () => {
        imageComparisonServiceSpy.detectDifferences.and.returnValue({ imageDiff: new Uint8ClampedArray, arrayDiff: [{ points: [1, 2, 3] }], isValid: true, isEasy: true });

        await service.detection(document.createElement('canvas'), document.createElement('canvas'));
        expect(imageComparisonServiceSpy.detectDifferences).toHaveBeenCalled();
    });

    it('should set game.differences when detection is called', async () => {
        imageComparisonServiceSpy.detectDifferences.and.returnValue({
            imageDiff: new Uint8ClampedArray(),
            arrayDiff: [{ points: [1, 2, 3] }],
            isValid: true,
            isEasy: true,
        });
        await service.detection(document.createElement('canvas'), document.createElement('canvas'));
        expect(service.game.differences).toEqual([{ points: [1, 2, 3] }]);
    });

    it('should set game.difficulty to easy when detection is called and retunrn iseasy true', async () => {
        imageComparisonServiceSpy.detectDifferences.and.returnValue({
            imageDiff: new Uint8ClampedArray(),
            arrayDiff: [{ points: [1, 2, 3] }],
            isValid: true,
            isEasy: true,
        });
        await service.detection(document.createElement('canvas'), document.createElement('canvas'));
        expect(service.game.difficulty).toEqual('Facile');
    });

    it('should set game.difficulty to hard when detection is called and retunrn iseasy false', async () => {
        imageComparisonServiceSpy.detectDifferences.and.returnValue({
            imageDiff: new Uint8ClampedArray(),
            arrayDiff: [{ points: [1, 2, 3] }],
            isValid: true,
            isEasy: false,
        });
        await service.detection(document.createElement('canvas'), document.createElement('canvas'));
        expect(service.game.difficulty).toEqual('Difficile');
    });

    it('should return a reject with the correct string when isValid==false', async () => {
        imageComparisonServiceSpy.detectDifferences.and.returnValue({
            imageDiff: new Uint8ClampedArray(),
            arrayDiff: [{ points: [1, 2, 3] }],
            isValid: false,
            isEasy: false,
        });
        await expectAsync(service.detection(document.createElement('canvas'), document.createElement('canvas'))).toBeRejectedWith('<h2>Le nombre de différences n\'est pas valide!</h2> <h3>3 à 9 différences requises</h3>');
    });

    it('should return a resolve with the correct string when isValid==true', async () => {
        const objectReturn = { imageDiff: new Uint8ClampedArray(), arrayDiff: [{ points: [1, 2, 3] }], isValid: true, isEasy: false };
        imageComparisonServiceSpy.detectDifferences.and.returnValue(objectReturn);
        spyOn(service, 'detection').and.callThrough();
        await service.detection(document.createElement('canvas'), document.createElement('canvas'));
        const newCanvas = document.createElement('canvas');
        newCanvas.width = consts.IMAGE_WIDTH;
        newCanvas.height = consts.IMAGE_HEIGHT;
        const ctxD = newCanvas.getContext('2d');
        if (ctxD) {
            const palette = ctxD.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT); // x,y,w,h
            palette.data.set(objectReturn.imageDiff);
            ctxD.putImageData(palette, 0, 0);
        }
        const canvasUrl = newCanvas.toDataURL();
        expect(service.detection(document.createElement('canvas'), document.createElement('canvas')).toString()).toEqual(Promise.resolve(canvasUrl).toString());
    });

    it('should set the canvas dimensions and draw the image onto the canvas', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const img = new Image()
        const src = '../../assets/image_tests/image_0_diff.bmp'
        const imageSpy = jasmine.createSpyObj('Image', ['onload']);
        imageSpy.onload.and.callFake(() => {
            expect(ctx.drawImage).toHaveBeenCalled();
        });
        img.src = src;
        service.drawCanvas(src, canvas);
    });

    it('updateCanvasHistory should increment historyPointer once if canvasExchanged is null', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        service.updateCanvasHistory(canvasTemp, 3);
        expect(service.historyPointer).toEqual(3);
    });

    it('checkLastCorrespondingId should return the last corresponding id', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        service.historyPointer++;
        service.canvasHistory.storage[service.historyPointer - 1] = { canvas: canvasTemp, id: 0, invert: false };
        service.historyPointer++;
        service.canvasHistory.storage[service.historyPointer - 1] = { canvas: canvasTemp, id: 1, invert: false };
        service.historyPointer++;
        service.canvasHistory.storage[service.historyPointer - 1] = { canvas: canvasTemp, id: 0, invert: false };
        expect(service.checkLastCorrespondingId(0, false)).toEqual(5);
        expect(service.checkLastCorrespondingId(1, false)).toEqual(4);
    });

    it('updateCanvasHistory should clear the stack from index historyPointer if redoActivated is true', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        service.canvasHistory.storage = [{ canvas: canvasTemp, id: 0, invert: false }, { canvas: canvasTemp, id: 1, invert: false }];
        service.historyPointer = 1;
        service.redoActivated = true;
        service.updateCanvasHistory(canvasTemp, 0);
        expect(service.canvasHistory.storage.length).toEqual(1);
    });

    it('updateCanvasHistory should increment historyPointer twice if canvasExchanged is not null and id==3', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        service.updateCanvasHistory(canvasTemp, 3, canvasTemp);
        expect(service.historyPointer).toEqual(4);
        expect(service.canvasHistory.storage[3]).toEqual({ canvas: canvasTemp, id: 1, invert: true });
        expect(service.canvasHistory.storage[2]).toEqual({ canvas: canvasTemp, id: 0, invert: true });
    });

    it('redo should call drawImage and clearRect 2 times and increment two times historyPointer', () => {
        const spyDrawLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        const spyDrawRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 0, invert: true });
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 1, invert: true });
        service.redo();
        expect(service.historyPointer).toEqual(4);
        expect(spyDrawLeft).toHaveBeenCalled();
        expect(spyClearLeft).toHaveBeenCalled();
        expect(spyDrawRight).toHaveBeenCalled();
        expect(spyClearRight).toHaveBeenCalled();
        expect(service.redoActivated).toEqual(true);
    });

    it('Redo should call drawImage and clearRect on LeftCanvas times and increment one times historyPointerif id==0', () => {
        const spyDrawLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 0, invert: false });
        service.redo();
        expect(service.historyPointer).toEqual(3);
        expect(spyDrawLeft).toHaveBeenCalled();
        expect(spyClearLeft).toHaveBeenCalled();
        expect(service.redoActivated).toEqual(true);
    });

    it('Redo should call drawImage and clearRect on RightCanvas times and increment one times historyPointerif id==1', () => {
        const spyDrawRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 1, invert: false });
        service.redo();
        expect(service.historyPointer).toEqual(3);
        expect(spyDrawRight).toHaveBeenCalled();
        expect(service.redoActivated).toEqual(true);
        expect(spyClearRight).toHaveBeenCalled();
    });

    it('undo should not call drawImage and clearRect if historyPointer is 2 and should not change historyPointer', () => {
        const spyDrawLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        const spyDrawRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.undo();
        expect(service.historyPointer).toEqual(2);
        expect(spyDrawLeft).not.toHaveBeenCalled();
        expect(spyClearLeft).not.toHaveBeenCalled();
        expect(spyDrawRight).not.toHaveBeenCalled();
        expect(spyClearRight).not.toHaveBeenCalled();
    });

    it('undo should call drawImage and clearRect on LeftCanvas 1 times and decrement one times historyPointerif id==0', () => {
        const spyDrawLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 0, invert: false });
        service.historyPointer++;
        service.undo();
        expect(service.historyPointer).toEqual(2);
        expect(spyDrawLeft).toHaveBeenCalled();
        expect(spyClearLeft).toHaveBeenCalled();
    });

    it('undo should call drawImage and clearRect on RightCanvas 1 times and decrement one times historyPointerif id==1', () => {
        const spyDrawRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 1, invert: false });
        service.historyPointer++;
        service.undo();
        expect(service.historyPointer).toEqual(2);
        expect(spyDrawRight).toHaveBeenCalled();
        expect(spyClearRight).toHaveBeenCalled();
    });

    it('undo should call drawImage and clearRect 2 times and decrement two times historyPointer if invert is true', () => {
        const spyDrawLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        const spyDrawRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'drawImage');
        const spyClearRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 0, invert: true });
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 1, invert: true });
        service.historyPointer++;
        service.historyPointer++;
        service.undo();
        expect(service.historyPointer).toEqual(2);
        expect(spyDrawLeft).toHaveBeenCalled();
        expect(spyClearLeft).toHaveBeenCalled();
        expect(spyDrawRight).toHaveBeenCalled();
        expect(spyClearRight).toHaveBeenCalled();
    });

    it('undoAll should call clearRect 2 times and set historyPointer to 2', () => {
        const spyClearLeft = spyOn(service.childLeftCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        const spyClearRight = spyOn(service.childRightCanvas.canvasF.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'clearRect');
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 0, invert: true });
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 1, invert: true });
        service.historyPointer++;
        service.historyPointer++;
        service.undoAll();
        expect(service.historyPointer).toEqual(2);
        expect(spyClearLeft).toHaveBeenCalled();
        expect(spyClearRight).toHaveBeenCalled();
    });

    it('compareCanvasWithLastId should return true if i==3', () => {
        expect(service.compareCanvasWithLastId(document.createElement('canvas'), 3)).toEqual(true);
    });

    it('compareCanvasWithLastId should return false if i!=3 and the canvas added is the same as the last one with the same id', () => {
        service.canvasHistory.storage.push({ canvas: document.createElement('canvas'), id: 0, invert: false });
        expect(service.compareCanvasWithLastId(document.createElement('canvas'), 0)).toEqual(false);
    });

    it('compareCanvasWithLastId should return true if i!=3 and the canvas added is not the same as the last one with the same id', () => {
        const canvas = document.createElement('canvas');
        canvas.width = consts.IMAGE_WIDTH;
        canvas.height = consts.IMAGE_HEIGHT;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
        service.canvasHistory.storage.push({ canvas, id: 0, invert: false });
        service.historyPointer++;
        expect(service.compareCanvasWithLastId(document.createElement('canvas'), 0)).toEqual(true);
    });

    it('combineLeftImage should return a canvas with the left image', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(service.childLeftCanvas.canvas.nativeElement, 0, 0);
        ctx.drawImage(service.childLeftCanvas.canvasF.nativeElement, 0, 0);
        expect(service.combineLeftImage()).toEqual(canvasTemp);
    });

    it('combineRightImage should return a canvas with the right image', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(service.childRightCanvas.canvas.nativeElement, 0, 0);
        ctx.drawImage(service.childRightCanvas.canvasF.nativeElement, 0, 0);
        expect(service.combineRightImage()).toEqual(canvasTemp);
    });

});
