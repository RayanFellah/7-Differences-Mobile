import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Difference } from '@app/interfaces/difference';
import { BlinkerService } from '@app/services/blinker.service';

import { CheatModeService } from '@app/services/cheat-mode.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameHistoryService } from '@app/services/game-history.service';
import { GameInfoService } from '@app/services/game-info.service';

import { SocketService } from '@app/services/socket.service';
import { GameMode } from '@common/game-classes';

import { Inject } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';
import { CardQueueService } from '@app/services/card-queue.service';
import { CurrentGameService } from '@app/services/current-game.service';
import { LanguageService } from '@app/services/language.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
    providers: [BlinkerService, CheatModeService, CardQueueService],
})
export class LimitedTimePageComponent {
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;

    @ViewChild('counter') counter: CounterComponent;
    @ViewChild('counter2') counter2: CounterComponent;
  @ViewChild('counter3') counter3: CounterComponent;
  @ViewChild('counter4') counter4: CounterComponent;
    @ViewChild('timer') timer: ChronometreComponent;
    @ViewChild('play1') play1: PlayAreaComponent;
    @ViewChild('play2') play2: PlayAreaComponent;
    selectedPlayer: string = '1';

    ischecked1: boolean = true;
    ischecked2: boolean = true;
    ischecked3: boolean = true;
    ischecked4: boolean = true;

    isBlinking: boolean = false;
    pageLoaded: boolean = false;
    boolStartImage: boolean = false;
    leader=false;
    initialTime: Date;
    destroy$ = new Subject<any>();
    buttonTitle: string = 'Oui';
    message: string = 'Êtes-vous sûr de quitter la partie ?';
    wantToQuit: boolean = false;
    username = '';
    diff: Difference[] | undefined;
    originalImage: ImageBitmap;
    img1: ImageBitmap;
    img2: ImageBitmap;
    img1src: string;
    img2src: string;
    link1 = '';
    link2 = '';

    isDiff: boolean = false;
    gameEnded: boolean = false;
    cheatMode: boolean = false;
    isCoop: boolean = false;
    coopId: string = '';
    otherPlayerLeft: boolean = false;
    otherPlayerName: string = '';
    playerNumber: number;
  playerNames: string[];
  isObserver: boolean = false;

    username2: string;
    username3: string;
    username4: string;

    winner: string;
    tempsDebut:number=120;
    timewon:number=0;
    maxTime: number = 120;

    cheatModeValid: boolean = false;

    colorObserver: string = "red";
    observerName: string;

    nbOfObservers: number = 0;

    isChatVisible: boolean = false;


