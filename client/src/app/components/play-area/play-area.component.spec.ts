import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ReplayPageComponent } from '@app/pages/replay-page/replay-page.component';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { ReplayService } from '@app/services/replay.service';
import { PopupErrorComponent } from '../popup-error/popup-error.component';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let differencesDetectionService: DifferencesDetectionService;
    let replayService: jasmine.SpyObj<ReplayService>;
    let router: Router;

    const pathReplay = 'replay';
    const pathNotReplay = 'game';

    const routes = [
        { path: pathReplay, component: ReplayPageComponent },
        { path: pathNotReplay, component: GamePageComponent },
    ] as Routes;

    beforeEach(async () => {

        replayService = jasmine.createSpyObj('ReplayService', ['addClickEventReplay']);

        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, PopupErrorComponent],
            imports: [RouterTestingModule.withRoutes(routes)],
            providers: [
                DifferencesDetectionService,
                { provide: ReplayService, useValue: replayService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        differencesDetectionService = TestBed.inject(DifferencesDetectionService);
        router = TestBed.inject(Router);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call clickHandle() when canvas is clicked', () => {
        spyOn(component, 'clickHandle');
        fixture.detectChanges();
        const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
        canvas.click();
        expect(component.clickHandle).toHaveBeenCalled();
        expect()
    });

    it('clickHandle should add a click event to the replay service when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        component.clickHandle(new MouseEvent('click'));
        expect(replayService.addClickEventReplay).toHaveBeenCalled();
    });

    it('clickHandle should not add a click event to the replay service when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        component.clickHandle(new MouseEvent('click'));
        expect(replayService.addClickEventReplay).not.toHaveBeenCalled();
    });

    it('width() should return component width', () => {
        const canvasWidth = 12;
        component['canvasSize'] = { x: canvasWidth, y: 0 };
        expect(component.width).toEqual(canvasWidth);
    });

    it('height() should return component height', () => {
        const canvasHeight = 12;
        component['canvasSize'] = { x: 0, y: canvasHeight };
        expect(component.height).toEqual(canvasHeight);
    });

    it('canvasElement() should return canvas element', () => {
        const canvas = new ElementRef(fixture.debugElement.nativeElement.querySelector('canvas'));
        expect(component.canvasElement).toEqual(canvas);
    });

    it('canvasElement() should set canvas element', () => {
        const canvas = new ElementRef(fixture.debugElement.nativeElement.querySelector('canvas'));
        component['canvas'] = canvas;
        expect(component.canvasElement).toEqual(canvas);
    });

    it('should update buttonPressed property on keydown event', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'MouseButton.Left' });
        spyOn(component['canvas'].nativeElement, 'focus');
        component.buttonPressed = '';
        component.buttonDetect(mockEvent);
        expect(component.buttonPressed).toEqual('MouseButton.Left');
    });

    it('should emit mouse coordinates on mouse move', () => {
        const coordNextSpy = spyOn(component.coord, 'next');
        const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true });
        Object.defineProperty(mouseMoveEvent, 'offsetX', { get: () => 10 });
        Object.defineProperty(mouseMoveEvent, 'offsetY', { get: () => 20 });
        fixture.nativeElement.dispatchEvent(mouseMoveEvent);
        expect(coordNextSpy).toHaveBeenCalledWith({ x: 10, y: 20 });
    });

    it('should emit mouse coordinates on mouse leave', () => {
        const coordNextSpy = spyOn(component.coord, 'next');
        const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
        Object.defineProperty(mouseLeaveEvent, 'offsetX', { get: () => 10 });
        Object.defineProperty(mouseLeaveEvent, 'offsetY', { get: () => 20 });
        fixture.nativeElement.dispatchEvent(mouseLeaveEvent);
        expect(coordNextSpy).toHaveBeenCalledWith({ x: -1, y: -1 });
    });

    it('should call getContext() when ', () => {
        spyOn(component, 'clickHandle');
        fixture.detectChanges();
        const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
        canvas.click();
        expect(component.clickHandle).toHaveBeenCalled();
    });

    it('should call mouseHitDetect() with correct arguments on canvas click', () => {
        const RADIUS = 10;
        const N_POINTS = 10;
        const event = new MouseEvent('click', { clientX: 12, clientY: 12 });
        const diff = [{ x: 5, y: 5, r: RADIUS, points: [N_POINTS] }];
        spyOn(differencesDetectionService, 'mouseHitDetect');
        component.diff = diff;
        component.clickHandle(event);
        expect(differencesDetectionService.mouseHitDetect).toHaveBeenCalledWith(event, diff);
    });
});
