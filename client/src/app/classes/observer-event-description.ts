import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class ObserverEventDescription extends EventDescription {
    private rectangle: {startX:number, startY:number, width:number, height:number};
    private color: string;
    constructor(time: number,rectangle:{startX:number, startY:number, width:number, height:number}, color: string) {
        super(time);
        this.rectangle = rectangle;
        this.color = color;

    }
    play(replayPage: ReplayPageComponent) {
        replayPage.gamePageElem.canvas3.drawReceivedRectangle(this.rectangle, this.color);
        replayPage.gamePageElem.canvas4.drawReceivedRectangle(this.rectangle, this.color);
    }
}