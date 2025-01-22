import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class ClickEventDescription extends EventDescription {
    private x: number;
    private y: number;

    constructor(time: number, x: number, y: number) {
        super(time);
        this.x = x;
        this.y = y;
    }

    play(replayPage: ReplayPageComponent) {
        const element = replayPage.gamePageElem.leftPlayArea;
        const event = new MouseEvent('click', {
            clientX: (this.x as number),
            clientY: (this.y as number)
        });
        element.differencesDetectionService.mouseHitDetect(event, element.diff);
        super.play(replayPage);
    }
}
