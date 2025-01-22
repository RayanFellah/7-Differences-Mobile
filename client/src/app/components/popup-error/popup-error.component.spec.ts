import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { PopupErrorComponent } from './popup-error.component';

describe('PopupErrorComponent', () => {
    let component: PopupErrorComponent;
    let fixture: ComponentFixture<PopupErrorComponent>;
    let differencesDetectionService: DifferencesDetectionService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PopupErrorComponent],
            providers: [DifferencesDetectionService],
        }).compileComponents();

        fixture = TestBed.createComponent(PopupErrorComponent);
        component = fixture.componentInstance;
        differencesDetectionService = TestBed.inject(DifferencesDetectionService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a show property', () => {
        expect(component.show).toBeDefined();
    });

    it('should have a mousePosition property set to { x: 0, y: 0 }', () => {
        expect(component.mousePosition).toEqual({ x: 0, y: 0 });
    });

    it('should set the mousePosition correctly from the differencesDetectionService', () => {
        differencesDetectionService.mousePositionObservable.next({ x: 1, y: 1 });
        expect(component.mousePosition).toEqual({ x: 1, y: 1 });
    });

    it('should set the show property to true when the differencesDetectionService validation is false', () => {
        differencesDetectionService.validation.next(false);
        expect(component.show).toBeTrue();
    });

    it('should set show property to false after 1 second when the validation from the differencesDetectionService returns false', fakeAsync(() => {
        const ONE_SECOND = 1000;
        differencesDetectionService.validation.next(false);
        expect(component.show).toBeTrue();
        jasmine.clock().tick(ONE_SECOND);
        expect(component.show).toBeFalse();
    }));

});