    constructor(
        private gameInfo: GameInfoService,
        private differencesDetectionService: DifferencesDetectionService,
        private blinker: BlinkerService,
        private cheatModeService: CheatModeService,
        private socketService: SocketService,
        @Inject(CardQueueService) private cardQueueService: CardQueueService,
        private cdRef: ChangeDetectorRef,
        private gameHistoryService: GameHistoryService,
        private currentGameService: CurrentGameService,
        public authService: AuthentificationService,
        protected ls : LanguageService,
    ) {}
    ngAfterViewInit() {
        this.username = this.gameInfo.username;
        if (this.gameInfo.CoopUsername.length > 0) {
            this.gameInfo.isSolo = false;
            this.isCoop = true;
            this.username = this.gameInfo.CoopUsername[0] + ' et ' + this.gameInfo.CoopUsername[1];
            this.coopId = this.gameInfo.CoopId;
            if (this.gameInfo.CoopUsername[0] === this.gameInfo.username) {
                this.otherPlayerName = this.gameInfo.CoopUsername[1];
            }
            else {
                this.otherPlayerName = this.gameInfo.CoopUsername[0];
            }
        }


        this.cardQueueSetup();
        console.log(this.ls);


        window.addEventListener('keydown', this.keydownHandler);
        const image = new Image();
        image.src = this.img1src;
        image.onload = () => {
            createImageBitmap(image).then((btmp) => {
                this.originalImage = btmp;
            });
        }

        this.socketService.listen('playerLeft').subscribe((x) => {
            this.username = this.gameInfo.username;
            this.gameInfo.CoopUsername = [];
            this.otherPlayerLeft = true;
            this.isCoop = false;

        });
        this.gameInfo.cheatModeActivated.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            console.log('Cheat mode valide: ' + x);

            this.cheatModeValid = x;
         
        });
        this.gameInfo.playerNumber.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x !== -1) {
              this.playerNumber = x;
              console.log('Player number: ' + this.playerNumber);
              if (this.playerNumber === 0) {
                this.leader = true;
                if(!this.boolStartImage){
                    this.cardQueueService.getNext();
                    this.boolStartImage = true;
                }
              }
              console.log('Leader: ' + this.leader);
            }
      
          });
          this.gameInfo.playerNames.pipe(takeUntil(this.destroy$)).subscribe((x: any) => {
            if (x) {
              this.playerNames = x;
              this.username = this.playerNames[0];
              this.username2 = this.playerNames[1];
              if (this.playerNames.length > 2) {
                this.username3 = this.playerNames[2];
              }
              if (this.playerNames.length > 3) {
                this.username4 = this.playerNames[3];
              }
              console.log('Player names: ' + this.playerNames);
            }
          });
          this.currentGameService.resetCounts();
          this.currentGameService.playerCounts.pipe(takeUntil(this.destroy$)).subscribe(counts => {
            console.log('Counts: ' + counts);
            console.log('Player number: ' + this.playerNumber);
            
            const arrayCounter=[this.counter.count,this.counter2.count,this.counter3.count,this.counter4.count];
            console.log('Array counter: ' + arrayCounter);
           // if(arrayCounter[this.playerNumber]!= counts[this.playerNumber]){
              
                if((this.timer.minutes*60+this.timer.seconds)+10>this.maxTime){
                    console.log('Temps max atteint');

                    this.timer.startCountDownFrom(this.maxTime);
                }else{
                    this.timer.addTime(this.timewon);  // temps gagné

                }
                console.log('Temps gagné: ' + this.timewon);
           // }
          
            this.counter.count = counts[0] || 0;
            this.counter2.count = counts[1] || 0;
            this.counter3.count = counts.length > 2 ? counts[2] : 0; // Update counter for the third player if present
            this.counter4.count = counts.length > 3 ? counts[3] : 0; // Update counter for the fourth player if present

            
          });
          this.currentGameService.winner.pipe(takeUntil(this.destroy$)).subscribe(winner => {
            this.winner = winner;
          });
          this.currentGameService.endGame.pipe(takeUntil(this.destroy$)).subscribe(([end, quit]) => {
            if (end && !this.gameEnded) {
                console.log('End game');
                console.log(quit);
                console.log(end);
              this.endGame(quit);
            }
          });
          this.socketService.listen('updateObserversNumber').subscribe((x: any) => {
            this.nbOfObservers = x;
        
          });
           /// Observer
    if(this.gameInfo.isObserver){
        this.isObserver = true;

        this.gameInfo.observerData.pipe(takeUntil(this.destroy$)).subscribe((x: any) => {
          if (x){
            console.log('Observer data: ' + x);
            console.log('Observer data player names: ' + x.players);
            this.colorObserver = x.color;
            this.observerName = x.observerName;
            this.playerNames = x.players;	
          this.username = this.playerNames[0];
          this.username2 = this.playerNames[1];
          if (this.playerNames.length > 2) {
            this.username3 = this.playerNames[2];
          }
          if (this.playerNames.length > 3) {
            this.username4 = this.playerNames[3];
          }
          console.log('Player names: ' + this.playerNames);
  
          this.counter.count= x.counters[0];
          this.counter2.count= x.counters[1];
          this.counter3.count= x.counters[2];
          this.counter4.count= x.counters[3];
          this.cardQueueService.setImages(x);
  
  
          
  
          }
     
         
        });
        this.socketService.listen('updateTimer').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          if (res) {
            console.log('updateTimer');
            this.timer.stop();
            this.timer.startCountDownFrom(res);
          }
        });
  
      }else{
        this.isObserver = false;
  
        this.socketService.listen('requestTimerRedirection').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
          if (res) {
            console.log('requestTimerRedirection');
            const time= this.timer.minutes*60 + this.timer.seconds;
            
            this.socketService.emit('timerRedirection', {timer:time, socket:res});
          }
        });
      }
      ///
      
        this.changeImage();
        this.defaultInit();
    }
    onCheckboxChange(index: number): void {
        switch (index) {
            case 1:
                this.ischecked1 = !this.ischecked1;
                console.log('Checkbox 1 state:', this.ischecked1);
                break;
            case 2:
                this.ischecked2 = !this.ischecked2;
                console.log('Checkbox 2 state:', this.ischecked2);
                break;
            case 3:
                this.ischecked3 = !this.ischecked3;
                console.log('Checkbox 3 state:', this.ischecked3);
                break;
            case 4:
                this.ischecked4 = !this.ischecked4;
                console.log('Checkbox 4 state:', this.ischecked4);
                break;
        }
    }


    cardQueueSetup = () => {
        if(this.leader){
            this.cardQueueService.getNext();
            this.boolStartImage = true;
        }
            
        
        
        this.cardQueueService.leftImageURL.pipe(takeUntil(this.destroy$)).subscribe((x:any) => {
            this.link1 = x;

            if (this.link1 !== '' && this.link2 !== '') {
                this.changeImage();
            }

        });
        this.cardQueueService.rightImageURL.pipe(takeUntil(this.destroy$)).subscribe((x:any) => {
            this.link2 = x

            if (this.link1 !== '' && this.link2 !== '') {
                this.changeImage();
            }

        });
        this.cardQueueService.leftImage.pipe(takeUntil(this.destroy$)).subscribe((x:any) => {
            this.img1src = x
            this.changeImage();

        });
        this.cardQueueService.rightImage.pipe(takeUntil(this.destroy$)).subscribe((x:any) => {
            this.img2src = x;
            this.changeImage();

        });

        this.cardQueueService.differences.pipe(takeUntil(this.destroy$)).subscribe((x:any) => {
            this.diff = x
            this.differencesDetectionService.setDifference(this.diff);
        });
        this.differencesDetectionService.setDifference(this.diff);
     
       // this.cardQueueService.gameEnded.subscribe(async (x:any) => {
       //     if (x) {
       //         await this.endGame(false);
       //     }
       // });



    }





    defaultInit = () => {



        this.differencesDetectionService.resetFound();
        this.differencesDetectionService.resetCount();

        this.blinker.init(this.canvas1, this.canvas2);
        this.blinker.canvas1.pipe(takeUntil(this.destroy$)).pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.canvas1 = x;
            this.canvasToUrl(this.canvas1, this.canvas2);
        });
        this.blinker.isBlinking.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.isBlinking = x;
        });

        this.cheatModeService.init();
        this.cheatModeService.setBlinkerService(this.blinker);
        this.differencesDetectionService.found.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x) {
                console.log('Found');
                console.log(x);
           

                if (this.pageLoaded) {
       

                    if(this.leader){
                        this.cardQueueService.getNext();
                    }
                    this.playAudio();
                }
            }
        });


        this.counter.reset();

       // if (this.gameInfo.initialTime > 120) {
       //     this.gameInfo.initialTime = 120;
       // }
        this.timer.startCountDownFrom(this.tempsDebut);

        this.gameInfo.initialTimeGame.subscribe((x) => {
            this.timer.startCountDownFrom(x);
            this.tempsDebut=x;

        });
        this.gameInfo.maxTime.subscribe((x) => {

            this.maxTime=x;
        });
        this.gameInfo.timeWonGame.subscribe((x) => {
            this.timewon=x;
        });
        //this.timer.startCountDownFrom(120);
        this.initialTime = new Date()
        this.pageLoaded = true;
    }


    async changeImage(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const image1 = new Image();
            image1.src = this.img1src;
            image1.onload = () => {
                createImageBitmap(image1).then((btmp) => {
                    this.img1 = btmp;
                });
                const image2 = new Image();
                image2.src = this.img2src;
                image2.onload = () => {
                    createImageBitmap(image2).then(async (btmp) => {
                        this.img2 = btmp;
                        const ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                        const ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                        ctx1.drawImage(this.img1, 0, 0, this.canvas1.nativeElement.width, this.canvas1.nativeElement.height);
                        ctx2.drawImage(this.img2, 0, 0, this.canvas2.nativeElement.width, this.canvas2.nativeElement.height);
                        resolve();

                    });
                };
            };
        });
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
        image1.onload = () => {
            createImageBitmap(image1).then((btmp) => {
                this.img1 = btmp;
            });
        };
        this.link1 = 'url(' + url1 + ')';

        this.cdRef.detectChanges();
    }



    onContinue(eventData: { quit: boolean, message: string }) {
        this.wantToQuit = eventData.quit;
        if (eventData.quit && eventData.message === 'Êtes-vous sûr de quitter la partie ?') {
            //this.endGame(true);
            this.socketService.emit('leaveGameLimite', {  observer: this.isObserver , observerName: this.observerName});
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
        console.log('keydown: ' + this.cheatModeValid);
        if (this.cheatMode && this.cheatModeValid) {
            console.log('Cheat mode activated');
            this.cheatModeService.startBlink();
        } else {
            this.cheatModeService.stopBlink();
        }
    }

  
    async endGame(quit: boolean): Promise<void> {
        this.cheatModeService.stopBlink();
        window.removeEventListener('keydown', this.keydownHandler);
        this.gameEnded = true;
        
        
        if (this.timer.minutes === 0 && this.timer.seconds === 0) {
        
            this.socketService.emit('timeFinished', null); //added socket for timer 0 
        }

        this.socketService.emit('leaveGame', null);
        console.log('End game function');
        console.log('Quit: ' + quit);
        console.log(this.timer.minutes);
        console.log(this.timer.seconds);

        this.message = (this.timer.minutes === 0 && this.timer.seconds === 0) ? 'Temps écoulé!' : 'Bravo vous avez complété toutes les fiches!';
        
        this.timer.stop();
        const gameMode = this.gameInfo.isSolo ? GameMode.TEMPS_LIMITE : GameMode.TEMPS_LIMITE_COOP;
        const duration = new Date().getTime() - this.initialTime.getTime();

        if (gameMode === GameMode.TEMPS_LIMITE || this.gameInfo.CoopUsername.length === 0) {
            await this.gameHistoryService.uploadHistory(gameMode, this.initialTime, duration, this.username, this.otherPlayerName, quit, this.otherPlayerLeft);
        }
        // FOR NEXT GAME //
        this.gameInfo.initialTime=120;
        this.currentGameService.endGame.next([false, false]);
        this.ngOnDestroy();
    }

    keydownHandler = (event: KeyboardEvent): void => {
        console.log('keydown handler: ' + event.key);
        if (event.key === 't' || event.key === 'T') {
            console.log('t');

            this.cheatMode = !this.cheatMode;
            this.onKeydown();
        }
    };

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }

    ngOnDestroy(): void {

        this.cheatModeService.stopBlink();
        this.destroy$.next('destroy');
        this.destroy$.complete();
        window.removeEventListener('keydown', this.keydownHandler);



        this.socketService.emit('leaveGame', null);

    }
}
