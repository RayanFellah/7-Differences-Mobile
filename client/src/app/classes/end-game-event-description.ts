import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class EndGameEventDescription extends EventDescription {
    constructor(time: number) {
        super(time);
    }
    play(replayPage: ReplayPageComponent) {
        clearInterval(replayPage.gamePageElem.timer.interval);
        clearInterval(replayPage.clickHistoryService.interval);
        replayPage.openDialogEndReplay();
    }
}
