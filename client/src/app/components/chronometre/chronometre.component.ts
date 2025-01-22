import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { constsTimer } from '@common/consts';

@Component({
    selector: 'app-chronometre',
    templateUrl: './chronometre.component.html',
    styleUrls: ['./chronometre.component.scss'],
})
export class ChronometreComponent implements OnInit {
    @Output() private timeUp: EventEmitter<boolean> = new EventEmitter<boolean>();
    seconds: number = 0;
    minutes: number = 0;
    private isPenalty: boolean = false;
    chrono: string = '00:00';
    interval: ReturnType<typeof setInterval>;
    penalty: number = 0;

    constructor(private gameConstantsService: GameConstantsService, private readonly gameInfoService: GameInfoService) {}

    ngOnInit(): void {
        this.setPenalty();
        this.startTimer();
    }

    async setPenalty() {
        const res = await this.gameConstantsService.getConstants();
        if (!res.penalty) {
            const defaultconsts = this.gameConstantsService.defaultConstants();
            this.penalty = defaultconsts.penalty;
        } else {
            this.penalty = res.penalty;
        }
    }

    convertTimeToString = () => {
        if (this.seconds > constsTimer.SECONDS_LIMIT) {
            this.minutes += 1;
            this.seconds -= constsTimer.MINUTE;
        }
        if (this.seconds < 0) {
            this.minutes -= 1;
            this.seconds += constsTimer.MINUTE;
        }
        this.chrono = String(this.minutes).padStart(constsTimer.MAX_STRING_LENGTH, '0') + ':' +
            String(this.seconds).padStart(constsTimer.MAX_STRING_LENGTH, '0');
    };

    decrease = () => {
        if (this.seconds === 0 && this.minutes === 0) {
            return;
        }
        if (this.isPenalty) {
            this.isPenalty = false;
            this.seconds -= this.penalty;
        }
        else {
            this.seconds -= 1;
        }
        this.gameInfoService.time = this.seconds;
        this.convertTimeToString();
    };

    increase = () => {
        if (this.isPenalty) {
            this.isPenalty = false;
            this.seconds += this.penalty;
        }
        else {
            this.seconds += 1;
        }
        this.gameInfoService.time = this.seconds;
        this.convertTimeToString();
    };

    startTimer(interval: number = constsTimer.INTERVAL_TIMEOUT) {
        console.log('start timer'+interval);
        this.interval = setInterval(this.decrease, interval);
    }

    applyPenalty(isClassic: boolean) {
        this.isPenalty = true;
        if (isClassic) {
            this.increase();
        }
        else {
            this.decrease();
        }
    }

    addTime(time: number) {
        this.seconds += time;
        this.convertTimeToString();
    }

    countDown = () => {
        this.decrease();
        if (this.seconds === 0 && this.minutes === 0) {
            this.stop();
            this.timeUp.emit(true);
        }
    }

    startCountDownFrom(seconds: number) {
        this.stop();
        this.seconds = seconds;
        this.interval = setInterval(this.countDown, constsTimer.INTERVAL_TIMEOUT);
    }

    stop() {
        clearInterval(this.interval);
        this.seconds = 0;
        this.minutes = 0;
    }
}
