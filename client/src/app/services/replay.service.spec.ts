import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Message } from '@common/message';
import { ClickHistoryService } from './click-history.service';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {

    let replayService: ReplayService;
    let clickHistoryService: ClickHistoryService;
    let router: Router;

    let addEventSpy: jasmine.Spy;

    const pathReplay = 'replay';
    const pathNotReplay = 'game';

    beforeEach(async () => {

        TestBed.configureTestingModule({
            imports: [RouterTestingModule]
        }).compileComponents();

        replayService = TestBed.inject(ReplayService);
        clickHistoryService = TestBed.inject(ClickHistoryService);
        router = TestBed.inject(Router);
        router.initialNavigation();

        addEventSpy = spyOn(clickHistoryService, 'addEvent');
    });

    it('should be created', () => {
        expect(replayService).toBeTruthy();
    });

    it('restartTimer should reinitialize and start the timer when the current page is not replay', () => {
        spyOn(clickHistoryService, 'reinit');
        spyOn(clickHistoryService, 'startTimer');
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.restartTimer();
        expect(clickHistoryService.reinit).toHaveBeenCalled();
        expect(clickHistoryService.startTimer).toHaveBeenCalled();
    });

    it('restartTimer should not reinitialize and start the timer when the current page is replay', () => {
        spyOn(clickHistoryService, 'reinit');
        spyOn(clickHistoryService, 'startTimer');
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.restartTimer();
        expect(clickHistoryService.reinit).not.toHaveBeenCalled();
        expect(clickHistoryService.startTimer).not.toHaveBeenCalled();
    });

    it('stopTimer should stop the timer', () => {
        spyOn(clickHistoryService, 'stopTimer');
        replayService.stopTimer();
        expect(clickHistoryService.stopTimer).toHaveBeenCalled();
    });

    it('addClickEventReplay should add a click event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addClickEventReplay({ x: 0, y: 0 });
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addClickEventReplay should not add a click event when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.addClickEventReplay({ x: 0, y: 0 });
        expect(addEventSpy).not.toHaveBeenCalled();
    });

    it('addCounterEventReplay should add a counter event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addCounterEventReplay(true);
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addCounterEventReplay should not add a counter event when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.addCounterEventReplay(true);
        expect(addEventSpy).not.toHaveBeenCalled();
    });

    it('addCheatModeEventReplay should add a cheat mode event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addCheatModeEventReplay();
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addCheatModeEventReplay should not add a cheat mode event when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.addCheatModeEventReplay();
        expect(addEventSpy).not.toHaveBeenCalled();
    });

    it('addClueFrameEventReplay should add a clue frame event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addClueFrameEventReplay(0, { x: 0, y: 0 });
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addClueFrameEventReplay should not add a clue frame event when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.addClueFrameEventReplay(0, { x: 0, y: 0 });
        expect(addEventSpy).not.toHaveBeenCalled();
    });

    it('addClueSoundEventReplay should add a clue sound event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addClueSoundEventReplay(true);
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addClueSoundEventReplay should not add a clue sound event when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.addClueSoundEventReplay(true);
        expect(addEventSpy).not.toHaveBeenCalled();
    });

    it('addMessageEventReplay should add a message event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addMessageEventReplay({} as Message);
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addEndGameEventReplay should add a end game event when the current page is not replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathNotReplay}`);
        replayService.addEndGameEventReplay();
        expect(addEventSpy).toHaveBeenCalled();
    });

    it('addEndGameEventReplay should not add a end game event when the current page is replay', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue(`/${pathReplay}`);
        replayService.addEndGameEventReplay();
        expect(addEventSpy).not.toHaveBeenCalled();
    });
});
