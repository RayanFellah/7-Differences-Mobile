import { ClueSoundEventDescription } from "./clue-sound-event-description";


describe('ClueSoundEventDescription', () => {

    let event: ClueSoundEventDescription;

    const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePage']);
    const gamePage = jasmine.createSpyObj('GamePageComponent', ['clues']);
    const clues = jasmine.createSpyObj('CluesComponent', ['clueService']);
    const clueService = jasmine.createSpyObj('ClueService', ['initClue3Interval', 'setAudioPlayBackRate', 'stopClue3Interval']);
    clues.clueService = clueService;
    gamePage.clues = clues;
    replayPage.gamePage = gamePage;

    const time = 10;
    const isActive = true;
    const playbackRate = 1;

    beforeEach(() => {
        event = new ClueSoundEventDescription(time, isActive, playbackRate);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
        expect(event['isActive']).toEqual(isActive);
        expect(event['playbackRate']).toEqual(playbackRate);
    });

    it('play should call initClue3Interval of clueService when event is active and the interval not set', () => {
        clueService.isIntervalActive = false;
        event.play(replayPage);
        expect(clueService.initClue3Interval).toHaveBeenCalled();
    });

    it('play should call setAudioPlayBackRate of clueService when event is active', () => {
        event.play(replayPage);
        expect(clueService.setAudioPlayBackRate).toHaveBeenCalledWith(playbackRate);
    });

    it('play should call stopClue3Interval of clueService when event is not active', () => {
        event['isActive'] = false;
        event.play(replayPage);
        expect(clueService.stopClue3Interval).toHaveBeenCalled();
    });
});