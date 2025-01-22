import { Injectable, OnDestroy } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { Vec2 } from '@common/vec2';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { SocketService } from './socket.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class DifferencesDetectionService implements OnDestroy {
    count = new BehaviorSubject<number>(0);
    difference = new BehaviorSubject<Difference[] | undefined>([]);
    found = new BehaviorSubject<Difference[] | undefined>([]);
    mousePosition: Vec2 = { x: 0, y: 0 };
    mousePositionObservable = new BehaviorSubject<Vec2>({ x: 0, y: 0 });
    validation = new BehaviorSubject<boolean>(false);
    destroy$ = new Subject<any>();


    constructor(private socketService: SocketService) {
        this.socketService.listen('validation').pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
            this.validation.next(response.validation);
            if (response.validation) {
                //console.log("res1", response.diff);
                //console.log('validation');
                const temp = this.count.value;
                this.count.next(temp + 1);
                this.difference.next(response.diff); // update differences
                this.found.next(response.diffFound);
            }
        });
    }

    resetFound() {
        this.found.next([]);
    }
    resetCount() {
        this.count.next(0);
    }

    mouseHitDetect(event: MouseEvent, diffArray: Difference[] | undefined) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.mousePositionObservable.next(this.mousePosition);
            const ioObj = {
                pos: this.mousePosition,
                diff: diffArray,
            };
            //console.log('Click emitted with:' + ioObj.diff?.toString)
            this.socketService.emit('click', ioObj);
        }
    }
    setDifference(diff: Difference[] | undefined) {
        this.difference.next(diff);
    }

    ngOnDestroy() {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}
