import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class CheatModeEventDescription extends EventDescription {
    constructor(time: number) {
        super(time);
    }

    play(replayPage: ReplayPageComponent) {
        replayPage.gamePageElem.cheat();
    }
}
