import { TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';
import { ClickHistoryService } from './click-history.service';

import { EventDescription } from '@app/classes/event-description';

describe('ClickHistoryService', () => {
  let service: ClickHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('startTimer should start the timer', () => {
    service.startTimer();
    expect(service.interval).not.toBeNull();
  });

  it('addTime should increment the timeFraction', () => {
    service.addTime();
    expect(service.timeFraction).toEqual(1);
  });

  it('addTime should call call emitNextSubject when incremented is not null and is not closed', () => {
    const emitNextSubjectSpy = spyOn(service, 'emitNextSubject');
    service.incremented = new Subject<number>();
    service.addTime();
    expect(emitNextSubjectSpy).toHaveBeenCalled();
  });

  it('addTime should not call call emitNextSubject when incremented is null', () => {
    const emitNextSubjectSpy = spyOn(service, 'emitNextSubject');
    service.addTime();
    expect(emitNextSubjectSpy).not.toHaveBeenCalled();
  });

  it('addTime should not call call emitNextSubject when incremented is closed', () => {
    const emitNextSubjectSpy = spyOn(service, 'emitNextSubject');
    service.incremented = new Subject<number>();
    service.incremented.closed = true;
    service.addTime();
    expect(emitNextSubjectSpy).not.toHaveBeenCalled();
  });

  it('emitNextSubject should emit the timeFraction', () => {
    service.incremented = new Subject<number>();
    const nextSpy = spyOn(service.incremented, 'next');
    service.emitNextSubject();
    expect(nextSpy).toHaveBeenCalledWith(service.timeFraction);
  });

  it('addEvent should add the event to the events array', () => {
    const event = { time: 1 } as EventDescription;
    service.addEvent(event);
    expect(service.clickHistory).toContain(event);
  });

  it('addEvent should sort the events on adding by time', () => {
    for (let i = 0; i < 3; i++) {
      const event = { time: 10 + i * 2 } as EventDescription;
      service.clickHistory.push(event);
    }
    const event = { time: 11 } as EventDescription;
    service.addEvent(event);
    expect(service.clickHistory[1]).toEqual(event);
  });

  it('reinit should reset the clickHistory array', () => {
    for (let i = 0; i < 3; i++) {
      const event = { time: 10 + i * 2 } as EventDescription;
      service.clickHistory.push(event);
    }
    service.reinit();
    expect(service.clickHistory).toEqual([]);
  });

  it('reinit should call stopTimer', () => {
    const stopTimerSpy = spyOn(service, 'stopTimer');
    service.reinit();
    expect(stopTimerSpy).toHaveBeenCalled();
  });

  it('stopTimer should stop the timer', () => {
    service.stopTimer();
    expect(clearInterval).toHaveBeenCalledWith(service.interval);
  });

  it('stopTimer should reset the timeFraction', () => {
    service.timeFraction = 10;
    service.stopTimer();
    expect(service.timeFraction).toEqual(0);
  });

});
