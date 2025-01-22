import { HttpClient, HttpHandler, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DrawingZoneComponent } from '@app/components/drawing-zone/drawing-zone.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { consts } from '@common/consts';
import { Subject } from 'rxjs';
import { CommunicationService } from './communication.service';
import { CreatePageService } from './create-page.service';
import { MatDialogMock } from './create-page.service.spec';
import { DialogService } from './dialog.service';
import { GameCreationToolsService } from './game-creation-tools.service';
import { ImageManagerService } from './image-manager.service';

describe('GameCreationToolsService', () => {
    let service: GameCreationToolsService;
    let fixture: ComponentFixture<CreatePageComponent>;
    let leftCanvas: ComponentFixture<DrawingZoneComponent>;
    let rightCanvas: ComponentFixture<DrawingZoneComponent>;
    let imageManagerServiceSpy: jasmine.SpyObj<ImageManagerService>;
    let createPageServiceSpy: jasmine.SpyObj<CreatePageService>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let clickEventId0: Event;
    let clickEventId1: Event;
    let dialogServiceSpy: jasmine.SpyObj<DialogService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let imageUploadedSubject: Subject<HttpResponse<string>>

    beforeEach(async () => {
        imageManagerServiceSpy = jasmine.createSpyObj('ImageManagerService', ['validateImage']);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['uploadImage']);
        createPageServiceSpy = jasmine.createSpyObj('CreatePageService', ['drawCanvas', 'updateCanvasHistory']);
        dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialogWrongFormat', 'redirectToConfig', 'openDialogNotify']);
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [PopupTextComponent, CreatePageComponent, DrawingZoneComponent],
            providers: [
                { provide: ImageManagerService, useValue: imageManagerServiceSpy },
                { provide: CreatePageService, useValue: createPageServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: CreatePageService, useValue: createPageServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialogRef, useValue: matDialogSpy },
                HttpClient,
                HttpHandler,
            ]
        }).compileComponents();
        leftCanvas = TestBed.createComponent(DrawingZoneComponent);
        rightCanvas = TestBed.createComponent(DrawingZoneComponent);
        imageUploadedSubject = new Subject<HttpResponse<string>>();
        (communicationServiceSpy.uploadImage as jasmine.Spy).and.returnValue(
            imageUploadedSubject.asObservable()
        );
        fixture = TestBed.createComponent(CreatePageComponent);
        service = TestBed.inject(GameCreationToolsService);
        service.dialogService = dialogServiceSpy;
        service.createPageService = createPageServiceSpy;
        createPageServiceSpy.childLeftCanvas = leftCanvas.componentInstance;
        createPageServiceSpy.childRightCanvas = rightCanvas.componentInstance;
        const tmpCanvas = document.createElement('canvas');
        createPageServiceSpy.childLeftCanvas.ctxForeground = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
        createPageServiceSpy.childRightCanvas.ctxForeground = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
        fixture.detectChanges();
        spyOn(localStorage, 'removeItem');
        spyOn(localStorage, 'setItem');
        service.img1Set = true;
        service.img2Set = true;
        clickEventId0 = new Event('click');
        Object.defineProperty(clickEventId0, 'target', { value: { id: 0 } });
        clickEventId1 = new Event('click');
        Object.defineProperty(clickEventId1, 'target', { value: { id: 1 } });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setImage should set lastUpload to elem.id', () => {
        const newEvent = new Event('File');
        const inputElement = fixture.debugElement.nativeElement.querySelector('#uploadImageL');
        inputElement.dispatchEvent(newEvent);
        spyOn(service, 'imageToStorage');
        service.setImage(newEvent);
        expect(service.lastUpload).toEqual('uploadImageL');
    });

    it('setImage should call imageToStorage', () => {
        const newEvent = new Event('File');
        const inputElement = fixture.debugElement.nativeElement.querySelector('#uploadImageL');
        inputElement.dispatchEvent(newEvent);
        spyOn(service, 'imageToStorage');
        service.setImage(newEvent);
        expect(service.imageToStorage).toHaveBeenCalled();
    });

    it('setimage should empty the value of the target', () => {
        const newEvent = new Event('File');
        const inputElement = fixture.debugElement.nativeElement.querySelector('#uploadImageL');
        inputElement.dispatchEvent(newEvent);
        spyOn(service, 'imageToStorage');
        service.setImage(newEvent);
        expect(inputElement.value).toEqual('');
    });

    it('imageToStorage should call validateImage', () => {
        imageManagerServiceSpy.validateImage.and.returnValue(Promise.resolve("test"));
        const file = new File([''], 'test.png', { type: 'image/png' });
        service.imageToStorage("id", file);
        expect(imageManagerServiceSpy.validateImage).toHaveBeenCalled();
    });

    it('imageToStorage should call setItem and drawCanvas with the good attribute and set img1set to true when called with uploadImageL', async () => {
        imageManagerServiceSpy.validateImage.and.returnValue(Promise.resolve("test"));

        await service.imageToStorage("uploadImageL", new File([''], 'test.png', { type: 'image/png' }));

        expect(service.img1Set).toEqual(true);
        expect(createPageServiceSpy.drawCanvas).toHaveBeenCalledWith('test', createPageServiceSpy.childLeftCanvas.canvas.nativeElement);
        expect(localStorage.setItem).toHaveBeenCalledWith('img1', "test");
    });

    it('imageToStorage should call setItem and drawCanvas with the good attribute and set img2set to true when called with uploadImageR', async () => {
        imageManagerServiceSpy.validateImage.and.returnValue(Promise.resolve("test"));

        spyOn(service, 'imageToStorage').and.callThrough();

        await service.imageToStorage("uploadImageR", new File([''], 'test.png', { type: 'image/png' }));

        expect(service.img2Set).toEqual(true);
        expect(createPageServiceSpy.drawCanvas).toHaveBeenCalledWith('test', createPageServiceSpy.childRightCanvas.canvas.nativeElement);
        expect(localStorage.setItem).toHaveBeenCalledWith('img2', "test");
    });
    it('imageToStorage should call setItem and drawCanvas 2 times and set img2set and img1set to true when called with uploadImageBoth', async () => {
        imageManagerServiceSpy.validateImage.and.returnValue(Promise.resolve("test"));

        spyOn(service, 'imageToStorage').and.callThrough();

        await service.imageToStorage("uploadImageBoth", new File([''], 'test.png', { type: 'image/png' }));

        expect(service.img2Set).toEqual(true);
        expect(service.img1Set).toEqual(true);
        expect(createPageServiceSpy.drawCanvas).toHaveBeenCalledTimes(2);
        expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('imageToStorage should call opendialogwrongformat if the file is null', async () => {
        imageManagerServiceSpy.validateImage.and.returnValue(Promise.resolve("test"));

        await service.imageToStorage("uploadImageBoth", null);
        expect(dialogServiceSpy.openDialogWrongFormat).toHaveBeenCalled();
    });

    it('imageToStorage should not call opendialogwrongformat if validateImage is rejected', async () => {
        imageManagerServiceSpy.validateImage.and.returnValue(Promise.reject("test"));

        await service.imageToStorage("uploadImageBoth", new File([''], 'test.png', { type: 'image/png' }));
        expect(dialogServiceSpy.openDialogWrongFormat).not.toHaveBeenCalled();
    });

    it('clearCanvas should set img1set to false and call removeItem if id=0', () => {
        service.clearCanvas(0);
        expect(service.img1Set).toEqual(false);
        expect(localStorage.removeItem).toHaveBeenCalledWith('img1');
    });

    it('clearCanvas should set img2set to false and call removeItem one item if id = 1', () => {
        service.clearCanvas(1);
        expect(service.img2Set).toEqual(false);
        expect(localStorage.removeItem).toHaveBeenCalledWith('img2');
    });

    it('clearCanvas should set img2set and img1set to false and call removeItem two time if id = 2', () => {
        service.clearCanvas(2);
        expect(service.img1Set).toEqual(false);
        expect(service.img2Set).toEqual(false);
        expect(localStorage.removeItem).toHaveBeenCalledWith('img1');
        expect(localStorage.removeItem).toHaveBeenCalledWith('img2');
    });

    it('reinitForeground should create a new canvas and call updateCanvasHistory with it and the id of the canvas', () => {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        service.reinitForeground(clickEventId0);
        expect(createPageServiceSpy.updateCanvasHistory).toHaveBeenCalledWith(canvasTemp, 0);
    });

    it('reinitForeground should clear the right canvas if id is 1', () => {
        service.reinitForeground(clickEventId1);
        expect(createPageServiceSpy.childRightCanvas.ctxForeground.getImageData(0, 0, 1, 1).data).toEqual(new Uint8ClampedArray([0, 0, 0, 0]));
    });

    it('duplicateForeground should clear the right canvas and draw the left canvas on it if id is 0', () => {
        service.duplicateForeground(clickEventId0);
        expect(createPageServiceSpy.childRightCanvas.ctxForeground.getImageData(0, 0, 1, 1).data).toEqual(createPageServiceSpy.childLeftCanvas.ctxForeground.getImageData(0, 0, 1, 1).data);
    });

    it('duplicateForeground should clear the left canvas and draw the right canvas on it if id is 1', () => {
        service.duplicateForeground(clickEventId1);
        expect(createPageServiceSpy.childLeftCanvas.ctxForeground.getImageData(0, 0, 1, 1).data).toEqual(createPageServiceSpy.childRightCanvas.ctxForeground.getImageData(0, 0, 1, 1).data);
    });

    it('duplicateForeground should call updateCanvasHistory with the id of the canvas', () => {
        service.duplicateForeground(clickEventId0);
        expect(createPageServiceSpy.updateCanvasHistory).toHaveBeenCalledWith(createPageServiceSpy.childRightCanvas.canvasF.nativeElement, 1);
    });

    it('duplicateForeground should draw the context of the given canvas on the other canvas', () => {
        service.duplicateForeground(clickEventId0);
        expect(createPageServiceSpy.childRightCanvas.ctxForeground.getImageData(0, 0, 1, 1).data).toEqual(createPageServiceSpy.childLeftCanvas.ctxForeground.getImageData(0, 0, 1, 1).data);
    });

    it('exchangeForeground should exchange the foreground of the two canvases', () => {
        service.exchangeForeground();
        expect(createPageServiceSpy.childLeftCanvas.ctxForeground.getImageData(0, 0, 1, 1).data).toEqual(createPageServiceSpy.childRightCanvas.ctxForeground.getImageData(0, 0, 1, 1).data);
        expect(createPageServiceSpy.childRightCanvas.ctxForeground.getImageData(0, 0, 1, 1).data).toEqual(createPageServiceSpy.childLeftCanvas.ctxForeground.getImageData(0, 0, 1, 1).data);
    });

});
