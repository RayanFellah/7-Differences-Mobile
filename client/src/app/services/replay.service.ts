import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CheatModeEventDescription } from "@app/classes/cheat-mode-event-description";
import { ClickEventDescription } from "@app/classes/click-event-description";
import { ClueFrameEventDescription } from "@app/classes/clue-frame-event-description";
import { ClueSoundEventDescription } from "@app/classes/clue-sound-event-description";
import { CounterEventDescription } from "@app/classes/counter-event-description";
import { EndGameEventDescription } from "@app/classes/end-game-event-description";
import { MessageEventDescription } from "@app/classes/message-event-description";
import { ObserverEventDescription } from "@app/classes/observer-event-description";
import { Message } from "@common/message";
import { Vec2 } from "@common/vec2";
import { ClickHistoryService } from "./click-history.service";

@Injectable({
    providedIn: "root",
})
export class ReplayService {
    isSolo: boolean;

    constructor(private clickHistoryService: ClickHistoryService, private router: Router) {}


    restartTimer() {
        if (this.router.url !== '/replay') {
            this.clickHistoryService.reinit();
            this.clickHistoryService.startTimer();
        }
    }

    stopTimer() {
        this.clickHistoryService.stopTimer();
    }

    addClickEventReplay(coord: Vec2) {
        if (this.router.url !== '/replay') {
            const event = new ClickEventDescription(
                this.clickHistoryService.timeFraction,
                coord.x,
                coord.y
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addCounterEventReplay(userCounter: number[]) {
        if (this.router.url !== '/replay') {
            const event = new CounterEventDescription(
                this.clickHistoryService.timeFraction,
                userCounter,
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addCheatModeEventReplay() {
        if (this.router.url !== '/replay') {
            const event = new CheatModeEventDescription(
                this.clickHistoryService.timeFraction
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addClueFrameEventReplay(nCluesLeft: number, dot: Vec2) {
        if (this.router.url !== '/replay') {
            const event = new ClueFrameEventDescription(
                this.clickHistoryService.timeFraction,
                nCluesLeft,
                dot
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addClueSoundEventReplay(isActive: boolean, playbackRate?: number) {
        if (this.router.url !== '/replay') {
            const event = new ClueSoundEventDescription(
                this.clickHistoryService.timeFraction,
                isActive,
                playbackRate
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addMessageEventReplay(message: Message) {
        if (this.router.url !== '/replay') {
            const event = new MessageEventDescription(
                this.clickHistoryService.timeFraction,
                message
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addEndGameEventReplay() {
        if (this.router.url !== '/replay') {
            const event = new EndGameEventDescription(
                this.clickHistoryService.timeFraction
            );
            this.clickHistoryService.addEvent(event);
        }
    }

    addObserverEventReplay(rectangle: {startX:number, startY:number, width:number, height:number}, color: string) {
        if (this.router.url !== '/replay') {
            const event = new ObserverEventDescription(
                this.clickHistoryService.timeFraction,
                rectangle,
                color
            );
            this.clickHistoryService.addEvent(event);
        }
    }
}