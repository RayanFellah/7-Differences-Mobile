import { CounterEventDescription } from "./counter-event-description";


describe('CounterEventDescription', () => {

    let event: CounterEventDescription;

    const time = 10;
    const isAdversary = true;

    beforeEach(() => {
        event = new CounterEventDescription(time, isAdversary);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
        expect(event['isAdversary']).toEqual(isAdversary);
    });

    it('play should call increase of counter2 when isAdversary is true', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePage1v1']);
        const gamePage1v1 = jasmine.createSpyObj('GamePageClassic1v1Component', ['counter2']);
        const counter2 = jasmine.createSpyObj('CounterComponent', ['increase']);
        gamePage1v1.counter2 = counter2;
        replayPage.gamePage1v1 = gamePage1v1;
        event['isAdversary'] = true;
        event.play(replayPage);
        expect(counter2.increase).toHaveBeenCalled();
    });

    it('play should call increase of counter when isAdversary is false', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePageElem']);
        const gamePageElem = jasmine.createSpyObj('GamePageComponent', ['counter']);
        const counter = jasmine.createSpyObj('CounterComponent', ['increase']);
        gamePageElem.counter = counter;
        replayPage.gamePageElem = gamePageElem;
        event['isAdversary'] = false;
        event.play(replayPage);
        expect(counter.increase).toHaveBeenCalled();
    });
});