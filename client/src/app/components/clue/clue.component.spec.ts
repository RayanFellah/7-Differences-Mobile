import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReplayPageComponent } from '@app/pages/replay-page/replay-page.component';
import { ClueService } from '@app/services/clue.service';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { ChronometreComponent } from '../chronometre/chronometre.component';
import { PlayAreaComponent } from '../play-area/play-area.component';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { ClueComponent } from './clue.component';

describe('ClueComponent', () => {
  let component: ClueComponent;
  let fixture: ComponentFixture<ClueComponent>;
  let clueServiceSpy: jasmine.SpyObj<ClueService>;
  let leftPlayArea: ComponentFixture<PlayAreaComponent>;
  let rightPlayArea: ComponentFixture<PlayAreaComponent>;
  let leftPlayAreaInstance: PlayAreaComponent;
  let rightPlayAreaInstance: PlayAreaComponent;
  let timer: ComponentFixture<ChronometreComponent>;
  let timerInstance: ChronometreComponent;
  let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;

  const pathReplay = 'replay';
  const pathClues = 'clues';

  const routes = [
    { path: pathReplay, component: ReplayPageComponent },
    { path: pathClues, component: ClueComponent },
  ] as Routes;

  beforeEach(() => {
    clueServiceSpy = jasmine.createSpyObj('ClueService', [
      'updateLeftPlayAreaCoord',
      'updateRightPlayAreaCoord',
      'setPlayAreas',
      'sendMessage',
      'sendClue1And2Random',
      'startClue3Interval',
      'stopClue3Interval'
    ]);
  });

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [ClueComponent, PlayAreaComponent, ChronometreComponent],
      providers: [
        { provide: ClueService, useValue: clueServiceSpy },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useValue: matDialogSpy },
        HttpClient,
        HttpHandler,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ClueComponent);
    component = fixture.componentInstance;
    component.clueService = clueServiceSpy;
    leftPlayArea = TestBed.createComponent(PlayAreaComponent);
    rightPlayArea = TestBed.createComponent(PlayAreaComponent);
    leftPlayAreaInstance = leftPlayArea.componentInstance;
    rightPlayAreaInstance = rightPlayArea.componentInstance;
    timer = TestBed.createComponent(ChronometreComponent);
    timerInstance = timer.componentInstance;
    component.leftPlayArea = leftPlayAreaInstance;
    component.rightPlayArea = rightPlayAreaInstance;
    component.timer = timerInstance;
    component.timer.applyPenalty = jasmine.createSpy('applyPenalty').and.callFake(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call window.addEventListener in ngOnInit', () => {
    const addEventListenerSpy = spyOn(window, 'addEventListener');
    component.ngOnInit();
    expect(addEventListenerSpy).toHaveBeenCalled();
  });

  it('should call updateCoord1 and updateCoord2in the subscribe of play1.coord and play2.coord in ngOnInit', () => {
    component.ngOnInit();
    component.leftPlayArea.coord.next({ x: 0, y: 0 });
    expect(clueServiceSpy.updateLeftPlayAreaCoord).toHaveBeenCalled();
    expect(clueServiceSpy.updateRightPlayAreaCoord).toHaveBeenCalled();
  });

  it('should call setPlayAreas in ngOnInit', () => {
    component.ngOnInit();
    expect(clueServiceSpy.setPlayAreas).toHaveBeenCalled();
  });

  it('should return clueService in get clueServiceGetter', () => {
    expect(component.clueService).toBe(clueServiceSpy);
  });

  it('should set clueService in set clueServiceSetter', () => {
    component.clueService = clueServiceSpy;
    expect(component.clueService).toBe(clueServiceSpy);
  });

  it('should call sendClue in keydownHandler', () => {
    const sendClueSpy = spyOn(component, 'sendClue');
    const nClues = 3;
    component.nClues = nClues;
    const event = new KeyboardEvent('keydown', { key: 'i' });
    window.dispatchEvent(event);
    expect(sendClueSpy).toHaveBeenCalled();
  });

  it('should not call sendClue in keydownHandler if nClues is 0', () => {
    const sendClueSpy = spyOn(component, 'sendClue');
    const nClues = 0;
    component.nClues = nClues;
    const event = new KeyboardEvent('keydown', { key: 'i' });
    window.dispatchEvent(event);
    expect(sendClueSpy).not.toHaveBeenCalled();
  });

  it('should not sendClue if i is not pressed', () => {
    const sendClueSpy = spyOn(component, 'sendClue');
    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);
    expect(sendClueSpy).not.toHaveBeenCalled();
  });

  it('should call sendMessage in sendClue', () => {
    component.sendClue();
    expect(clueServiceSpy.sendMessage).toHaveBeenCalled();
  });

  it('should call timer.applyPenalty in sendClue', () => {
    component.sendClue();
    expect(component.timer.applyPenalty).toHaveBeenCalled();
  });

  it('should call sendClue1And2Random in sendClue if nClues is 3', () => {
    const nClues = 3;
    component.nClues = nClues;
    component.sendClue();
    expect(clueServiceSpy.sendClue1And2Random).toHaveBeenCalled();
  });

  it('should call startClue3Interval in sendClue if nClues is 1', () => {
    const nClues = 1;
    component.nClues = nClues;
    component.sendClue();
    expect(clueServiceSpy.startClue3Interval).toHaveBeenCalled();
  });

  it('should call window.removeEventListener in removeEventListener', () => {
    const removeEventListenerSpy = spyOn(window, 'removeEventListener');
    component.ngOnDestroy();
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should call removeEventListener in ngOnDestroy', () => {
    const removeEventListenerSpy = spyOn(component, 'removeEventListener');
    component.ngOnDestroy();
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should call ClueService.stopClue3 in ngOnDestroy if clueService.isIntervalActive is true', () => {
    clueServiceSpy.isIntervalActive = true;
    component.ngOnDestroy();
    expect(clueServiceSpy.stopClue3Interval).toHaveBeenCalled();
  });
});
