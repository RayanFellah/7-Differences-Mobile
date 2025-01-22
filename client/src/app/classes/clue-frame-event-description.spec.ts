import { Vec2 } from "@common/vec2";
import { ClueFrameEventDescription } from "./clue-frame-event-description";


describe('ClueFrameEventDescription', () => {

    let event: ClueFrameEventDescription;

    const time = 10;
    const nClues = 11;
    const dot = { x: 12, y: 13 } as Vec2;

    beforeEach(() => {
        event = new ClueFrameEventDescription(time, nClues, dot);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
        expect(event['nCluesLeft']).toEqual(nClues);
        expect(event['dot']).toEqual(dot);
    });

    it('play should call mouseHitDetect method of differencesDetectionService', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePage']);
        const gamePage = jasmine.createSpyObj('GamePageComponent', ['clues']);
        const clues = jasmine.createSpyObj('CluesComponent', ['clueService']);
        const clueService = jasmine.createSpyObj('ClueService', ['sendClue1And2']);
        clues.clueService = clueService;
        gamePage.clues = clues;
        replayPage.gamePage = gamePage;
        event.play(replayPage);
        expect(clueService.sendClue1And2).toHaveBeenCalledWith(nClues, dot);
    });
});