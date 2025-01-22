import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { GameConstantsService } from '@app/services/game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { ChronometreComponent } from './chronometre.component';

describe('ChronometreComponent', () => {
    let component: ChronometreComponent;
    let fixture: ComponentFixture<ChronometreComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    let gameConstantsService: GameConstantsService;
    let gameInfoService: GameInfoService;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        await TestBed.configureTestingModule({
            declarations: [ChronometreComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
                HttpClient,
                HttpHandler,]
        }).compileComponents();

        fixture = TestBed.createComponent(ChronometreComponent);
        gameConstantsService = TestBed.inject(GameConstantsService);
        gameConstantsService.getConstants = jasmine.createSpy().and.returnValue(Promise.resolve({ penalty: 10 }));
        gameInfoService = TestBed.inject(GameInfoService);
        gameInfoService.time = 0;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should increment the minutes when seconds are greater than 59 in convertTimeToString', () => {
        component['seconds'] = 60;
        component['minutes'] = 1;
        component.convertTimeToString();
        expect(component['minutes']).toEqual(2);
    });

    it('should decrease minutes if seconds are lower than 0 in convertTimeToString', () => {
        const SECONDS_LIMIT = 59;
        component['seconds'] = -1;
        component['minutes'] = 1;
        component.convertTimeToString();
        expect(component['seconds']).toEqual(SECONDS_LIMIT);
        expect(component['minutes']).toEqual(0);
    });

    it('should increase seconds if seconds are less than 59', () => {
        const RESULT = 13;
        component['seconds'] = 12;
        component.increase();
        expect(component['seconds']).toEqual(RESULT);
    });

    it('should increase seconds when increase() is called', () => {
        const RESULT = 13;
        component['seconds'] = 12;
        component.increase();
        expect(component['seconds']).toEqual(RESULT);
    });

    it('should decrease seconds when decrease() is called', () => {
        const RESULT = 11;
        component['seconds'] = 12;
        component.decrease();
        expect(component['seconds']).toEqual(RESULT);
    });

    it('should not decrease if timer is set to 0', () => {
        component['seconds'] = 0;
        component['minutes'] = 0;
        component.decrease();
        expect(component['seconds']).toEqual(0);
        expect(component['minutes']).toEqual(0);
    });

    it('should apply penalty when isPenalty is true in decrease()', () => {
        component.penalty = 5;
        component['seconds'] = 10;
        component['minutes'] = 0;
        component['isPenalty'] = true;
        component.decrease();
        expect(component['seconds']).toEqual(5);
        expect(component['minutes']).toEqual(0);
    });

    it('should not apply penalty when isPenalty is false in decrease()', () => {
        component.penalty = 5;
        component['seconds'] = 10;
        component['minutes'] = 0;
        component['isPenalty'] = false;
        component.decrease();
        expect(component['seconds']).toEqual(9);
        expect(component['minutes']).toEqual(0);
    });

    it('should apply penalty when isPenalty is true in increase()', () => {
        component.penalty = 5;
        component['seconds'] = 10;
        component['minutes'] = 0;
        component['isPenalty'] = true;
        component.increase();
        expect(component['seconds']).toEqual(15);
        expect(component['minutes']).toEqual(0);
    });

    it('should not apply penalty when isPenalty is false in increase()', () => {
        component.penalty = 5;
        component['seconds'] = 10;
        component['minutes'] = 0;
        component['isPenalty'] = false;
        component.increase();
        expect(component['seconds']).toEqual(11);
        expect(component['minutes']).toEqual(0);
    });


    it('should start timer when startTimer() is called', () => {
        const INTERVAL = 1000;
        const spySetInt = spyOn(window, 'setInterval');
        component.startTimer();
        expect(spySetInt).toHaveBeenCalledWith(component.increase, INTERVAL);
    });

    it('should set penalty to its default value if gameConstantsService.getConstants() is not successfull', fakeAsync(() => {
        gameConstantsService.getConstants = jasmine.createSpy().and.returnValue(Promise.resolve({}));
        component.setPenalty();
        expect(component.penalty).toEqual(10);
    }));

    it('should set penalty to result of gameConstantsService.getConstants() if it is successfull', fakeAsync(() => {
        const PENALTY = 10;
        gameConstantsService.getConstants = jasmine.createSpy().and.returnValue(Promise.resolve({ penalty: PENALTY }));
        component.setPenalty();
        expect(component.penalty).toEqual(PENALTY);
    }));

    it('should call increase() if isClassic is true in applyPenalty()', () => {
        component.increase = jasmine.createSpy('increase').and.callThrough();
        const isClassic = true;
        component.applyPenalty(isClassic);
        expect(component.increase).toHaveBeenCalled();
    });

    it('should call decrease() if isClassic is false in applyPenalty()', () => {
        component.decrease = jasmine.createSpy('decrease').and.callThrough();
        const isClassic = false;
        component.applyPenalty(isClassic);
        expect(component.decrease).toHaveBeenCalled();
    });

    it('should add 10 seconds and call convertTimeToString() in addTime', () => {
        component.convertTimeToString = jasmine.createSpy('convertTimeToString').and.callThrough();
        component['seconds'] = 0;
        const time = 10;
        component.addTime(time);
        expect(component['seconds']).toEqual(time);
        expect(component.convertTimeToString).toHaveBeenCalled();
    });

    it('should call decrease in countDown()', () => {
        component.decrease = jasmine.createSpy('decrease').and.callThrough();
        component.countDown();
        expect(component.decrease).toHaveBeenCalled();
    });

    it('should call stop() and setInterval() in startCountDownFrom()', () => {
        component.stop = jasmine.createSpy('stop').and.callThrough();
        const spy = spyOn(window, 'setInterval');
        component.startCountDownFrom(0);
        expect(component.stop).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should reset seconds and minutes to 0 and clear the interval', fakeAsync(() => {
        window.clearInterval = jasmine.createSpy('clearInterval').and.callThrough();
        component['seconds'] = 12;
        component['minutes'] = 2;
        component.stop();
        expect(component['seconds']).toEqual(0);
        expect(component['minutes']).toEqual(0);
        expect(window.clearInterval).toHaveBeenCalledWith(component.interval);
    }));
});
