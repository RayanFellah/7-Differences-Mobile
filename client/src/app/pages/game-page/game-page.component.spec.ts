import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Routes } from '@angular/router';
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
import { ReplayService } from '@app/services/replay.service';
import { ReplayPageComponent } from '../replay-page/replay-page.component';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let imageTransferService: ImageTransferService;
    let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;
    let blinkerServiceMock: jasmine.SpyObj<BlinkerService>;
    let cheatModeServiceMock: jasmine.SpyObj<CheatModeService>;
    let differencesDetectionServiceMock: jasmine.SpyObj<DifferencesDetectionService>;
    let replayServiceMock: jasmine.SpyObj<ReplayService>;

    const imagePath0Diff = '../../../assets/image_tests/image_0_diff.bmp';
    const imagePath2Diff = '../../../assets/image_tests/image_2_diff.bmp';
    let chronometreSpy: jasmine.SpyObj<ChronometreComponent>;

    const pathReplay = 'replay';
    const pathNotReplay = 'game';

    const routes = [
        { path: pathReplay, component: ReplayPageComponent },
        { path: pathNotReplay, component: GamePageComponent },
    ] as Routes;

    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, ChronometreComponent, PlayAreaComponent, LogoComponent, GameInfoComponent, CounterComponent, CustomButtonComponent, PopupQuitComponent, SidebarComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes(routes)
            ],
            providers: [
                { GameInfoService, useValue: gameInfoServiceMock },
                { DifferencesDetectionService, useValue: differencesDetectionServiceMock },
                { CheatModeService, useValue: cheatModeServiceMock },
                { BlinkerService, useValue: blinkerServiceMock },
                { ReplayService, useValue: replayServiceMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
        fixture = TestBed.createComponent(GamePageComponent);
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

        chronometreSpy = jasmine.createSpyObj('ChronometreComponent', ['interval', 'stop']);
        component.timer = chronometreSpy;

        replayServiceMock = TestBed.inject(ReplayService) as jasmine.SpyObj<ReplayService>;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set link1 to imageTransferService.link1 in ngOnit', () => {
        component.ngOnInit();
        expect(component.link1).toBe(imageTransferService.link1);
    });

    it('should set img1src to imageTransferService.img1 in ngOnit', () => {
        component.ngOnInit();
        expect(component.img1src).toBe(imageTransferService.img1);
    });

    it('should set link2 to imageTransferService.link2 in ngOnit', () => {
        component.ngOnInit();
        expect(component.link2).toBe(imageTransferService.link2);
    });

    it('should set img2src to imageTransferService.img2 in ngOnit', () => {
        component.ngOnInit();
        expect(component.img2src).toBe(imageTransferService.img2);
    });

    it('should call differencesDetectionService.setDifference in ngOnInit', () => {
        component.ngOnInit();
        expect(differencesDetectionServiceMock.setDifference).toHaveBeenCalled();
    });

    it('should set wantToQuit to false in onContinue if player wants to continue', () => {
        const eventData = { quit: false, message: "" };
        component.onContinue(eventData);
        expect(component.wantToQuit).toBeFalse();
    });

    it('should call onKeydown in keydownHandler if t was pressed', () => {
        const spy = spyOn(component, 'onKeydown');
        const keydownEvent = new KeyboardEvent('keydown', { key: 't' });
        component.keydownHandler(keydownEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should not call onKeydown in keydownHandler if t was not pressed', () => {
        const spy = spyOn(component, 'onKeydown');
        const keydownEvent = new KeyboardEvent('keydown', { key: 'a' });
        component.keydownHandler(keydownEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should remove event listener in ngOnDestroy', () => {
        const spy = spyOn(window, 'removeEventListener');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });

    it('should end the game', async () => {
        await component.endGame(true);
        expect(component.gameEnded).toBeTruthy();
    });

    it('endGame should stop the timer', async () => {
        const stopSpy = spyOn(component.timer, 'stop');
        await component.endGame(true);
        expect(stopSpy).toHaveBeenCalled();
    });

    it('onContinue should set wantToQuit to false if quit is false', () => {
        const eventData = { quit: false, message: "" };
        component.onContinue(eventData);
        expect(component.wantToQuit).toBeFalsy();
    });

    it('onContinue should set wantToQuit to true if quit is true', () => {
        const eventData = { quit: true, message: "" };
        component.onContinue(eventData);
        expect(component.wantToQuit).toBeTruthy();
    });
});
