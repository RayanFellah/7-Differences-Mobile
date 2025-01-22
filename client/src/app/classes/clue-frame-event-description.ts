import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { Vec2 } from "@common/vec2";
import { EventDescription } from "./event-description";

export class ClueFrameEventDescription extends EventDescription {
    private nCluesLeft: number;
    private dot: Vec2;

    constructor(time: number, nCluesLeft: number, dot: Vec2) {
        super(time);
        this.nCluesLeft = nCluesLeft;
        this.dot = dot;
    }

    play(replayPage: ReplayPageComponent): void {
        replayPage.gamePage.clues.clueService.sendClue1And2(this.nCluesLeft, this.dot);
    }

}