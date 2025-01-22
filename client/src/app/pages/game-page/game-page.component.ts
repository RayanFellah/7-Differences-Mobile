import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { ClueComponent } from '@app/components/clue/clue.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Difference } from '@app/interfaces/difference';
import { BlinkerService } from '@app/services/blinker.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameHistoryService } from '@app/services/game-history.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { ImageUpdateService } from '@app/services/image-update.service';
import { ReplayService } from '@app/services/replay.service';
import { SocketService } from '@app/services/socket.service';
import { GameMode } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [BlinkerService, CheatModeService],
})
export class GamePageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
    @ViewChild('leftPlayArea') leftPlayArea: PlayAreaComponent;
    @ViewChild('rightPlayArea') rightPlayArea: PlayAreaComponent;
    @ViewChild('counter') counter: CounterComponent;
    @ViewChild('timer') timer: ChronometreComponent;
    @ViewChild('sidebar') sidebar: SidebarComponent;
    @ViewChild('clues') clues: ClueComponent;
    destroy$: Subject<any>;
    pageLoaded: boolean;
    initialTime: Date;
    buttonTitle: string;
    message: string;
    wantToQuit: boolean;

    username: string;

    diff: Difference[] | undefined;

    originalImage: ImageBitmap;
    img1: ImageBitmap;
    img2: ImageBitmap;
    img1src: string;
    img2src: string;
    link1: string;
    link2: string;

    isDiff: boolean;
    gameEnded: boolean;
    cheatMode: boolean;
    isChatVisible: boolean = false;

    constructor(
        public imageTransfer: ImageTransferService,
        private gameInfo: GameInfoService,
        public differencesDetectionService: DifferencesDetectionService,
        public imageUpdateService: ImageUpdateService,
        public blinker: BlinkerService,
        private cheatModeService: CheatModeService,
        private socketService: SocketService,
        private gameHistoryService: GameHistoryService,
        private replayService: ReplayService,
        public router: Router
    ) {
        this.replayService.isSolo = true;
        this.replayService.restartTimer();
    }

    ngOnInit() {
        this.destroy$ = new Subject<any>();
        this.pageLoaded = false;
        this.buttonTitle = 'Oui';
        this.message = 'Êtes-vous sûr de quitter la partie ?';
        this.wantToQuit = false;
        this.isDiff = false;
        this.gameEnded = false;
        this.cheatMode = false;
        this.initialiseGame();
        this.differencesDetectionService.difference.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.diff = x;
        });
        window.addEventListener('keydown', this.keydownHandler);
        const image = new Image();
        image.src = this.img1src;
        image.onload = async () => {
            createImageBitmap(image).then((btmp) => {
                this.originalImage = btmp;
            });
        }
    }


    ngAfterViewInit() {
        const image1 = new Image();
        image1.src = this.img1src;
        image1.onload = async () => {
            createImageBitmap(image1).then((btmp) => {
                this.img1 = btmp;
            });
            const image2 = new Image();
            image2.src = this.img2src;
            image2.onload = async () => {
                createImageBitmap(image2).then((btmp) => {
                    this.img2 = btmp;
                    this.differencesDetectionService.resetFound();
                    this.differencesDetectionService.resetCount();

                    this.blinker.init(this.canvas1, this.canvas2);
                    this.blinker.canvas1.pipe(takeUntil(this.destroy$)).subscribe((x) => {
                        this.canvas1 = x;
                        this.canvasToUrl(this.canvas1, this.canvas2);
                    });


                    this.cheatModeService.init();
                    this.differencesDetectionService.found.pipe(takeUntil(this.destroy$)).subscribe((x) => {
                        if (x) {
                            this.counter.increase();
                            if (this.pageLoaded) {
                                this.refresh(x);
                            } else {
                                const updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
                                this.canvasToUrl(updated.c1, updated.c2);
                            }
                        }
                    });
                    this.counter.reset();
                    this.initialTime = new Date()
                    this.pageLoaded = true;
                });
            };
        };
    }

    initialiseGame() {
        this.link1 = this.imageTransfer.link1;
        this.img1src = this.imageTransfer.img1;
        this.link2 = this.imageTransfer.link2;
        this.img2src = this.imageTransfer.img2;
        this.diff = this.imageTransfer.diff;
        this.username = this.gameInfo.username;
        this.differencesDetectionService.setDifference(this.diff);
    }

    refresh(x: Difference[]) {
        let updated: { c1: ElementRef<HTMLCanvasElement>, c2: ElementRef<HTMLCanvasElement> };
        if (this.cheatMode) {
            updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.originalImage, this.originalImage);
        } else {
            updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
        }
        this.canvas1 = updated.c1;
        this.canvas2 = updated.c2;
        this.canvasToUrl(this.canvas1, this.canvas2);
        this.playAudio();
        if (this.diff?.length === 0) {
            this.endGame(false);
        }
        if (!this.cheatMode) {
            const ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            const ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.blinker.blinkPixels([x[0]], ctx1, ctx2);
        }
    }

    canvasToUrl(c1: ElementRef<HTMLCanvasElement>, c2: ElementRef<HTMLCanvasElement>) {
        const url2 = c2.nativeElement.toDataURL();
        this.img2src = url2;
        const image2 = new Image();
        image2.src = this.img2src;
        image2.onload = () => {
            createImageBitmap(image2).then((btmp) => {
                this.img2 = btmp;
            });
        };

        this.link2 = 'url(' + url2 + ')';
        const url1 = c1.nativeElement.toDataURL();

        this.img1src = url1;
        const image1 = new Image();
        image1.src = this.img1src;
        image1.onload = async () => {
            createImageBitmap(image1).then((btmp) => {
                this.img1 = btmp;
            });
        };
        this.link1 = 'url(' + url1 + ')';
    }

    onContinue(eventData: { quit: boolean, message: string }) {
        this.wantToQuit = eventData.quit;
        if (eventData.quit && eventData.message === 'Êtes-vous sûr de quitter la partie ?') {
            this.endGame(true);
        }
    }


    playAudio() {
        const TIMEOUT = 1000;
        this.isDiff = true;
        setTimeout(() => {
            this.isDiff = false;
        }, TIMEOUT);

    }

    onKeydown() {
        if (this.cheatMode) {
            this.cheatModeService.startBlink();
        } else {
            this.cheatModeService.stopBlink();
        }
    }

    async endGame(quit: boolean): Promise<void> {
        this.cheatModeService.stopBlink();
        window.removeEventListener('keydown', this.keydownHandler);
        this.gameEnded = this.router.url !== '/replay';
        this.timer.stop();
        this.message = 'Vous avez gagné la partie!';
        this.replayService.addEndGameEventReplay();
        if (this.gameEnded) {
            const duration = new Date().getTime() - this.initialTime.getTime();
            await this.gameHistoryService.uploadHistory(GameMode.CLASSIQUE_SOLO, this.initialTime, duration, this.username, '', quit);
            if (!quit) {
                await this.gameHistoryService.uploadNewTime(GameMode.CLASSIQUE_SOLO, duration, this.username, this.gameInfo.gameCardId as string);
            }
        }
    }

    keydownHandler = (event: KeyboardEvent): void => {
        if (event.key === 't') {
            this.cheat();
        }
    };

    cheat() {
        this.cheatMode = !this.cheatMode;
        this.onKeydown();
        this.replayService.addCheatModeEventReplay();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }

    ngOnDestroy(): void {
        this.cheatModeService.stopBlink();
        this.destroy$.next('destroy');
        this.destroy$.complete();
        window.removeEventListener('keydown', this.keydownHandler);
        this.socketService.emit('leaveGame', null);
        this.replayService.stopTimer();
        this.timer.stop();
    }
}
