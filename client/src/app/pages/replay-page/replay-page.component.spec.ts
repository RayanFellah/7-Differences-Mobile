import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClickEventDescription } from '@app/classes/click-event-description';
import { EventDescription } from '@app/classes/event-description';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { ClueComponent } from '@app/components/clue/clue.component';
import { ControlVideoToolComponent, videoTool } from '@app/components/control-video-tool/control-video-tool.component';
import { ControlVideoComponent } from '@app/components/control-video/control-video.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { BlinkerService } from '@app/services/blinker.service';
import { ClickHistoryService } from '@app/services/click-history.service';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { ReplayService } from '@app/services/replay.service';
import { constsClue } from '@common/consts';
import { Subject } from 'rxjs';
import { GamePageClassic1v1Component } from '../game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from '../game-page/game-page.component';
import { MainPageComponent } from '../main-page/main-page.component';
import { ReplayPageComponent } from './replay-page.component';

describe('ReplayPageComponent', () => {
  let component: ReplayPageComponent;
  let fixture: ComponentFixture<ReplayPageComponent>;
  let clickHistoryServiceMock: jasmine.SpyObj<ClickHistoryService>;
  let replayServiceMock: jasmine.SpyObj<ReplayService>;
  let gamePageMock: jasmine.SpyObj<GamePageComponent>;
  let gamePage1v1Mock: jasmine.SpyObj<GamePageClassic1v1Component>;
  let chronoMock: jasmine.SpyObj<ChronometreComponent>;
  let blinkerMock: jasmine.SpyObj<BlinkerService>;
  let sideBarMock: jasmine.SpyObj<SidebarComponent>;
  let counterMock: jasmine.SpyObj<CounterComponent>;
  let cluesMock: jasmine.SpyObj<ClueComponent>;
  let router: Router;
  beforeEach(async () => {
    clickHistoryServiceMock = jasmine.createSpyObj('ClickHistoryService', ['incremented', 'startTimer', 'clickHistory', 'reinit']);
    replayServiceMock = jasmine.createSpyObj('ReplayService', ['isSolo']);
    chronoMock = jasmine.createSpyObj('ChronometreComponent', ['startTimer', 'stop']);
    blinkerMock = jasmine.createSpyObj('BlinkerComponent', ['clearAllBlink']);
    sideBarMock = jasmine.createSpyObj('SideBarComponent', ['messenger']);
    counterMock = jasmine.createSpyObj('CounterComponent', ['reset']);
    cluesMock = jasmine.createSpyObj('ClueComponent', ['nClues']);
    gamePageMock = jasmine.createSpyObj('GamePageComponent', ['restartTimer', 'initialiseGame']);
    gamePage1v1Mock = jasmine.createSpyObj('GamePageClassic1v1Component', ['restartTimer', 'initialiseGame']);
    await TestBed.configureTestingModule({
      declarations: [ReplayPageComponent, ControlVideoComponent, ControlVideoToolComponent],
      imports: [RouterTestingModule.withRoutes([{ path: 'home', component: MainPageComponent }]), HttpClientTestingModule],
      providers: [
        { provide: ClickHistoryService, useValue: clickHistoryServiceMock },
        { provide: ReplayService, useValue: replayServiceMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: GamePageComponent, useValue: gamePageMock },
        { provide: GamePageClassic1v1Component, useValue: gamePage1v1Mock }],
    })
      .compileComponents();
    router = TestBed.inject(Router);
    router.initialNavigation();
    fixture = TestBed.createComponent(ReplayPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });


  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit should call the correct function', () => {
    const spy = spyOn(component, 'changeCurrentEvent');
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalled();
    expect(clickHistoryServiceMock.startTimer).toHaveBeenCalled();
    expect(clickHistoryServiceMock.incremented).not.toBeNull();
    expect(clickHistoryServiceMock.incremented.closed).toBeFalsy();
  });

  it('ngAfterViewInit should set gamepagelem to gamepage if issolo is true', () => {
    replayServiceMock.isSolo = true;
    spyOn(component, 'playEvents');
    component.ngAfterViewInit();
    expect(component.gamePageElem).toEqual(component.gamePage);
  });

  it('ngAfterViewInit should set gamepagelem to gamepage1v1 if issolo is false', () => {
    replayServiceMock.isSolo = false;
    spyOn(component, 'playEvents');
    component.ngAfterViewInit();
    expect(component.gamePageElem).toEqual(component.gamePage1v1);
  });

  it('should call playEvents in the subscribe', () => {
    const spy = spyOn(component, 'playEvents');
    component.ngAfterViewInit();
    clickHistoryServiceMock.incremented.next(2);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('playEvents should call changeCurrentEvent and play', () => {
    component.currentEvent = new ClickEventDescription(2, 0, 0);
    spyOn(component, 'changeCurrentEvent').and.callThrough();
    const spyPlay = spyOn(component.currentEvent, 'play');
    component.playEvents(2);

    expect(spyPlay).toHaveBeenCalled();
    expect(component.changeCurrentEvent).toHaveBeenCalled();
  });

  it('changeCurrentEvent should change the current event and the indexevent', () => {
    component.indexEvent = 0;
    const event = { time: 2, play: () => {} };
    clickHistoryServiceMock.clickHistory[0] = event;
    component.changeCurrentEvent();
    expect(component.indexEvent).toEqual(1);
    expect(component.currentEvent).toEqual(event);
  });

  it('updateChrono called with videoTool.play should clear the interval and startTimer of gamepage timer ', () => {
    component.gamePageElem.timer = chronoMock;

    component.updateChrono(videoTool.play);
    expect(chronoMock.startTimer).toHaveBeenCalled();

    expect(clearInterval).toHaveBeenCalled();
  });

  it('updateChrono called with videoTool.pause should clear the interval and stopTimer of gamepage timer ', () => {
    component.gamePageElem.timer = chronoMock;

    component.updateChrono(videoTool.pause);

    expect(clearInterval).toHaveBeenCalled();
  });

  it('updateChrono called with videoTool.restart should call restartControlBehaviour ', () => {
    const spy = spyOn(component, 'restartControlBehaviour');
    component.updateChrono(videoTool.restart);
    expect(spy).toHaveBeenCalled();
  });

  it('updateChrono called with videoTool.forwardtWO should call clear the interval and start timer of gamepage ', () => {
    component.gamePageElem.timer = chronoMock;
    component.updateChrono(videoTool.forwardTwo);

    expect(clearInterval).toHaveBeenCalled();
    expect(chronoMock.startTimer).toHaveBeenCalledWith(500);
  });

  it('updateChrono called with videoTool.forwardFour should call clear the interval and start timer of gamepage ', () => {
    component.gamePageElem.timer = chronoMock;
    component.updateChrono(videoTool.forwardFour);

    expect(clearInterval).toHaveBeenCalled();
    expect(chronoMock.startTimer).toHaveBeenCalledWith(250);
  });

  it('restartControlBehaviour should call the right function if gamepagelem is an instance of gamepage', () => {
    component.gamePageElem = gamePageMock;
    component.gamePage = gamePageMock;
    component.gamePageElem.timer = chronoMock;
    component.gamePageElem.blinker = blinkerMock;
    component.gamePageElem.sidebar = sideBarMock;
    component.gamePageElem.counter = counterMock;
    component.gamePageElem.clues = cluesMock;
    blinkerMock.clearAllBlink = new Subject<boolean>();
    const spyClearAllBlink = spyOn(blinkerMock.clearAllBlink, 'next');
    spyOn(component, 'changeCurrentEvent');
    spyOn(component, 'loadImage1');
    spyOn(component, 'loadImage2');

    component.restartControlBehaviour();

    expect(chronoMock.stop).toHaveBeenCalled();
    expect(chronoMock.chrono).toEqual('00:00');
    expect(spyClearAllBlink).toHaveBeenCalledWith(true);
    expect(cluesMock.nClues).toEqual(constsClue.N_CLUES)
    expect(sideBarMock.messenger.messages).toEqual([]);
    expect(counterMock.reset).toHaveBeenCalled();
    expect(component.gamePageElem.initialiseGame).toHaveBeenCalled();
    expect(component.loadImage1).toHaveBeenCalled();
    expect(component.loadImage2).toHaveBeenCalled();
    expect(chronoMock.startTimer).toHaveBeenCalled();
    expect(component.indexEvent).toEqual(0);
    expect(component.changeCurrentEvent).toHaveBeenCalled();

  });

  it('loadImage1 should correctly set img1 of gamepageElem', async () => {
    component.gamePageElem = gamePageMock;
    component.gamePage = gamePageMock;
    component.gamePageElem.img1src = '../../../assets/image_tests/image_0_diff.bmp';
    const spyCreateBitmap = spyOn(window, 'createImageBitmap').and.callThrough();

    await component.loadImage1();

    const image = new Image();
    let imageBitmap: ImageBitmap;
    image.src = '../../../assets/image_tests/image_0_diff.bmp';
    image.onload = async () => {
      imageBitmap = await createImageBitmap(image);
      expect(component.gamePageElem.img1).toEqual(imageBitmap);
    };

    expect(spyCreateBitmap).toHaveBeenCalled();
  });

  it('loadImage2 should correctly set img2 of gamepageElem', async () => {
    component.gamePageElem = gamePageMock;
    component.gamePage = gamePageMock;
    component.gamePageElem.img2src = '../../../assets/image_tests/image_0_diff.bmp';
    const spyCreateBitmap = spyOn(window, 'createImageBitmap').and.callThrough();
    await component.loadImage2();

    const image = new Image();
    let imageBitmap: ImageBitmap;
    image.src = '../../../assets/image_tests/image_0_diff.bmp';
    image.onload = async () => {
      imageBitmap = await createImageBitmap(image);
      expect(component.gamePageElem.img2).toEqual(imageBitmap);
    };

    expect(spyCreateBitmap).toHaveBeenCalled();
  });



  it('openDialogEndReplay should call opendialog', () => {
    spyOn(PopupTextComponent, 'openDialog');
    component.openDialogEndReplay();
    expect(PopupTextComponent.openDialog).toHaveBeenCalled();
  });

  it('endGameCallback should call closeAll and emitRestart', () => {
    spyOn(component['dialogRef'], 'closeAll');
    const button = document.createElement('button');
    button.innerHTML = 'Rejouer';
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: button });

    const feedback = {
      event: event,
      name: 'test',
      radius: 3,
    };
    spyOn(component.controlBar, 'emitRestart');
    component.endGameCallback(feedback);

    expect(component['dialogRef'].closeAll).toHaveBeenCalled();
    expect(component.controlBar.emitRestart).toHaveBeenCalled();
  });

  it('endGameCallback should call navigate to home if rejouer is not clicked', () => {
    spyOn(component['dialogRef'], 'closeAll');
    const button = document.createElement('button');
    button.innerHTML = 'test';
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: button });

    const feedback = {
      event: event,
      name: 'test',
      radius: 3,
    };
    spyOn(component.controlBar, 'emitRestart');
    spyOn(router, 'navigate');
    component.endGameCallback(feedback);

    expect(component['dialogRef'].closeAll).toHaveBeenCalled();
    expect(component.controlBar.emitRestart).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });



  it('ngOnDestroy should call the right function and reinitialise the correct values', () => {
    const object = {} as EventDescription;
    component.ngOnDestroy();
    expect(component.indexEvent).toEqual(0);
    expect(component.currentEvent).toEqual(object);
    expect(clickHistoryServiceMock.incremented.closed).toBeTruthy();
    expect(clickHistoryServiceMock.reinit).toHaveBeenCalled();
  });
});
