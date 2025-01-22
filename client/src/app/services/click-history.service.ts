import { Injectable } from '@angular/core';
import { EventDescription } from '@app/classes/event-description';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClickHistoryService {
  clickHistory: EventDescription[] = [];
  incremented: Subject<number>;
  interval: ReturnType<typeof setInterval>;
  timeFraction: number = 0;

  constructor() {}

  startTimer(interval: number = 100): void {
    this.interval = setInterval(this.addTime, interval);
  }
  addTime = () => {
    this.timeFraction += 1;
    if (this.incremented && !this.incremented.closed) {
      this.emitNextSubject();
    }
  }
  emitNextSubject(): void {
    this.incremented.next(this.timeFraction);
  }
  addEvent(event: EventDescription): void {
    // percolate down
    let i = this.clickHistory.length;
    while (i > 0 && this.clickHistory[i - 1].time > event.time) {
      this.clickHistory[i] = this.clickHistory[--i];
    }
    this.clickHistory[i] = event;
  }
  reinit(): void {
    this.clickHistory = [];
    this.stopTimer();
  }

  stopTimer(): void {
    clearInterval(this.interval);
    this.timeFraction = 0;
  }
}
