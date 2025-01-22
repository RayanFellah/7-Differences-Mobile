import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChannelWidgetComponent } from '@app/components/channel-widget/channel-widget.component';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { ObserverAreaComponent } from '@app/components/observer-area/observer-area.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Difference } from '@app/interfaces/difference';
import { AuthentificationService } from '@app/services/authentification.service';
import { BlinkerService } from '@app/services/blinker.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { CurrentGameService } from '@app/services/current-game.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameHistoryService } from '@app/services/game-history.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { ImageUpdateService } from '@app/services/image-update.service';
import { LanguageService } from '@app/services/language.service';
import { ReplayService } from '@app/services/replay.service';
import { ShopService } from '@app/services/shop.service';
import { SocketService } from '@app/services/socket.service';
import { GameMode } from '@common/game-classes';
import { GameStats } from '@common/gameStats';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-game-page-classic1v1',
  templateUrl: './game-page-classic1v1.component.html',
  styleUrls: ['./game-page-classic1v1.component.scss'],
  providers: [BlinkerService, CheatModeService, CurrentGameService],
})
export class GamePageClassic1v1Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas3') canvas3: ObserverAreaComponent;
  @ViewChild('canvas4') canvas4: ObserverAreaComponent;
  @ViewChild('leftPlayArea') leftPlayArea: PlayAreaComponent;
  @ViewChild('rightPlayArea') rightPlayArea: PlayAreaComponent;
  @ViewChild('counter') counter: CounterComponent;
  @ViewChild('counter2') counter2: CounterComponent;
  @ViewChild('counter3') counter3: CounterComponent;
  @ViewChild('counter4') counter4: CounterComponent;
  @ViewChild('timer') timer: ChronometreComponent;
  @ViewChild('sidebar') sidebar: SidebarComponent;
  @ViewChild('chat') chat: ChannelWidgetComponent;
  
  private destroy$ = new Subject<any>();
  ischecked1: boolean = true;
  ischecked2: boolean = false;
  ischecked3: boolean = false;
  ischecked4: boolean = false;

  colorObserver: string = "red";
  observerName: string ;


  isChatVisible: boolean = false;

  audio: HTMLAudioElement;
  isBlinking: boolean;
  pageLoaded: boolean;
  initialTime: Date;
  buttonTitle: string;
  message: string;
  wantToQuit: boolean;
  isObserver: boolean=false;

  username: string;
  username2: string;
  username3: string;
  username4: string;

  playerNumber: number;
  playerNames: string[];

  winner: string;

  diff: Difference[] | undefined;

  originalImage: ImageBitmap;
  img1: ImageBitmap;
  img2: ImageBitmap;
  img1src: string;
  img2src: string;
  link1: string;
  link2: string;

  gameEnded: boolean;
  cheatMode: boolean;
  leader: boolean;

  selectedPlayer: string = '1';
  tempsDebut: number = 120; 
  cheatModeValid: boolean = false;

  nbOfObservers: number = 0;

  moneyWon: number;
  hasGameMultiplier: boolean;

  private finishGameSubscription: any;
  private endGameSubscription: any;

  constructor(
    private imageTransfer: ImageTransferService,
    public gameInfo: GameInfoService,
    private differencesDetectionService: DifferencesDetectionService,
    private imageUpdateService: ImageUpdateService,
    public blinker: BlinkerService,
    private cheatModeService: CheatModeService,
    private currentGameService: CurrentGameService,
    private gameHistoryService: GameHistoryService,
    private replayService: ReplayService,
    private socketService: SocketService,
    public authService: AuthentificationService,
    private shopService: ShopService,
    public router: Router, 
    protected ls: LanguageService,
  ) {
    this.replayService.isSolo = false;
    this.replayService.restartTimer();
  }

  ngOnInit() {
    this.initialiseGame();

    this.differencesDetectionService.difference.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.diff = x;
    });

    this.shopService.getBoughtItems(this.authService.currentUser!.username).subscribe((res: any) => {
      this.shopService.itemIsOwned(res.body.boughtItems, 'Multiplicateur x2') ? this.hasGameMultiplier = true : this.hasGameMultiplier = false;
    });


   
    this.gameInfo.playerNumber.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      if (x !== -1) {
        this.playerNumber = x;
        console.log('Player number: ' + this.playerNumber);
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

        //    this.currentGameService.init(x);
      }
    });

    this.gameInfo.cheatModeActivated.pipe(takeUntil(this.destroy$)).subscribe((x) => {

      this.cheatModeValid = x;
   
  });
  this.socketService.listen('updateObserversNumber').subscribe((x: any) => {
    this.nbOfObservers = x;

  });
  this.finishGameSubscription = this.socketService.listen('finishGame').subscribe((x: any) => {
    console.log('finishGame',x);
    console.log(x);
    console.log(x.winner.gameStats.winner.username);

    if (x) {

      this.winner = x.winner.gameStats.winner.username;
      this.endGameReset(this.winner);
      console.log('end game: winner: ', this.winner, 'username: ', this.username);
      this.moneyWon = this.winner == this.authService.currentUser!.username ? 5 : 1;
      this.moneyWon = this.hasGameMultiplier ? this.moneyWon * 2 : this.moneyWon;
      const newDinars = this.authService.currentUser?.dinars! + this.moneyWon;
      this.currentGameService.emitMoney({username: this.authService.currentUser?.username, money: newDinars});
      this.authService.currentUser!.dinars = newDinars;
      this.message = this.winner + ' a gagné la partie! Vous avez gagné ' + this.moneyWon + ' dinars!';
    }
  });


    /// Observer
    if(this.gameInfo.isObserver){
      this.isObserver = true;

      this.gameInfo.observerData.pipe(takeUntil(this.destroy$)).subscribe((x: any) => {
        if (x){
          
          console.log('Observer data: ' + x);
          console.log(x.color);
          console.log('Observer data player names: ' + x.players);
          this.observerName = x.observerName;
          console.log('Observer from GamePage: ' + this.observerName);
          this.colorObserver = x.color;
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

        for(let diff of x.found){
          console.log('Found diff: ' + diff);
          const updated = this.imageUpdateService.updateImage([diff], this.canvas1, this.canvas2, this.img1, this.img2);
        this.canvasToUrl(updated.c1, updated.c2);

        }

        

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



    window.addEventListener('keydown', this.keydownHandler);

    // The image loading logic remains unchanged
    const image = new Image();
    image.src = this.img1src;
    image.onload = () => {
      createImageBitmap(image).then((btmp) => {
        this.originalImage = btmp;
      });
    }
  }

  initialiseGame() {

    this.audio = new Audio();
    this.link1 = this.imageTransfer.link1;
    this.img1src = this.imageTransfer.img1;
    this.link2 = this.imageTransfer.link2;
    this.img2src = this.imageTransfer.img2;
    this.diff = this.imageTransfer.diff;
    this.username = this.gameInfo.username;
    this.username2 = this.gameInfo.username2;
    this.username3 = this.gameInfo.username3;
    this.gameEnded = false;
    this.cheatMode = false;
    this.leader = this.gameInfo.isLeader;
    this.differencesDetectionService.setDifference(this.diff);
    this.destroy$ = new Subject<any>();
    this.isBlinking = false;
    this.pageLoaded = false;
    this.buttonTitle = 'Oui';
    this.message = 'Êtes-vous sûr de quitter la partie ?';
    this.wantToQuit = false;
    
  }
  async setup() {

    const image1 = new Image();
    image1.src = this.img1src;
    image1.onload = () => {
      createImageBitmap(image1).then((btmp) => {
        this.img1 = btmp;
      });
      const image2 = new Image();
      image2.src = this.img2src;
      image2.onload = () => {
        createImageBitmap(image2).then((btmp) => {
          this.img2 = btmp;
          this.differencesDetectionService.resetFound();
          this.differencesDetectionService.resetCount();

          this.blinker.init(this.canvas1, this.canvas2);
          this.blinker.canvas1.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.canvas1 = x;
            this.canvasToUrl(this.canvas1, this.canvas2);
          });
          this.blinker.isBlinking.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.isBlinking = x;
          });

          this.cheatModeService.init();
          this.differencesDetectionService.found.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x) {
              if (this.pageLoaded) {
                this.refresh(x);
              } else {
                const updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
                this.canvasToUrl(updated.c1, updated.c2);
              }
            }
          });
          this.currentGameService.diffArray.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x) {
              this.differencesDetectionService.setDifference(this.diff);
              if (this.pageLoaded) {
                this.refresh(x);
              } else {
                const updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
                this.canvasToUrl(updated.c1, updated.c2);
              }
            }
          });
          this.counter.reset();
          this.counter2.reset();
          this.counter3.reset();
          this.counter4.reset();
          this.currentGameService.resetCounts();
          this.currentGameService.playerCounts.pipe(takeUntil(this.destroy$)).subscribe(counts => {
            this.counter.count = counts[0] || 0;
            this.counter2.count = counts[1] || 0;
            this.counter3.count = counts.length > 2 ? counts[2] : 0; // Update counter for the third player if present
            this.counter4.count = counts.length > 3 ? counts[3] : 0; // Update counter for the fourth player if present
          });
          this.endGameSubscription = this.currentGameService.endGame.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            const result = x[0];
            const quit = x[1];
            if (result) {
              this.endGame(this.winner, quit);
            }
          });
          this.currentGameService.winner.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.winner = x;
          });

          this.initialTime = new Date()
          this.pageLoaded = true;
        });
      };
    };

  }

  ngAfterViewInit() {
    this.setup();
    this.timer.stop();
    this.timer.startCountDownFrom(this.tempsDebut);

    //here add same changes (need to do it for gamePage also)
    this.gameInfo.initialTimeGame.subscribe((x) => {
      this.timer.startCountDownFrom(x);
      this.tempsDebut = x;
    });
    this.chat.gameMode();
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
    image1.onload = () => {
      createImageBitmap(image1).then((btmp) => {
        this.img1 = btmp;
      });
    };
    this.link1 = 'url(' + url1 + ')';
  }

  onContinue(eventData: { quit: boolean, message: string }) {
    this.wantToQuit = eventData.quit;
    if (eventData.quit && eventData.message === 'Êtes-vous sûr de quitter la partie ?') {
     // this.currentGameService.gameEnded(true, this.gameEndData());
      this.socketService.emit('leaveGameMulti', {  observer: this.isObserver ,observerName: this.observerName});
    }
  }

  async playAudio() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src =  this.authService.specialSuccessSoundUsed ? "assets/special-audios/success-sound.mp3" : "assets/audio/success.mp3";
    await this.audio.play().catch((err: any) => {
      console.log(err);
    });
  }

  onKeydown() {
    if (this.cheatMode && this.cheatModeValid) {
      this.cheatModeService.startBlink();
    } else {
      this.cheatModeService.stopBlink();
    }
  }

  async endGame(winner: string, quit: boolean) {
    this.endGameReset(this.winner);
    // console.log('end game: winner: ', this.winner, 'username: ', this.username);
    this.currentGameService.gameEnded(false, this.gameEndData());
    if (winner == this.username) {
      console.log('winner');
      const duration = new Date().getTime() - this.initialTime.getTime();
      await this.gameHistoryService.uploadHistory(GameMode.CLASSIQUE_1V1, this.initialTime, duration, this.username, this.username2, quit);
      if (!quit) {
        await this.gameHistoryService.uploadNewTime(GameMode.CLASSIQUE_1V1, duration, this.username, this.gameInfo.gameCardId as string);
      }
    }
  }

  endGameReset(winner: string) {
    this.cheatModeService.stopBlink();
    window.removeEventListener('keydown', this.keydownHandler);
    this.gameEnded = this.router.url !== '/replay';
    console.log('endzzzzzz', this.gameEnded);
    this.timer.stop();
    // this.message = winner + ' a gagné la partie! Vous avez gagné ' + this.moneyWon + ' dinars!';
  }
 
  keydownHandler = (event: KeyboardEvent): void => {
    if (event.key === 't' || event.key === 'T') {
      this.cheat();
    }
  };

  cheat() {
    this.cheatMode = !this.cheatMode;
    this.onKeydown();
    this.replayService.addCheatModeEventReplay();
  }

  clickChat() {
    window.removeEventListener('keydown', this.keydownHandler);
  }

  closeChat() {
    window.addEventListener('keydown', this.keydownHandler);
  }

  private gameEndData() {
    const noOfPlayers = this.currentGameService.playerCounts.value.length;
    
    // Créez dynamiquement la liste des joueurs et leurs scores basés sur le nombre de joueurs
    const players = [];
    let highestScore = -1;
    let winner;
  
    for (let i = 0; i < noOfPlayers; i++) {
      let username = '';
      switch (i) {
        case 0: username = this.username; break;
        case 1: username = this.username2; break;
        case 2: username = this.username3; break;
        case 3: username = this.username4; break;
      }
      const score = this.currentGameService.playerCounts.value[i];
  
      // Déterminez le gagnant
      if (score > highestScore) {
        highestScore = score;
        winner = { username: username, score: score };
      }
  
      // Ajoutez l'objet joueur dans le tableau
      players.push({ username, score });
    }
    
    const gameStats: GameStats = {
      players: players,
      winner: winner, // Ajoutez le gagnant ici
      gameTime: new Date().getTime() - this.initialTime.getTime()
    };
    
    return gameStats;
  }
  
  
   toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }

  ngOnDestroy(): void {
    this.cheatModeService.stopBlink();
    this.destroy$.next('destroy');
    this.destroy$.complete();
    window.removeEventListener('keydown', this.keydownHandler);
    this.counter.reset();
    this.counter2.reset();
    this.counter3.reset();
    this.counter4.reset();
    this.currentGameService.resetCounts();
    this.replayService.stopTimer();
    this.finishGameSubscription.unsubscribe();
    this.timer.stop();
    this.endGameSubscription.unsubscribe();
  }


}
