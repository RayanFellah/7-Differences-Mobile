import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { GamePageClassic1v1Component } from '@app/pages/game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { SelectoPageComponent } from '@app/pages/selecto-page/selecto-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { SocketService } from '@app/services/socket.service';
import { consts } from '@common/consts';
import { GameMode } from '@common/game-classes';

import { Difficulty } from '@common/game-card-template';
import { Observable } from 'rxjs';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let communicationService: CommunicationService;
    let imageTransferService: ImageTransferService;
    let gameInfoService: GameInfoService;
    let router: Router;
    const routes = [
        { path: 'selecto', component: SelectoPageComponent },
        { path: 'config', component: ConfigPageComponent },
        { path: 'game', component: GamePageComponent },
        { path: 'game1v1', component: GamePageClassic1v1Component },
    ] as Routes;

    let socketService: SocketService;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<GameCardComponent>>;

    let openDialogSpy: jasmine.Spy;

    const testString = 'test';

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent, PopupTextComponent],
            imports: [HttpClientModule, MatDialogModule, RouterTestingModule.withRoutes(routes)],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
                CommunicationService, ImageTransferService, GameInfoService],
        }).compileComponents();
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        imageTransferService = TestBed.inject(ImageTransferService);
        gameInfoService = TestBed.inject(GameInfoService);
        router = TestBed.inject(Router);
        router.initialNavigation();

        openDialogSpy = spyOn(PopupTextComponent, 'openDialog');

        socketService = TestBed.inject(SocketService);
        socketService.listen = jasmine.createSpy('listen').and.returnValue(
            new Observable((observer) => {
                observer.next({ cardId: '1', message: 'test', isWaiting: false, isFull: false, gameName: 'test' });
            }),
        );
        socketService.emit = jasmine.createSpy('emit');

        communicationService.downloadImage = jasmine.createSpy('downloadImage').and.returnValue(
            new Observable<HttpResponse<string>>((observer) => {
                observer.next(new HttpResponse<string>({ body: 'test' }));
                observer.complete();
            }),
        );

        component.gameCard = {
            id: '1',
            name: 'Test',
            difficulty: Difficulty.Easy,
            img1ID: '1',
            img2ID: '2',
            differences: [],
            initDefault(): void {
                this.difficulty = Difficulty.Easy;
                this.differences = [];
            },
            isComplete(): boolean {
                return true;
            },
        };
        component.page = 'Selecto';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a gameCard attribute', () => {
        expect(component.gameCard).toBeTruthy();
    });

    it('ngOnInit should call downloadImage', () => {
        expect(communicationService.downloadImage).toHaveBeenCalled();
    });

    it('ngOnInit should call downloadImage with img1ID and img2ID', () => {
        expect(communicationService.downloadImage).toHaveBeenCalledWith('1');
        expect(communicationService.downloadImage).toHaveBeenCalledWith('2');
    });

    it('should download img1URL and img1 values in ngOnInit', () => {
        expect(component.img1URL).toBe('url(data:image/bmp;base64,test)');
        expect(component.img1).toBe('data:image/bmp;base64,test');
    });

    it('should not download img1URL and img1 values in ngOnInit if the body is empty', () => {
        component.img1URL = '';
        component.img1 = '';
        communicationService.downloadImage = jasmine.createSpy('downloadImage').and.returnValue(
            new Observable<HttpResponse<string>>((observer) => {
                observer.next(new HttpResponse<string>({ body: '' }));
                observer.complete();
            }),
        );
        component.ngOnInit();
        expect(component.img1URL).toBe('');
        expect(component.img1).toBe('');
    });

    it('should download img2URL and img2 values in ngOnInit', () => {
        expect(component.img2URL).toBe('url(data:image/bmp;base64,test)');
        expect(component.img2).toBe('data:image/bmp;base64,test');
    });

    it('should not download img2URL and img2 values in ngOnInit if the body is empty', () => {
        component.img2URL = '';
        component.img2 = '';
        communicationService.downloadImage = jasmine.createSpy('downloadImage').and.returnValue(
            new Observable<HttpResponse<string>>((observer) => {
                observer.next(new HttpResponse<string>({ body: '' }));
                observer.complete();
            }),
        );
        component.ngOnInit();
        expect(component.img2URL).toBe('');
        expect(component.img2).toBe('');
    });

    it('should set the correct difficulty in ngOnInit', () => {
        expect(component.difficulty).toBe(Difficulty.Easy);
    });

    it('should call configSockets and setBestTimes in ngOnInit', () => {
        const configSocketsSpy = spyOn(component, 'configSockets');
        const setBestTimesSpy = spyOn(component, 'setBestTimes');
        component.ngOnInit();
        expect(configSocketsSpy).toHaveBeenCalled();
        expect(setBestTimesSpy).toHaveBeenCalled();
    });

    it('should set isWaiting and isFull in socketService.listen(gameCardStatus) in configSockets', () => {
        component.configSockets();
        expect(component.isWaiting).toBe(false);
        expect(component.isFull).toBe(false);
    });

    it('should call openDialogNotify if data.cardId is equal to gameCard.id in socketService.listen(gameFull) in configSockets', () => {
        component.openDialogNotify = jasmine.createSpy('openDialogNotify');
        component.configSockets();
        expect(component.openDialogNotify).toHaveBeenCalled();
    });

    it('should not call openDialogNotify if data.cardId is not equal to gameCard.id in socketService.listen(gameFull) in configSockets', () => {
        component.openDialogNotify = jasmine.createSpy('openDialogNotify');
        socketService.listen = jasmine.createSpy('listen').and.returnValue(
            new Observable((observer) => {
                observer.next({ cardId: '2', message: 'test', isWaiting: false, isFull: false });
            }),
        );
        component.configSockets();
        expect(component.openDialogNotify).not.toHaveBeenCalled();
    });

    it('should call transferImage and transferInfo if data.cardId is equal to gameCard.id in socketService.listen(createdNewRoom) in configSockets', () => {
        const transferImageSpy = spyOn(component, 'transferImage');
        const transferInfoSpy = spyOn(component, 'transferInfo');
        component.configSockets();
        expect(transferImageSpy).toHaveBeenCalled();
        expect(transferInfoSpy).toHaveBeenCalled();
    });

    it('should not call transferImage and transferInfo if data.cardId is not equal to gameCard.id in socketService.listen(createdNewRoom) in configSockets', () => {
        const transferImageSpy = spyOn(component, 'transferImage');
        const transferInfoSpy = spyOn(component, 'transferInfo');
        socketService.listen = jasmine.createSpy('listen').and.returnValue(
            new Observable((observer) => {
                observer.next({ cardId: '2', message: 'test', isWaiting: false, isFull: false });
            }),
        );
        component.configSockets();
        expect(transferImageSpy).not.toHaveBeenCalled();
        expect(transferInfoSpy).not.toHaveBeenCalled();
    });

    it('should set name to data.gameName and navigate to game1v1 if data.cardId is equal to gameCard.id in socketService.listen(startGame) in configSockets', () => {
        spyOn(router, 'navigateByUrl');
        const url = '/game1v1';
        component.configSockets();
        expect(component.name).toBe('test');
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should call socket.emit(leaveGame) and openDialogNotify if data.cardId is equal to gameCard.id in socketService.listen(abortGame) in configSockets', () => {
        component.configSockets();
        expect(socketService.emit).toHaveBeenCalledWith('leaveGame', null);
    });

    it('should call socket.emit(askGameCardStatus) with gameCard.id in configSockets', () => {
        component.configSockets();
        expect(socketService.emit).toHaveBeenCalledWith('askGameCardStatus', component.gameCard.id);
    });

    it('transferImage should update imageTransferService properties', () => {
        component.transferImage();
        expect(imageTransferService.link1).toBe('url(data:image/bmp;base64,test)');
        expect(imageTransferService.link2).toBe('url(data:image/bmp;base64,test)');
        expect(imageTransferService.img1).toBe('data:image/bmp;base64,test');
        expect(imageTransferService.img2).toBe('data:image/bmp;base64,test');
        expect(imageTransferService.diff).toEqual([]);
    });

    it('transferInfo should update gameInfoService properties', () => {
        component.transferInfo('joueur', 'joueur2');
        expect(gameInfoService.username).toBe('joueur');
        expect(gameInfoService.username2).toBe('joueur2');
        expect(gameInfoService.gameName).toBe(component.name);
        expect(gameInfoService.difficulty).toBe(component.difficulty);
        expect(gameInfoService.nDiff).toBe(0);
        expect(gameInfoService.isSolo).toBe(true);
    });

    it('transferInfo should update gameInfoService.username2 to "" if username2 is "" ', () => {
        component.transferInfo('joueur');
        expect(gameInfoService.username2).toBe("");
    });

    it('transfer should call transferImage and transferInfo', () => {
        spyOn(component, 'transferImage');
        spyOn(component, 'transferInfo');
        const dialogFeedback: DialogFeedback = {
            event: new MouseEvent('click'),
            radius: 0,
            name: 'Test',
        };
        component.transfer(dialogFeedback);
        expect(component.transferImage).toHaveBeenCalled();
        expect(component.transferInfo).toHaveBeenCalledWith('Test');
    });

    it('should update the gameInfo.name attribute with the correct value', () => {
        const dialogFeedback: DialogFeedback = {
            event: new MouseEvent('click'),
            radius: 0,
            name: 'Test',
        };
        component.transfer(dialogFeedback);
        expect(gameInfoService.username).toEqual('Test');
    });

    describe('dialogs', () => {
        it('openDialogDeleteCard should open a dialog with deleteCardCallback', () => {
            const spyCallback = spyOn(component, 'deleteCardCallback');
            component.openDialogDeleteCard();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogReinitCard should open a dialog with reinitCardCallback', () => {
            const spyCallback = spyOn(component, 'reinitCardCallback');
            component.openDialogReinitCard();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogEnterUsernameSolo should open a dialog with transfer as callback', () => {
            const spyCallback = spyOn(component, 'transfer');
            component.openDialogEnterUsernameSolo();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogEnterUsernameDuo should open a dialog with joinGame as callback', () => {
            const spyCallback = spyOn(component, 'joinGame');
            component.openDialogEnterUsernameDuo();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogWrongName should open a dialog with openDialogEnterUsernameDuo as callback', () => {
            const spyCallback = spyOn(component, 'openDialogEnterUsernameDuo');
            component.openDialogWrongName();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogWrongSolo should open a dialog with openDialogEnterUsernameSolo as callback', () => {
            const spyCallback = spyOn(component, 'openDialogEnterUsernameSolo');
            component.openDialogWrongSolo();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogLoad should open a dialog with leaveGame as callback', () => {
            const spyCallback = spyOn(component, 'leaveGame');
            component.openDialogLoad();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });

        it('openDialogNotify should open a dialog with no callback', () => {
            const spyCallback = spyOn(component, 'leaveGame');
            component.openDialogLoad();
            expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
        });
    });

    describe('callbacks', () => {

        const feedback = {
            name: 'Test',
        } as DialogFeedback;

        beforeEach(() => {
        });

        it('joinGame should openDialogWrongName if the name is not valid', () => {
            const spy = spyOn(component, 'openDialogWrongName');
            spyOn(component, 'validateName').and.returnValue(false);
            component.joinGame(feedback)
            expect(spy).toHaveBeenCalled();
        });

        it('joinGame should set the username if the name is valid', () => {
            spyOn(component, 'validateName').and.returnValue(true);
            component.joinGame(feedback);
            expect(component.username).toEqual(feedback.name);
        });

        it('joinGame should emit to joinGameClassic1v1 the gameCardId and the username', () => {
            component.gameCard.id = testString;
            spyOn(component, 'validateName').and.returnValue(true);
            component.joinGame(feedback);
            expect(socketService.emit).toHaveBeenCalledWith('joinGameClassic1v1', { gameCardId: testString, username: feedback.name });
        });

        it('transfer should call openDialogWrongSolo if the name is not valid', () => {
            const spy = spyOn(component, 'openDialogWrongSolo');
            spyOn(component, 'validateName').and.returnValue(false);
            component.transfer(feedback);
            expect(spy).toHaveBeenCalled();
        });

        it('transfer should emit to joinGameSolo the gameCardId', () => {
            component.gameCard.id = testString;
            component.transfer(feedback);
            expect(socketService.emit).toHaveBeenCalledWith('joinGameSolo', { gameCardId: testString });
        });

        it('transfer call transferImage and transferInfo', () => {
            component.gameCard.id = testString;

            const spyImg = spyOn(component, 'transferImage');
            const spyInfo = spyOn(component, 'transferInfo');

            component.transfer(feedback);
            expect(spyImg).toHaveBeenCalled();
            expect(spyInfo).toHaveBeenCalled();
        });

        it('transfer should redirect to game', () => {
            const routeSpy = spyOn(router, 'navigateByUrl');
            component.transfer(feedback);
            expect(routeSpy).toHaveBeenCalledWith('/game');
        });

        it('leaveGame should emit to leaveGame', () => {
            component.leaveGame();
            expect(socketService.emit).toHaveBeenCalledWith('leaveGame', null);
        });

        it('deleteCardCallback should call deleteCard if button "Oui" is clicked', () => {
            const targetElement = document.createElement('button');
            targetElement.innerHTML = 'Oui';

            const event = new CustomEvent('myCustomEvent');
            Object.defineProperty(event, 'target', { value: targetElement });
            document.dispatchEvent(event);

            const feedback = {
                event: event,
                radius: 0,
                name: 'Test',
            } as DialogFeedback;

            const spyDelete = spyOn(component, 'deleteCard');
            component.deleteCardCallback(feedback);
            expect(spyDelete).toHaveBeenCalled();

        });

        it('deleteCardCallback should not call deleteCard if it is not the "Oui button clicked', () => {
            const targetElement = document.createElement('button');
            targetElement.innerHTML = 'Non';

            const event = new CustomEvent('myCustomEvent');
            Object.defineProperty(event, 'target', { value: targetElement });
            document.dispatchEvent(event);

            const feedback = {
                event: event,
                radius: 0,
                name: 'Test',
            } as DialogFeedback;

            const spyDelete = spyOn(component, 'deleteCard');
            component.deleteCardCallback(feedback);
            expect(spyDelete).not.toHaveBeenCalled();
        });

        it('reinitCardCallback should call communication.resetBestTimes and socketService.emit if button "Oui" is clicked', () => {
            communicationService.resetBestTimes = jasmine.createSpy('resetBestTimes').and.returnValue(
                new Observable<HttpResponse<string>>((observer) => {
                    observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_OK }));
                }),
            );

            const targetElement = document.createElement('button');
            targetElement.innerHTML = 'Oui';

            const event = new CustomEvent('myCustomEvent');
            Object.defineProperty(event, 'target', { value: targetElement });
            document.dispatchEvent(event);

            const feedback = {
                event: event,
                radius: 0,
                name: 'Test',
            } as DialogFeedback;

            component.reinitCardCallback(feedback);
            expect(communicationService.resetBestTimes).toHaveBeenCalled();
            expect(socketService.emit).toHaveBeenCalledWith('bestTimesUpdate', {});
        });

        it('deleteCard should emit to gameCardDeleted if card is deleted successfully', () => {
            communicationService.deleteGameCard = jasmine.createSpy('deleteGameCard').and.returnValue(
                new Observable<HttpResponse<string>>((observer) => {
                    observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_OK }));
                }),
            );

            component.gameCard.id = testString;

            component.deleteCard();

            expect(socketService.emit).toHaveBeenCalledWith('gameCardDeleted', { cardId: testString });
        });

        it('validateName should return true if the name is valid', () => {
            const name = 'Test';
            expect(component.validateName(name)).toBeTruthy();
        });

        it('validateName should return false if the name is not valid', () => {
            const name = 'Testa dasdasd asd';
            expect(component.validateName(name)).toBeFalsy();
        });

        it('setBestTimes should set the timesSolo and times1v1', () => {
            const bestTimeSolo = [
                {
                    gameMode: GameMode.CLASSIQUE_SOLO,
                    duration: 10,
                    player: 'Test',
                    gameCardId: '1',
                },
            ];
            const bestTime1v1 = [
                {
                    gameMode: GameMode.CLASSIQUE_1V1,
                    duration: 10,
                    player: 'Test',
                    gameCardId: '1',
                },
            ];
            const response = [
                bestTimeSolo[0],
                bestTime1v1[0],
            ];
            communicationService.getBestTimes = jasmine.createSpy('getBestTimes').and.returnValue(
                new Observable<HttpResponse<object>>((observer) => {
                    observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_OK, body: response }));
                }),
            );
            component.setBestTimes();
            expect(communicationService.getBestTimes).toHaveBeenCalled();
            expect(component.timesSolo).toEqual(bestTimeSolo);
            expect(component.times1v1).toEqual(bestTime1v1);
        });
    });
});
