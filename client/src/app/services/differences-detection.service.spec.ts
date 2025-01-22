import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@common/vec2';
import { Observable } from 'rxjs';

import { DifferencesDetectionService, MouseButton } from './differences-detection.service';
import { SocketService } from './socket.service';

describe('DifferencesDetectionService', () => {
    let service: DifferencesDetectionService;
    let socketService: SocketService;
    let mouseHitDetect: MouseEvent;
    let mousePosSpy: jasmine.Spy<(value: Vec2) => void>;
    const DIFFERENCES = 1000;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferencesDetectionService);
        socketService = TestBed.inject(SocketService);
        socketService.listen = jasmine.createSpy('listen').and.returnValue(
            new Observable((observer) => {
                observer.next({ validation: true, diff: [], diffFound: [] });
            }),
        );
        mousePosSpy = spyOn(service.mousePositionObservable, 'next');
        socketService.emit = jasmine.createSpy('emit');
        mouseHitDetect = {
            button: MouseButton.Left,
            offsetX: 10,
            offsetY: 10,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a count attribute set to 0', () => {
        expect(service.count.value).toEqual(0);
    });

    it('should have a difference attribute', () => {
        expect(service.difference).toBeTruthy();
    });

    it('should have a found attribute', () => {
        expect(service.found).toBeTruthy();
    });

    it('should have a mousePosition attribute set to { x: 0, y: 0 }', () => {
        expect(service.mousePosition).toEqual({ x: 0, y: 0 });
    });

    it('should have a mousePositionObservable attribute set to observalbe of { x: 0, y: 0 }', () => {
        expect(service.mousePositionObservable.value).toEqual({ x: 0, y: 0 });
    });

    it('should have a validation attribute set to false', () => {
        expect(service.validation.value).toEqual(false);
    });

    it('should listen to validation event and update validation, count, difference and found subjects when validation is true', () => {
        const differencesDetectionService = new DifferencesDetectionService(socketService as SocketService);
        differencesDetectionService.validation.subscribe(() => {
            expect(differencesDetectionService.validation.value).toBeTrue();
            expect(differencesDetectionService.count.value).toBe(1);
            expect(differencesDetectionService.difference.value).toEqual([]);
            expect(differencesDetectionService.found.value).toEqual([]);
        });
    });

    it('should set difference attribute to response.diff', () => {
        expect(service.difference.value).toEqual([]);
    });

    it('should set found attribute to response.diffFound', () => {
        expect(service.found.value).toEqual([]);
    });

    it('should reset found attribute to []', () => {
        service.found.next([{ points: [] }]);
        service.resetFound();
        expect(service.found.value).toEqual([]);
    });

    it('should reset count attribute to 0', () => {
        service.count.next(1);
        service.resetCount();
        expect(service.count.value).toEqual(0);
    });

    it('should set the difference attribute to [{ points: [100000] }]', () => {
        service.setDifference([{ points: [DIFFERENCES] }]);
        expect(service.difference.value).toEqual([{ points: [DIFFERENCES] }]);
    });

    it('mouseHitDetect should set the mouse position', () => {
        service.mouseHitDetect(mouseHitDetect, undefined);
        expect(service.mousePosition).toEqual({ x: 10, y: 10 });
    });

    it('should emit the mouse position with the correct coordinates', () => {
        service.mouseHitDetect(mouseHitDetect, undefined);
        expect(mousePosSpy).toHaveBeenCalledWith({ x: 10, y: 10 });
    });

    it('should emit a click event to the socket service', () => {
        service.mouseHitDetect(mouseHitDetect, undefined);
        expect(socketService.emit).toHaveBeenCalled();
    });

    it('should not emit the mouse position if the button is not left', () => {
        mouseHitDetect = {
            button: MouseButton.Right,
            offsetX: 10,
            offsetY: 10,
        } as MouseEvent;
        service.mouseHitDetect(mouseHitDetect, undefined);
        expect(mousePosSpy).not.toHaveBeenCalled();
        expect(socketService.emit).not.toHaveBeenCalled();
    });
});
