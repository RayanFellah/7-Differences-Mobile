import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';

import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
    let component: CounterComponent;
    let fixture: ComponentFixture<CounterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CounterComponent],
            providers: [DifferencesDetectionService],
        }).compileComponents();

        fixture = TestBed.createComponent(CounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set count to 0', () => {
        expect(component.count).toEqual(0);
    });

    it('should set name to player', () => {
        expect(component.name).toEqual('player');
    });

    it('increase() should increase count', () => {
        component.increase();
        fixture.detectChanges();
        expect(component.count).toEqual(1);
    });

    it('reset() should reset count', () => {
        component.reset();
        fixture.detectChanges();
        expect(component.count).toEqual(0);
    });
});
