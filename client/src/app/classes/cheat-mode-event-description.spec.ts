import { CheatModeEventDescription } from "./cheat-mode-event-description";


describe('CheatModeEventDescription', () => {

    let event: CheatModeEventDescription;
    const time = 10;

    beforeEach(() => {
        event = new CheatModeEventDescription(time);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
    });

    it('play should call cheat method of gamePage', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePageElem']);
        const gamePageElem = jasmine.createSpyObj('GamePageComponent', ['cheat']);
        replayPage.gamePageElem = gamePageElem;
        event.play(replayPage);
        expect(gamePageElem.cheat).toHaveBeenCalled();
    });
});