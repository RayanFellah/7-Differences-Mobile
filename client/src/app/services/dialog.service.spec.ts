import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GameCardTemplate } from '@common/game-card-template';
import { CreatePageService } from './create-page.service';
import { MatDialogMock } from './create-page.service.spec';
import { DialogService } from './dialog.service';
import { GameCreationToolsService } from './game-creation-tools.service';

describe('DialogService', () => {
    let service: DialogService;
    let fixture: ComponentFixture<CreatePageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    let gameCreationToolsServiceSpy: jasmine.SpyObj<GameCreationToolsService>;
    let createPageServiceSpy: jasmine.SpyObj<CreatePageService>;
    let openDialogSpy: jasmine.Spy;

    const testString = 'test';

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameCreationToolsServiceSpy = jasmine.createSpyObj('GameCreationToolsService', ['imageToStorage', 'clearCanvas']);
        createPageServiceSpy = jasmine.createSpyObj('CreatePageService', ['detection', 'uploadGame', 'combineLeftImage', 'combineRightImage', 'detection']);
        createPageServiceSpy.game = new GameCardTemplate();
        createPageServiceSpy.game.differences = [];

        openDialogSpy = spyOn(PopupTextComponent, 'openDialog');

        await TestBed.configureTestingModule({
            declarations: [PopupTextComponent, CreatePageComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameCreationToolsService, useValue: gameCreationToolsServiceSpy },
                { provide: CreatePageService, useValue: createPageServiceSpy },
                HttpClient,
                HttpHandler,
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(CreatePageComponent);
        service = TestBed.inject(DialogService);
        service.gameCreationToolsService = gameCreationToolsServiceSpy;
        service.router = routerSpy;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('dialogs', () => {

        it('should call openDialog with wrongFormatCallback as callback when openDialogWrongFormat is called', () => {
            const callbackSpy = spyOn(service, 'wrongFormatCallback');

            service.openDialogWrongFormat();

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog with reinitCallback as callback when openDialogReinit is called on event elem id equal to 0', () => {

            const callbackSpy = spyOn(fixture.componentInstance.dialogService, 'reinitCallback');

            const button = fixture.debugElement.nativeElement.querySelector("button[id = '0']");
            const clickEvent = new Event('click');
            button.dispatchEvent(clickEvent);

            fixture.detectChanges();

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog with reinitCallback as callback when openDialogReinit is called on event elem id equal to 1', () => {
            const callbackSpy = spyOn(fixture.componentInstance.dialogService, 'reinitCallback');

            const button = fixture.debugElement.nativeElement.querySelector("button[id = '1']");
            const clickEvent = new Event('click');
            button.dispatchEvent(clickEvent);

            fixture.detectChanges();

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog with reinitCallback as callback when openDialogReinit is called on event elem id equal to 2', () => {
            const callbackSpy = spyOn(fixture.componentInstance.dialogService, 'reinitCallback');

            const button = fixture.debugElement.nativeElement.querySelector("button[id = '2']");
            const clickEvent = new Event('click');
            button.dispatchEvent(clickEvent);

            fixture.detectChanges();

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog with confirmCallback as callback when openDialogConfirm is called and img1Set and img2Set are true', () => {
            const callbackSpy = spyOn(service, 'confirmCallback');

            service.openDialogConfirm();

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog with differencesCallback as callback when openDialogDifferences is called', () => {
            const callbackSpy = spyOn(service, 'differencesCallback');

            const img = 'test';

            service.openDialogDifferences(img);

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog with createGameCallback as callback when openDialogCreateGame is called', () => {
            const callbackSpy = spyOn(service, 'createGameCallback');

            service.openDialogCreateGame();

            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), callbackSpy);
        });

        it('should call openDialog when openDialogLoad is called', () => {
            service.openDialogLoad();
            expect(openDialogSpy).toHaveBeenCalled();
        });


        it('should call openDialog when openDialogNotify is called', () => {
            const message = 'test';
            service.openDialogNotify(message);
            expect(openDialogSpy).toHaveBeenCalled();
        });

    });

    describe('callbacks', () => {

        const feedback = {
            radius: 10,
            name: 'test'
        } as DialogFeedback;

        describe('confirmCallback', () => {

            let dialogLoadSpy: jasmine.Spy;
            const imgString = 'test';

            beforeEach(() => {
                createPageServiceSpy.combineLeftImage.and.returnValue(document.createElement('canvas'));
                createPageServiceSpy.combineRightImage.and.returnValue(document.createElement('canvas'));
                createPageServiceSpy.detection.and.resolveTo(imgString);
                spyOn(localStorage, 'setItem');
                dialogLoadSpy = spyOn(service, 'openDialogLoad');
            });

            it('confirmCallback should call combineLeftImage of createPageService', async () => {
                await service.confirmCallback(feedback);
                expect(createPageServiceSpy.combineLeftImage).toHaveBeenCalled();
            });

            it('confirmCallback should call combineRightImage of createPageService', async () => {
                await service.confirmCallback(feedback);
                expect(createPageServiceSpy.combineRightImage).toHaveBeenCalled();
            });

            it('confirmCallback should set the original image to storage', async () => {
                const canvas = createPageServiceSpy.combineLeftImage();
                const img = canvas.toDataURL().replace('data:image/png;base64,', '');
                await service.confirmCallback(feedback);
                expect(localStorage.setItem).toHaveBeenCalledWith('img1', img);
            });

            it('confirmCallback should set the modified image to storage', async () => {
                const canvas = createPageServiceSpy.combineRightImage();
                const img = canvas.toDataURL().replace('data:image/png;base64,', '');
                await service.confirmCallback(feedback);
                expect(localStorage.setItem).toHaveBeenCalledWith('img1', img);
            });

            it('confirmCallback should set the radius of createPageService to the feedback value', async () => {
                await service.confirmCallback(feedback);
                expect(createPageServiceSpy.radius).toEqual(feedback.radius);
            });

            it('confirmCallback should call openDialogLoad', async () => {
                await service.confirmCallback(feedback);
                expect(dialogLoadSpy).toHaveBeenCalled();
            });

            it('confirmCallback should call openDialogDifferences with the image once differences are detected', async () => {
                const dialogSpy = spyOn(service, 'openDialogDifferences');

                await service.confirmCallback(feedback);

                expect(createPageServiceSpy.detection).toHaveBeenCalled();
                expect(dialogSpy).toHaveBeenCalledWith(imgString);
            });

            it('confirmCallback should call openDialogNotify with error message if an error occurs while detecting', async () => {
                const error = 'testError';

                const dialogSpy = spyOn(service, 'openDialogNotify');

                createPageServiceSpy.detection.and.rejectWith(error);

                await service.confirmCallback(feedback);

                expect(createPageServiceSpy.detection).toHaveBeenCalled();
                expect(dialogSpy).toHaveBeenCalledWith(error);

            });
        });

        describe('wrongFormatCallback', () => {

            it('should call imageToStorage with correct file', () => {

                spyOn(service, 'openDialogWrongFormat');

                gameCreationToolsServiceSpy.lastUpload = testString;

                const elem = fixture.debugElement.nativeElement.querySelector('input[type="file"]');
                const file = new File([''], 'test.jpg', { type: 'image/bmp' });
                const dataFiles = new DataTransfer();
                dataFiles.items.add(file);

                elem.files = dataFiles.files;

                feedback.event = new Event('change');
                elem.dispatchEvent(feedback.event);

                service.wrongFormatCallback(feedback);

                expect(gameCreationToolsServiceSpy.imageToStorage).toHaveBeenCalledWith(testString, elem.files[0]);
            });

            it('should close all dialogs', () => {
                const closeAllSpy = spyOn(service['dialogRef'], 'closeAll');

                service.wrongFormatCallback(feedback);

                expect(closeAllSpy).toHaveBeenCalled();
            });
        });

        describe('reinitCallback', () => {

            it('should call clearCanvas with the right id', () => {

                service['resetCanvasId'] = 0;

                service.reinitCallback();

                expect(gameCreationToolsServiceSpy.clearCanvas).toHaveBeenCalledWith(service['resetCanvasId']);
            });

            it('should close all dialogs', () => {
                const closeAllSpy = spyOn(service['dialogRef'], 'closeAll');
                service.wrongFormatCallback(feedback);
                expect(closeAllSpy).toHaveBeenCalled();
            });

        });

        describe('differencesCallback', () => {
            it('should call openDialogCreateGame', () => {
                const dialogSpy = spyOn(service, 'openDialogCreateGame');

                service.differencesCallback();

                expect(dialogSpy).toHaveBeenCalled();
            });

        });

        describe('createGameCallback', () => {

            let dialogCreateSpy: jasmine.Spy;
            let dialogLoadSpy: jasmine.Spy;
            let dialogNotifySpy: jasmine.Spy;
            let redirectSpy: jasmine.Spy;

            beforeEach(() => {
                feedback.name = 'test';
                dialogCreateSpy = spyOn(service, 'openDialogCreateGame');
                dialogLoadSpy = spyOn(service, 'openDialogLoad');
                dialogNotifySpy = spyOn(service, 'openDialogNotify');
                redirectSpy = spyOn(service, 'redirectToConfig');

                createPageServiceSpy.uploadGame.and.returnValue(Promise.resolve());
            });

            it('should call openDialogCreateGame if no name is provided', async () => {
                feedback.name = '';
                await service.createGameCallback(feedback);

                expect(dialogCreateSpy).toHaveBeenCalled();
            });

            it('should set game\'s name if a name is provided', async () => {
                await service.createGameCallback(feedback);
                expect(createPageServiceSpy.game.name).toEqual(feedback.name);
            });

            it('should call openDialogLoad if a name is provided', () => {
                service.createGameCallback(feedback);
                expect(dialogLoadSpy).toHaveBeenCalled();
            });

            it('should call openDialogNotify if the game uploads successfully', async () => {
                await service.createGameCallback(feedback);
                expect(dialogNotifySpy).toHaveBeenCalled();
            });

            it('should call redirect if the game uploads successfully', async () => {
                await service.createGameCallback(feedback);
                expect(redirectSpy).toHaveBeenCalled();
            });

            it('should call openDialogNotify if an error occurs while uploading', async () => {
                createPageServiceSpy.uploadGame.and.returnValue(Promise.reject());
                await service.createGameCallback(feedback);
                expect(dialogNotifySpy).toHaveBeenCalled();
            });
        });
    });

    it('should redirect to the config page when redirectToConfig() is called', () => {
        service.redirectToConfig();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/config']);
    });

});