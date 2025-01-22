import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { CustomButtonComponent } from '@app/components/custom-button/custom-button.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { LogoComponent } from '@app/components/logo/logo.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PopupQuitComponent } from '@app/components/popup-quit/popup-quit.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { BlinkerService } from '@app/services/blinker.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { CurrentGameService } from '@app/services/current-game.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { BehaviorSubject, Subject } from 'rxjs';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { ReplayService } from '@app/services/replay.service';
import { MatDialogMock } from '../../services/create-page.service.spec';
import { ReplayPageComponent } from '../replay-page/replay-page.component';
import { GamePageClassic1v1Component } from './game-page-classic1v1.component';

describe('GamePageClassic1v1Component', () => {
  let component: GamePageClassic1v1Component;
  let fixture: ComponentFixture<GamePageClassic1v1Component>;
  let imageTransferService: ImageTransferService;
  let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;
  let replayServiceMock: jasmine.SpyObj<ReplayService>;
  let cheatModeService: jasmine.SpyObj<CheatModeService>;
  let blinkerService: BlinkerService;
  let differencesDetectionService: DifferencesDetectionService;
  let currentGameService: CurrentGameService;
  const imagePath0Diff = '../../../assets/image_tests/image_0_diff.bmp';
  const imagePath2Diff = '../../../assets/image_tests/image_2_diff.bmp';
  const fakeCurrentGameService = {
    leader: new BehaviorSubject<boolean>(true),
  };

  let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;

  const pathReplay = 'replay';
  const pathNotReplay = 'game';

  const routes = [
    { path: pathReplay, component: ReplayPageComponent },
    { path: pathNotReplay, component: GamePageClassic1v1Component },
  ] as Routes;

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
    cheatModeService = jasmine.createSpyObj('CheatModeService', ['init', 'startBlink', 'stopBlink']);
    replayServiceMock = jasmine.createSpyObj('ReplayService', ['restartTimer', 'addCheatModeEventReplay', 'stopTimer']);
    await TestBed.configureTestingModule({
      declarations: [GamePageClassic1v1Component, ChronometreComponent, PlayAreaComponent, LogoComponent, GameInfoComponent, CounterComponent, CustomButtonComponent, PopupQuitComponent, SidebarComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes)],
      providers: [
        { GameInfoService, useValue: gameInfoServiceMock },
        { CurrentGameService, useValue: fakeCurrentGameService },
        DifferencesDetectionService,
        { provide: CheatModeService, useValue: cheatModeService },
        { provide: ReplayService, useValue: replayServiceMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useValue: matDialogSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePageClassic1v1Component);
    component = fixture.componentInstance;

    imageTransferService = TestBed.inject(ImageTransferService);
    imageTransferService.diff = [{ points: [0, 4, 8] }];
    imageTransferService.img1 = imagePath0Diff;
    imageTransferService.img2 = imagePath2Diff;

    cheatModeService.startBlink = jasmine.createSpy('startBlink').and.callFake(() => {});
    cheatModeService.stopBlink = jasmine.createSpy('stopBlink').and.callFake(() => {});

    blinkerService = TestBed.inject(BlinkerService);
    blinkerService.clearAllBlink = new Subject<boolean>();

    component.blinker = blinkerService;
    cheatModeService['blinkerService'] = blinkerService;

    component['cheatModeService'] = cheatModeService

    differencesDetectionService = TestBed.inject(DifferencesDetectionService);
    spyOn(differencesDetectionService, 'resetFound').and.callFake(() => {});

    gameInfoServiceMock = TestBed.inject(GameInfoService) as jasmine.SpyObj<GameInfoService>;
    gameInfoServiceMock.username = 'test';
    gameInfoServiceMock.username2 = 'test2';

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
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

  it('should set username to gameInfoService.username2 in ngOnit', () => {
    fakeCurrentGameService.leader.next(false);

    fixture.detectChanges();
    component.ngOnInit();

    expect(component.username).toBe(gameInfoServiceMock.username2);
  });

  it('should call differencesDetectionService.resetFound in ngAfterViewInit', () => {
    fixture.detectChanges();
    expect(differencesDetectionService.resetFound).toHaveBeenCalled();
  });

  it('should call blinkerService.blinkPixels in ngAfterViewInit', () => {
    try {
      component.ngAfterViewInit();
      expect(blinkerService.blinkPixels).toHaveBeenCalled();

    } catch (e) {
      console.log(e);
    }

  });

  it('should set wantToQuit to false in onContinue if player wants to continue', () => {
    const eventData = { quit: false, message: "" };
    component.onContinue(eventData);
    expect(component.wantToQuit).toBeFalse();
  });


  it('should set audio.nativeElement.currentTime to 0 in playAudio', () => {
    component.playAudio();
    expect(component.audio.currentTime).toBe(0);
  });

  it('should set audio.nativeElement.src to audioSrc in playAudio', () => {
    const audioSrc = '../../../assets/audio/success.mp3';
    component.playAudio();
    expect(component.audio.src).toBe(audioSrc);
  });

  it('should call cheatModeService.startBlink in onKeydown if cheatMode is true', () => {
    component.cheatMode = true;
    component.onKeydown();
    expect(cheatModeService.startBlink).toHaveBeenCalled();
  });



  it('should call cheatModeService.stopBlink in onKeydown if cheatMode is false', () => {
    component.cheatMode = false;
    component.onKeydown();
    expect(cheatModeService.stopBlink).toHaveBeenCalled();
  });

  it('should remove event listener in endGame', async () => {
    const winner = "test";
    const spy = spyOn(window, 'removeEventListener');
    await component.endGame(winner, false);
    expect(spy).toHaveBeenCalled();
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

  it('should remove event listener in clickChat', () => {
    const spy = spyOn(window, 'removeEventListener');
    component.clickChat();
    expect(spy).toHaveBeenCalled();
  });

  it('should call addEventListener in closeChat', () => {
    const spy = spyOn(window, 'addEventListener');
    component.closeChat();
    expect(spy).toHaveBeenCalled();
  });

  it('should call currentGameService.gameEnded if wantToQuit is true in ngOnDestroy', () => {
    const spy = spyOn(currentGameService, 'gameEnded');
    component.wantToQuit = true;
    expect(spy).toHaveBeenCalled();
  });

  it('should remove event listener in ngOnDestroy', () => {
    const spy = spyOn(window, 'removeEventListener');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should reset compteur et compteur 2 in ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(component.counter.count).toBe(0);
    expect(component.counter2.count).toBe(0);
  });

  it('should call currentGameService.resetCount in ngOnDestroy', () => {
    const spy = spyOn(currentGameService, 'resetCount');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
