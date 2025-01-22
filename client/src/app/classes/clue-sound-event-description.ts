import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class ClueSoundEventDescription extends EventDescription {
    private isActive: boolean;
    private playbackRate?: number;

    constructor(time: number, isActive: boolean, playbackRate?: number) {
        super(time);
        this.isActive = isActive;
        this.playbackRate = playbackRate;
    }

    play(replayPage: ReplayPageComponent): void {
        const clueService = replayPage.gamePage.clues.clueService;
        if (this.isActive) {
            if (!clueService.isIntervalActive)
                clueService.initClue3Interval();
            clueService.setAudioPlayBackRate(this.playbackRate as number);
        } else {
            clueService.stopClue3Interval();
        }
    }
}