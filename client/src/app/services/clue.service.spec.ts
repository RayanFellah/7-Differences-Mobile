import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';

import { ElementRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ClueComponent } from '@app/components/clue/clue.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Difference } from '@app/interfaces/difference';
import { constsClue, constsSoundSpeed } from '@common/consts';
import { Observable } from 'rxjs/internal/Observable';
import { ClueService } from './clue.service';
import { DifferencesDetectionService } from './differences-detection.service';
import { ReplayService } from './replay.service';
import { SocketService } from './socket.service';

describe('ClueService', () => {
  let service: ClueService;
  let differencesDetectionServiceSpy: jasmine.SpyObj<DifferencesDetectionService>;
  let socketServiceSpy: jasmine.SpyObj<SocketService>;
  let replayServiceSpy: jasmine.SpyObj<ReplayService>;
  let leftPlayArea: ComponentFixture<PlayAreaComponent>;
  let rightPlayArea: ComponentFixture<PlayAreaComponent>;
  let leftPlayAreaInstance: PlayAreaComponent;
  let rightPlayAreaInstance: PlayAreaComponent;

  beforeEach(() => {
    socketServiceSpy = jasmine.createSpyObj('SocketService', ['listen', 'emit']);
    differencesDetectionServiceSpy = jasmine.createSpyObj('DifferencesDetectionService', ['difference']);
    replayServiceSpy = jasmine.createSpyObj('ReplayService', ['addClueFrameEventReplay', 'addClueSoundEventReplay']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PlayAreaComponent, ClueComponent],
      providers: [
        { provide: SocketService, useValue: socketServiceSpy },
        { provide: DifferencesDetectionService, useValue: differencesDetectionServiceSpy },
        { provide: ReplayService, useValue: replayServiceSpy }
      ],
    });
    leftPlayArea = TestBed.createComponent(PlayAreaComponent);
    rightPlayArea = TestBed.createComponent(PlayAreaComponent);
    leftPlayAreaInstance = leftPlayArea.componentInstance;
    rightPlayAreaInstance = rightPlayArea.componentInstance;
    differencesDetectionServiceSpy.difference.subscribe = jasmine.createSpy('subscribe').and.returnValue(
      new Observable((sub) => {
        sub.next({ diffArray: [{ points: [] }] });
      }),
    );
    (socketServiceSpy.listen as jasmine.Spy).and.returnValue(
      new Observable((sub) => {
        sub.next({ validation: true });
      })
    );
    (socketServiceSpy.emit as jasmine.Spy).and.returnValue({});
    service = TestBed.inject(ClueService);
    service['differencesDetectionService'] = differencesDetectionServiceSpy;
    service.setPlayAreas(leftPlayAreaInstance, rightPlayAreaInstance);
    service.leftPlayArea.clueZone = new ElementRef(document.createElement('div'));
    service.rightPlayArea.clueZone = new ElementRef(document.createElement('div'));
    service.leftPlayArea.canvas = new ElementRef(document.createElement('canvas'));
    service.rightPlayArea.canvas = new ElementRef(document.createElement('canvas'));
    service.audio = new Audio();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe to differencesDetectionService.difference', () => {
    expect(differencesDetectionServiceSpy.difference.subscribe).toHaveBeenCalled();
  });

  it('should set isIntervalActive to false in the constructor', () => {
    expect(service.isIntervalActive).toBeFalsy();
  });

  it('should subscribe to socketService.listen("validation")', () => {
    expect(socketServiceSpy.listen).toHaveBeenCalledWith('validation');
  });

  it('should return differencesDetectionService in getDifferencesDetectionService', () => {
    expect(service['differencesDetectionService']).toEqual(differencesDetectionServiceSpy);
  });

  it('should set differencesDetectionService in setDifferencesDetectionService', () => {
    service['differencesDetectionService'] = differencesDetectionServiceSpy;
    expect(service['differencesDetectionService']).toEqual(differencesDetectionServiceSpy);
  });

  it('should create a new audio and set src in initAudio', () => {
    service.initAudio();
    expect(service.audio).toBeDefined();
    expect(service.audio.src).toEqual('http://localhost:9876/assets/audio/indice.mp3');
  });

  it('should set leftPlayArea and rightPlayArea in setPlayAreas', () => {
    service.setPlayAreas(leftPlayAreaInstance, rightPlayAreaInstance);
    expect(service.leftPlayArea).toEqual(leftPlayAreaInstance);
    expect(service.rightPlayArea).toEqual(rightPlayAreaInstance);
  });

  it('should set coord1 and coord2 in updateCood1 and updateCood2', () => {
    const coord = { x: 1, y: 1 };
    service.updateLeftPlayAreaCoord(coord);
    service.updateRightPlayAreaCoord(coord);
    expect(service.leftPlayAreaCoord).toEqual(coord);
    expect(service.rightPlayAreaCoord).toEqual(coord);
  });

  it('should call socketService.emit in sendMessage', () => {
    service.sendMessage();
    expect(socketServiceSpy.emit).toHaveBeenCalled();
  });

  it('should return the first element of diffArray in selectRandomDifference', () => {
    const mathRandomSpy = spyOn(Math, 'random').and.returnValue(0);
    const differenceArray = [{ points: [] }, { points: [] }, { points: [] }];
    service.differenceArray = differenceArray;
    expect(service.selectRandomDifference()).toEqual(differenceArray[0]);
    expect(mathRandomSpy).toHaveBeenCalled();
  });

  it('should return { points: [] } if diffArray is undefined in selectRandomDifference', () => {
    expect(service.selectRandomDifference()).toEqual({ points: [] });
  });

  it('should select a random difference point and return its coordinates in selectRandomDot', () => {
    const mockRandomDifference = {
      points: [0, 0, 0, 0],
    };
    service.differenceArray = [mockRandomDifference];
    spyOn(service, 'selectRandomDifference').and.returnValue(mockRandomDifference);
    const result = service.selectRandomDot();
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('should return positions in findclueZonePositions', () => {
    const canvasPosition = {
      x: 0,
      y: 0,
      width: 640,
      height: 480
    };
    const rect = new DOMRect(canvasPosition.x, canvasPosition.y, canvasPosition.width, canvasPosition.height);
    const randomPoint = { x: 0, y: 0 };
    const scale = 2;
    const expectedResult = { top: 0, left: 0, height: 240, width: 320 };
    const result = service.findClueZonePositions(rect, randomPoint, scale);
    expect(result).toEqual(expectedResult);
  });

  it('should set clueZone attribute in setClueZonePosition', () => {
    const clueZone = document.createElement('div');
    const cluePosition = { top: 0, left: 0, width: 320, height: 240 };
    service.setClueZonePositions(clueZone, cluePosition);
    expect(clueZone.style.top).toEqual(cluePosition.top + 'px');
    expect(clueZone.style.left).toEqual(cluePosition.left + 'px');
    expect(clueZone.style.width).toEqual(cluePosition.width + 'px');
    expect(clueZone.style.height).toEqual(cluePosition.height + 'px');
  });

  it('should set opacity of leftPlayArea and rightPlayArea to 0.5 in setOpacity', () => {
    service.setOpacityClueZone(constsClue.CLUE_ZONE_OPACITY);
    expect(service.leftPlayArea.clueZone.nativeElement.style.opacity).toEqual(constsClue.CLUE_ZONE_OPACITY);
    expect(service.rightPlayArea.clueZone.nativeElement.style.opacity).toEqual(constsClue.CLUE_ZONE_OPACITY);
  });

  it('should set opacity of clueZone to null after 1 second in setTimeoutClueZone', fakeAsync(() => {
    service.setOpacityClueZone = jasmine.createSpy('setOpacityClueZone');
    service.setTimeoutClueZone();
    const timeout = 1000;
    tick(timeout);
    expect(service.setOpacityClueZone).toHaveBeenCalledWith(constsClue.NULL_OPACITY);
    discardPeriodicTasks();
  }));

  it('should call findClueZonePositions with CLUE2_SCALE if cluesRemaining === 3 and setClueZonePosition in changeClueZonePosition', () => {
    const spy = spyOn(service, 'findClueZonePositions');
    service.setClueZonePositions = jasmine.createSpy('setClueZonePosition');
    const cluesRemaining = 3;
    const playArea = service.leftPlayArea;
    const randomDot = { x: 0, y: 0 };
    service.changeClueZonePosition(cluesRemaining, playArea, randomDot);
    expect(spy).toHaveBeenCalledWith(playArea.canvasElement.nativeElement.getBoundingClientRect(), randomDot, constsClue.CLUE2_SCALE);
    expect(service.setClueZonePositions).toHaveBeenCalled();
  });

  it('should call findClueZonePositions with CLUE1_SCALE if cluesRemaining === 2 and setClueZonePosition in changeClueZonePosition', () => {
    const spy = spyOn(service, 'findClueZonePositions');
    service.setClueZonePositions = jasmine.createSpy('setClueZonePosition');
    const cluesRemaining = 2;
    const playArea = service.leftPlayArea;
    const randomDot = { x: 0, y: 0 };
    service.changeClueZonePosition(cluesRemaining, playArea, randomDot);
    expect(spy).toHaveBeenCalledWith(playArea.canvasElement.nativeElement.getBoundingClientRect(), randomDot, constsClue.CLUE1_SCALE);
    expect(service.setClueZonePositions).toHaveBeenCalled();
  });

  it('should call sendClue1And2 and replayService.addClueFrameEventReplayin sendClue1And2Random', () => {
    service.sendClue1And2 = jasmine.createSpy('sendClue1And2');
    const nCluesLeft = 3;
    service.sendClue1And2Random(nCluesLeft);
    expect(service.sendClue1And2).toHaveBeenCalled();
    expect(replayServiceSpy.addClueFrameEventReplay).toHaveBeenCalled();
  });

  it('should call selectRandomDot,setOpacityClueZone, changeClueZonePosition and setTimeoutClueZone in sendClue1And2', () => {
    service.selectRandomDot = jasmine.createSpy('selectRandomDot');
    service.setOpacityClueZone = jasmine.createSpy('setOpacityClueZone');
    service.changeClueZonePosition = jasmine.createSpy('changeClueZonePosition');
    service.setTimeoutClueZone = jasmine.createSpy('setTimeoutClueZone');
    const nCluesLeft = 3;
    service.sendClue1And2Random(nCluesLeft);
    expect(service.selectRandomDot).toHaveBeenCalled();
    expect(service.setOpacityClueZone).toHaveBeenCalled();
    expect(service.changeClueZonePosition).toHaveBeenCalled();
    expect(service.setTimeoutClueZone).toHaveBeenCalled();
  });

  it('should return the distance between two points in findDistanceBetweenCoords', () => {
    const coord1 = { x: 0, y: 0 };
    const coord2 = { x: 1, y: 0 };
    const expectedResult = 1;
    const result = service.findDistanceBetweenCoords(coord1, coord2);
    expect(result).toEqual(expectedResult);
  });

  it('should return the min distance in findMinDistance', () => {
    const coord = { x: 0, y: 0 };
    const points = [4, 5, 6];
    const difference: Difference = {
      points: points,
    };
    const expectedResult = 1;
    const result = Math.floor(service.findMinDistance(coord, difference)); // Math.floor à cause de la précision de la distance
    expect(result).toEqual(expectedResult);
  });

  it('should return MAX_SAFE_INTEGER in findMinDistance if difference.points is an empty array', () => {
    const coord = { x: 0, y: 0 };
    const difference: Difference = {
      points: [],
    };
    const expectedResult = Number.MAX_SAFE_INTEGER;
    const result = Math.floor(service.findMinDistance(coord, difference)); // Math.floor à cause de la précision de la distance
    expect(result).toEqual(expectedResult);
  });

  it('should set audio.playBackRate to 1 by calling findAudioPlayBackRate in changeAudioPlayBackRate', () => {
    service.findAudioPlayBackRate = jasmine.createSpy('findAudioPlayBackRate').and.returnValue(1);
    const difference = { points: [] };
    service.changeAudioPlayBackRate(difference);
    expect(service.audio.playbackRate).toEqual(1);
    expect(service.findAudioPlayBackRate).toHaveBeenCalledWith(difference, service.leftPlayAreaCoord, service.rightPlayAreaCoord);
  });

  it('should call replayService.addClueSoundEventReplay with the correct parameters in changeAudioPlayBackRate', () => {
    const audioPlayBackRate = 1;
    service.findAudioPlayBackRate = jasmine.createSpy('findAudioPlayBackRate').and.returnValue(audioPlayBackRate);
    const difference = { points: [] };
    service.changeAudioPlayBackRate(difference);
    expect(replayServiceSpy.addClueSoundEventReplay).toHaveBeenCalledWith(true, audioPlayBackRate);
  });

  it('should call audio.play if audio is paused in changeAudioPlayBackRate', fakeAsync(() => {
    service.audio.play = jasmine.createSpy('play').and.returnValue(Promise.resolve());
    service.findAudioPlayBackRate = jasmine.createSpy('findAudioPlayBackRate').and.returnValue(1);
    const difference = { points: [] };
    service.changeAudioPlayBackRate(difference);
    expect(service.audio.play).toHaveBeenCalled();
  }));

  it('should catch error if audio.play is rejected in changeAudioPlayBackRate', fakeAsync(() => {
    service.audio.play = jasmine.createSpy('play').and.returnValue(Promise.reject());
    const catchSpy = spyOn(service.audio.play(), 'catch').and.callThrough();
    service.findAudioPlayBackRate = jasmine.createSpy('findAudioPlayBackRate').and.returnValue(1);
    const difference = { points: [] };
    service.changeAudioPlayBackRate(difference);
    expect(catchSpy).toHaveBeenCalled();
  }));

  it('should call selectRandomDifference, initClue3Interval and set changeAudioPlayBackRate interval in startClue3Interval', () => {
    const difference = { points: [] };
    service.initClue3Interval = jasmine.createSpy('initClue3Interval');
    service.selectRandomDifference = jasmine.createSpy('selectRandomDifference').and.returnValue(difference);
    service.changeAudioPlayBackRate = jasmine.createSpy('changeAudioPlayBackRate');
    service.startClue3Interval();
    expect(service.selectRandomDifference).toHaveBeenCalled();
    expect(service.initClue3Interval).toHaveBeenCalled();
  });

  it('should call initAudio and set isIntervalActive to true in initClue3Interval', () => {
    service.initAudio = jasmine.createSpy('initAudio');
    service.initClue3Interval();
    expect(service.initAudio).toHaveBeenCalled();
    expect(service.isIntervalActive).toEqual(true);
  });

  it('should clear interval and pause audio in stopClue3interval', () => {
    const clearInterval = spyOn(window, 'clearInterval');
    service.audio.pause = jasmine.createSpy('pause');
    const interval = setInterval(() => {}, 1000);
    service.audioInterval = interval;
    service.stopClue3Interval();
    expect(clearInterval).toHaveBeenCalled();
    expect(service.audio.pause).toHaveBeenCalled();
  });

  it('should call replayService.addClueSoundEventReplay with the correct parameters in stopClue3Interval', () => {
    service.audio.pause = jasmine.createSpy('pause');
    const interval = setInterval(() => {}, 1000);
    service.audioInterval = interval;
    service.stopClue3Interval();
    expect(replayServiceSpy.addClueSoundEventReplay).toHaveBeenCalledWith(false);
  });


  it('should return SoundSpeed.VERY_FAST if distance is less than 25 in findSoundSpeed', () => {
    const distance = 24;
    const expectedResult = constsSoundSpeed.VERY_FAST;
    const result = service.findSoundSpeed(distance);
    expect(result).toEqual(expectedResult);
  });

  it('should return SoundSpeed.FAST if distance is less than 75 in findSoundSpeed', () => {
    const distance = 74;
    const expectedResult = constsSoundSpeed.FAST;
    const result = service.findSoundSpeed(distance);
    expect(result).toEqual(expectedResult);
  });

  it('should return SoundSpeed.NORMAL if distance is less than 175 in findSoundSpeed', () => {
    const distance = 174;
    const expectedResult = constsSoundSpeed.NORMAL;
    const result = service.findSoundSpeed(distance);
    expect(result).toEqual(expectedResult);
  });

  it('should return SoundSpeed.SLOW if distance is greater or equal to 175 in findSoundSpeed', () => {
    const distance = 175;
    const expectedResult = constsSoundSpeed.SLOW;
    const result = service.findSoundSpeed(distance);
    expect(result).toEqual(expectedResult);
  });

  it('should return true if coords is in the canvas in checkCoordInLimits', () => {
    const coords = { x: 0, y: 0 };
    const result = service.checkCoordInLimits(coords);
    expect(result).toBeTruthy();
  });

  it('should return false if coords is not in the canvas in checkCoordInLimits', () => {
    const coords = { x: -1, y: -1 };
    const result = service.checkCoordInLimits(coords);
    expect(result).toBeFalsy();
  });

  it('should return the SoundSpeed.VERY_FAST in findAudioPlayBackRate if soundSpeed is SoundSpeed.VERY_FAST and coord1 is in limits', () => {
    const minDistance = 24;
    service.findMinDistance = jasmine.createSpy('findMinDistance').and.returnValue(minDistance);
    const difference = { points: [] };
    const coord1 = { x: 0, y: 0 };
    const coord2 = { x: 0, y: 0 };
    const expectedResult = constsSoundSpeed.VERY_FAST;
    const result = service.findAudioPlayBackRate(difference, coord1, coord2);
    expect(result).toEqual(expectedResult);
  });

  it('should return the SoundSpeed.VERY_FAST when coord1 is not in limits but coord2 is in findAudioPlayBackRate', () => {
    const minDistance = 24;
    service.findMinDistance = jasmine.createSpy('findMinDistance').and.returnValue(minDistance);
    const difference = { points: [] };
    const coord1 = { x: -1, y: -1 };
    const coord2 = { x: 0, y: 0 };
    const expectedResult = constsSoundSpeed.VERY_FAST;
    const result = service.findAudioPlayBackRate(difference, coord1, coord2);
    expect(result).toEqual(expectedResult);
  });

  it('should return the SoundSpeed.SLOW when coord1 and coord2 are not in limits of canvas in findAudioPlayBackRate', () => {
    const difference = { points: [] };
    const coord1 = { x: -1, y: -1 };
    const coord2 = { x: -1, y: -1 };
    const expectedResult = constsSoundSpeed.SLOW;
    const result = service.findAudioPlayBackRate(difference, coord1, coord2);
    expect(result).toEqual(expectedResult);
  });
});
