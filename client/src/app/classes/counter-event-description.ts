import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class CounterEventDescription extends EventDescription {
    private userCounter: number[];

    constructor(time: number, userCounter: number[]) {
        super(time);
        this.userCounter = userCounter;
    }

    play(replayPage: ReplayPageComponent) {
        replayPage.gamePageElem.counter.count = this.userCounter[0];
        replayPage.gamePageElem.counter2.count = this.userCounter[1];
        replayPage.gamePageElem.counter3.count = this.userCounter[2];   
        replayPage.gamePageElem.counter4.count = this.userCounter[3];

    }
}