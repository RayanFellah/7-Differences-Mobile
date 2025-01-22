import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";

export abstract class EventDescription {
    time: number;

    constructor(time: number) {
        this.time = time;
    }

    play(replayPage: ReplayPageComponent): void{
        console.log("Playing event at time: " + this.time);
    };
}	
