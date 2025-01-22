import { ClickEventDescription } from "./click-event-description";


describe('ClickEventDescription', () => {

    let event: ClickEventDescription;

    const time = 10;
    const x = 11;
    const y = 12;

    beforeEach(() => {
        event = new ClickEventDescription(time, x, y);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
        expect(event['x']).toEqual(x);
        expect(event['y']).toEqual(y);
    });

    it('play should call mouseHitDetect method of differencesDetectionService', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePageElem']);
        const gamePageElem = jasmine.createSpyObj('GamePageComponent', ['leftPlayArea']);
        const leftPlayArea = jasmine.createSpyObj('PlayAreaComponent', ['differencesDetectionService']);
        const differencesDetectionService = jasmine.createSpyObj('DifferencesDetectionService', ['mouseHitDetect']);
        leftPlayArea.differencesDetectionService = differencesDetectionService;
        gamePageElem.leftPlayArea = leftPlayArea;
        replayPage.gamePageElem = gamePageElem;
        event.play(replayPage);
        expect(differencesDetectionService.mouseHitDetect).toHaveBeenCalled();
    });
});