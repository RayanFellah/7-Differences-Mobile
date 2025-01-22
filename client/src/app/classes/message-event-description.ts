import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { Message } from "@common/message";
import { EventDescription } from "./event-description";

export class MessageEventDescription extends EventDescription {
    private message: Message;

    constructor(time: number, message: Message) {
        super(time);
        this.message = message;
    }

    play(replayPage: ReplayPageComponent) {
        const messengerService = replayPage.gamePageElem.sidebar.messenger
        messengerService.addMessage(this.message);
    }
}
