import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { CustomButtonComponent } from '@app/components/custom-button/custom-button.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { LogoComponent } from '@app/components/logo/logo.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PopupQuitComponent } from '@app/components/popup-quit/popup-quit.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { BlinkerService } from '@app/services/blinker.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { LimitedTimePageComponent } from './limited-time-page.component';

describe('LimitedTimePageComponent', () => {
    let component: LimitedTimePageComponent;
    let fixture: ComponentFixture<LimitedTimePageComponent>;

    let imageTransferService: ImageTransferService;
    let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;
    let blinkerServiceMock: jasmine.SpyObj<BlinkerService>;
    let cheatModeServiceMock: jasmine.SpyObj<CheatModeService>;
    let differencesDetectionServiceMock: jasmine.SpyObj<DifferencesDetectionService>;
    let timer: ComponentFixture<ChronometreComponent>;
    let timerInstance: ChronometreComponent;

    const imagePath0Diff = '../../../assets/image_tests/image_0_diff.bmp';
    const imagePath2Diff = '../../../assets/image_tests/image_2_diff.bmp';


    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedTimePageComponent, PlayAreaComponent, LogoComponent, GameInfoComponent, CounterComponent, CustomButtonComponent, PopupQuitComponent, SidebarComponent, ChronometreComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ GameInfoService, useValue: gameInfoServiceMock },
            { DifferencesDetectionService, useValue: differencesDetectionServiceMock },
            { CheatModeService, useValue: cheatModeServiceMock },
            { BlinkerService, useValue: blinkerServiceMock },
            { provide: MatDialog, useClass: MatDialogMock },
            { provide: MatDialogRef, useValue: matDialogSpy },]
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimePageComponent);
        component = fixture.componentInstance;


        component.initialTime = new Date();
        imageTransferService = TestBed.inject(ImageTransferService);
        imageTransferService.diff = [{ points: [0, 4, 8] }];
        imageTransferService.img1 = imagePath0Diff;
        imageTransferService.img2 = imagePath2Diff;

        blinkerServiceMock = TestBed.inject(BlinkerService) as jasmine.SpyObj<BlinkerService>;
        blinkerServiceMock.init = jasmine.createSpy('init').and.callFake(() => {});

        cheatModeServiceMock = TestBed.inject(CheatModeService) as jasmine.SpyObj<CheatModeService>;
        cheatModeServiceMock.startBlink = jasmine.createSpy('startBlink').and.callFake(() => {});
        cheatModeServiceMock.stopBlink = jasmine.createSpy('stopBlink').and.callFake(() => {});

        differencesDetectionServiceMock = TestBed.inject(DifferencesDetectionService) as jasmine.SpyObj<DifferencesDetectionService>;
        differencesDetectionServiceMock.setDifference = jasmine.createSpy('setDifference').and.callFake(() => {});

        gameInfoServiceMock = TestBed.inject(GameInfoService) as jasmine.SpyObj<GameInfoService>;
        gameInfoServiceMock.username = 'test';
        gameInfoServiceMock.username2 = 'test2';

        timer = TestBed.createComponent(ChronometreComponent);
        timerInstance = timer.componentInstance;
        component.timer = timerInstance;
        component.timer.startCountDownFrom = jasmine.createSpy('startCountDownFrom').and.callFake(() => {});

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call the correct function', () => {
        const spyCardSetup = spyOn(component, 'cardQueueSetup');
        const spyChangeImage = spyOn(component, 'changeImage');
        const spyDefailtInit = spyOn(component, 'defaultInit');

        component.ngAfterViewInit();
        expect(spyCardSetup).toHaveBeenCalled();
        expect(spyChangeImage).toHaveBeenCalled();
        expect(spyDefailtInit).toHaveBeenCalled();


    });

    it('ngAfterViewInit should set isCoop to true if more than one player', () => {
        component['gameInfo'].CoopUsername = ['test', 'test2'];
        component.ngAfterViewInit();
        expect(component.isCoop).toEqual(true);
    });

    it('card queue service should call getNext()', () => {
        const getNextSpy = jasmine.createSpy('getNext').and.callFake(() => {});
        component['cardQueueService'].getNext = getNextSpy;
        component.cardQueueSetup();
        expect(getNextSpy).toHaveBeenCalled();

    });
    it('defaultInit should differencesDetectionService resetFound', () => {
        const resetFoundSpy = jasmine.createSpy('resetFound').and.callFake(() => {});
        component['differencesDetectionService'].resetFound = resetFoundSpy;
        component.defaultInit();
        expect(component['differencesDetectionService'].resetFound).toHaveBeenCalled();
    });

    it('defaultInit should differencesDetectionService resetCount', () => {
        const resetCountSpy = jasmine.createSpy('resetCount').and.callFake(() => {});
        component['differencesDetectionService'].resetCount = resetCountSpy;
        component.defaultInit();
        expect(component['differencesDetectionService'].resetCount).toHaveBeenCalled();
    });
    it('changeImage should change the image', async () => {


        component.img2src = '../../../assets/image_tests/image_0_diff.bmp';
        const spyCreateBitmap = spyOn(window, 'createImageBitmap').and.callThrough();

        await component.changeImage();

        const image = new Image();
        let imageBitmap: ImageBitmap;
        image.src = '../../../assets/image_tests/image_0_diff.bmp';
        image.onload = async () => {
            imageBitmap = await createImageBitmap(image);
            expect(component.img2).toEqual(imageBitmap);


        };


        expect(spyCreateBitmap).toHaveBeenCalled();
    });

    it('canvas to url should call cdref detect changes', () => {
        const spyDetectChanges = spyOn(component['cdRef'], 'detectChanges').and.callThrough();
        component.canvasToUrl(component.canvas1, component.canvas2);
        expect(spyDetectChanges).toHaveBeenCalled();

    });


    it('ng on Destroy should call cheatModeStopBlink', () => {
        const stopBlinkSpy = jasmine.createSpy('stopBlink').and.callFake(() => {});
        component['cheatModeService'].stopBlink = stopBlinkSpy;
        component.ngOnDestroy();
        expect(stopBlinkSpy).toHaveBeenCalled();


    });
    it('endGame should call stop blink', () => {

        const stopBlinkSpy = jasmine.createSpy('stopBlink').and.callFake(() => {});
        component['cheatModeService'].stopBlink = stopBlinkSpy;
        component.endGame(true);
        expect(stopBlinkSpy).toHaveBeenCalled();



    })
    it('endGame should stop timer', () => {


        const stopTimerSpy = jasmine.createSpy('stopTimer').and.callFake(() => {});
        component.timer.stop = stopTimerSpy;
        component.endGame(true);
        expect(stopTimerSpy).toHaveBeenCalled();

    });
    it('endGame should change game ended to true', () => {
        component.endGame(true);
        expect(component.gameEnded).toEqual(true);

    });

    it('cheat mode should activate when t is pressed', () => {

        const event1 = new KeyboardEvent('keydown', { key: 't' });
        component.keydownHandler(event1);


        expect(component.cheatMode).toEqual(true);

    });
    it('cheat mode should blink activate when t is pressed', () => {

        const event1 = new KeyboardEvent('keydown', { key: 't' });
        const spyBlink = jasmine.createSpy('startBlink').and.callFake(() => {});
        component['cheatModeService'].startBlink = spyBlink;
        component.keydownHandler(event1);



        expect(spyBlink).toHaveBeenCalled();


    });
    it('on continue should call endGame', () => {
        const endGameSpy = jasmine.createSpy('endGame').and.callFake(() => {});
        component.endGame = endGameSpy;
        const eventData = { quit: true, message: 'Êtes-vous sûr de quitter la partie ?' }
        component.onContinue(eventData);
        expect(endGameSpy).toHaveBeenCalled();
    });








});
