import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickHistoryService } from '@app/services/click-history.service';
import { ControlVideoToolComponent, videoTool } from '../control-video-tool/control-video-tool.component';
import { ControlVideoComponent } from './control-video.component';

describe('ControlVideoComponent', () => {
  let component: ControlVideoComponent;
  let fixture: ComponentFixture<ControlVideoComponent>;
  let clickHistoryServiceMock: jasmine.SpyObj<ClickHistoryService>;

  beforeEach(async () => {
    clickHistoryServiceMock = jasmine.createSpyObj('ClickHistoryService', ['startTimer', 'stopTimer', 'interval']);
    await TestBed.configureTestingModule({
      declarations: [ControlVideoComponent, ControlVideoToolComponent],
      providers: [{ provide: ClickHistoryService, useValue: clickHistoryServiceMock }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ControlVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emitplay should call the correct function if its not already playing', () => {
    component.currentControl = videoTool.pause;
    spyOn(component.videoToolEmitter, 'emit');
    component.emitPlay();
    expect(component.videoToolEmitter.emit).toHaveBeenCalledWith(videoTool.play);
    expect(clearInterval).toHaveBeenCalledWith(clickHistoryServiceMock.interval);
    expect(clickHistoryServiceMock.startTimer).toHaveBeenCalled();
  })

  it('emitPause should call the correct function if its not already paused', () => {
    component.currentControl = videoTool.play;
    spyOn(component.videoToolEmitter, 'emit');
    component.emitPause();
    expect(component.videoToolEmitter.emit).toHaveBeenCalledWith(videoTool.pause);
    expect(clearInterval).toHaveBeenCalledWith(clickHistoryServiceMock.interval);
  });

  it('emitRestart should call the correct function', () => {
    spyOn(component.videoToolEmitter, 'emit');
    component.emitRestart();
    expect(component.videoToolEmitter.emit).toHaveBeenCalledWith(videoTool.restart);
    expect(clickHistoryServiceMock.stopTimer).toHaveBeenCalled();
    expect(clickHistoryServiceMock.startTimer).toHaveBeenCalled();
  });

  it('emitForwardTwo should call the correct function if its not already playing at 2x', () => {
    component.currentControl = videoTool.play;
    spyOn(component.videoToolEmitter, 'emit');
    component.emitForwardTwo();
    expect(component.videoToolEmitter.emit).toHaveBeenCalledWith(videoTool.forwardTwo);
    expect(clearInterval).toHaveBeenCalledWith(clickHistoryServiceMock.interval);
    expect(clickHistoryServiceMock.startTimer).toHaveBeenCalledWith(50);
  });

  it('emitForwardFour should call the correct function if its not already playing at 4x', () => {
    component.currentControl = videoTool.play;
    spyOn(component.videoToolEmitter, 'emit');
    component.emitForwardFour();
    expect(component.videoToolEmitter.emit).toHaveBeenCalledWith(videoTool.forwardFour);
    expect(clearInterval).toHaveBeenCalledWith(clickHistoryServiceMock.interval);
    expect(clickHistoryServiceMock.startTimer).toHaveBeenCalledWith(25);
  });
});
