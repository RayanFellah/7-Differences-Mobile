import { EndGameEventDescription } from "./end-game-event-description";


describe('EndGameEventDescription', () => {

    let event: EndGameEventDescription;
    const time = 10;

    beforeEach(() => {
        event = new EndGameEventDescription(time);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
    });

    it('play should call openDialogEndReplay', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['openDialogEndReplay']);
        event.play(replayPage);
        expect(replayPage.openDialogEndReplay).toHaveBeenCalled();
    });
});