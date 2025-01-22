import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EventDescription } from '@app/classes/event-description';
import { videoTool } from '@app/components/control-video-tool/control-video-tool.component';
import { ControlVideoComponent } from '@app/components/control-video/control-video.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { ClickHistoryService } from '@app/services/click-history.service';
import { LanguageService } from '@app/services/language.service';
import { ReplayService } from '@app/services/replay.service';
import { constsTimer } from '@common/consts';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GamePageClassic1v1Component } from '../game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from '../game-page/game-page.component';

@Component({
  selector: 'app-replay-page',
  templateUrl: './replay-page.component.html',
  styleUrls: ['./replay-page.component.scss'],
})
export class ReplayPageComponent implements AfterViewInit {

  @ViewChild('gamePage') gamePage: GamePageComponent;
  @ViewChild('gamePage1v1') gamePage1v1: GamePageClassic1v1Component;
  @ViewChild('controlBar') controlBar: ControlVideoComponent;
  @ViewChild('progressBar') progressBar: HTMLInputElement;

  gamePageElem: GamePageClassic1v1Component;
  currentEvent: EventDescription = {} as EventDescription;
  indexEvent: number = 0;
  lastIndex: number = 0;
  currentState: videoTool = videoTool.play;
  saved: boolean = false;
  
  private readonly baseUrl: string = environment.serverUrlAndPort + '/api/fs/players';

  constructor(
    public readonly clickHistoryService: ClickHistoryService,
    public replayService: ReplayService,
    private readonly dialogRef: MatDialog,
    protected readonly router: Router,
    protected readonly languageService: LanguageService,
    private readonly http: HttpClient,
    private readonly accountSettingsService: AccountSettingsService,
  ) {}


  ngAfterViewInit(): void {
    this.changeCurrentEvent();
    this.clickHistoryService.incremented = new Subject<number>();
    this.clickHistoryService.startTimer();
    this.clickHistoryService.incremented.subscribe((value) => {
      this.playEvents(value);
    });
    this.gamePageElem = this.gamePage1v1;
    document.getElementById('top')?.addEventListener('input', async () => await this.changeTimeSlider());
    console.log(this.clickHistoryService.clickHistory);
    
    console.log(this.gamePageElem.playerNames);
  }

 
  saveReplay() {
    this.saved = true;
    const replay = {
      dateHeure: new Date(),
      gameCardId: this.gamePageElem.gameInfo.gameCardId,
      gameCardName: this.gamePageElem.gameInfo.gameName,
      usernames: this.gamePageElem.playerNames,
      saved: this.saved,
      eventHistory: this.clickHistoryService.clickHistory,
    };
    this.http.post( `${this.baseUrl}/replay`, {user:this.accountSettingsService.currentUser?.id , replay}, {
        observe: 'response',
        responseType: 'text',
    }).subscribe({
        next: (res) => {
          console.log('Replay saved', res);
        },
        error: (error) => {
            console.log('Error saving replay', error);
        },
    });
}

  async changeTimeSlider() {
    //clear interval
    clearInterval(this.gamePageElem.timer.interval);
    clearInterval(this.clickHistoryService.interval);

    console.log("timeFraction: " + this.clickHistoryService.timeFraction);
    //mettre le temps du chrono a jour
    this.gamePageElem.timer.minutes = Math.floor((this.gamePageElem.tempsDebut-60)/60) - Math.floor(this.clickHistoryService.timeFraction / 600);
    this.gamePageElem.timer.seconds = this.gamePageElem.tempsDebut%60 - Math.floor(this.clickHistoryService.timeFraction / 10);
    this.gamePageElem.timer.convertTimeToString();
    //Calcule on est rendu a quel event
    this.indexEvent = this.clickHistoryService.clickHistory.findIndex((event) => event.time >= this.clickHistoryService.timeFraction);
    //Est ce qu'on a reculer ou avancer ou on est rendu a la fin
    if (this.indexEvent < this.lastIndex) {
      console.log("back")
      //Timeout pour synchronisé le reset et le play
      await this.resetGame().then(() => {
        setTimeout(() => {
          for (let i = 0; i < this.indexEvent; i++) {
            console.log("i: " + i);
            this.clickHistoryService.clickHistory[i].play(this);
          }
        }, 0);

      });
      this.lastIndex = this.indexEvent;
    } else if (this.indexEvent > this.lastIndex) {
      console.log("forward")
      this.currentEvent = this.clickHistoryService.clickHistory[this.indexEvent - 1];
      this.currentEvent.play(this);
      this.lastIndex = this.indexEvent;
    } else if (this.clickHistoryService.timeFraction == this.clickHistoryService.clickHistory[this.indexEvent + 1].time) {
      //Pour play le dernier click et le endgameEvent
      for (let i = 0; i < 2; i++) {
        this.currentEvent = this.clickHistoryService.clickHistory[this.indexEvent];
        console.log(this.currentEvent);
        this.currentEvent.play(this);
        this.indexEvent++;
      }
    }
  }

  unclickProgressBar() {
    this.updateChrono(this.currentState);
  }

  resume() {
    console.log('resume');
    this.gamePageElem.timer.startTimer();
    this.clickHistoryService.startTimer();
  }

  playEvents(time: number) {
    while (this.currentEvent && this.currentEvent.time === time) {
      this.currentEvent.play(this);
      this.changeCurrentEvent();
    }
  }

  changeCurrentEvent() {
    this.currentEvent = this.clickHistoryService.clickHistory[this.indexEvent];
    this.indexEvent++;
    this.lastIndex = this.indexEvent;
  }

  async updateChrono(tool: videoTool) {
    switch (tool) {
      case videoTool.play:
        clearInterval(this.gamePageElem.timer.interval);
        this.currentState = videoTool.play;
        constsTimer.INTERVAL_TIMEOUT = 1000;
        this.resume();
        break;
      case videoTool.pause:
        clearInterval(this.clickHistoryService.interval);
        clearInterval(this.gamePageElem.timer.interval);
        this.currentState = videoTool.pause;

        break;
      case videoTool.restart:
        this.clickHistoryService.stopTimer();
        this.restartControlBehaviour()
        this.resume();

        break;
      case videoTool.forwardTwo:
        clearInterval(this.gamePageElem.timer.interval);
        clearInterval(this.clickHistoryService.interval);
        this.currentState = videoTool.forwardTwo;
        this.gamePageElem.timer.startTimer(500);
        this.clickHistoryService.startTimer(50);

        break;
      case videoTool.forwardFour:
        clearInterval(this.gamePageElem.timer.interval);
        clearInterval(this.clickHistoryService.interval);
        this.currentState = videoTool.forwardFour;
        this.gamePageElem.timer.startTimer(250);
        this.clickHistoryService.startTimer(25);

        break;
    }
  }

  async restartControlBehaviour() {
    this.gamePageElem.timer.stop();
    this.gamePageElem.timer.seconds = this.gamePageElem.tempsDebut%60;
    this.gamePageElem.timer.minutes = Math.floor(this.gamePageElem.tempsDebut/60);
    this.gamePageElem.timer.convertTimeToString();
    await this.resetGame();
    this.indexEvent = 0;
    this.changeCurrentEvent();
  }

  async resetGame() {
    console.log('resetGame');
    this.gamePageElem.blinker.clearAllBlink.next(true);
    // if (this.gamePageElem === this.gamePage) {
    //   this.gamePageElem.clues.nClues = constsClue.N_CLUES;
    // }
    //this.gamePageElem.sidebar.messenger.messages = [];
    this.gamePageElem.counter.reset();
    this.gamePageElem.initialiseGame();
    this.loadImage1();
    this.loadImage2();
    console.log('image loaded');
  }

  async loadImage1(): Promise<void> {
    return new Promise((resolve) => {
      const image1 = new Image();
      image1.src = this.gamePageElem.img1src;
      image1.onload = () => {
        createImageBitmap(image1).then((btmp) => {
          this.gamePageElem.img1 = btmp;
          resolve();
        });
      };
    });
  }
  async loadImage2(): Promise<void> {
    return new Promise((resolve) => {
      const image2 = new Image();
      image2.src = this.gamePageElem.img2src;
      image2.onload = () => {
        createImageBitmap(image2).then((btmp) => {
          this.gamePageElem.img2 = btmp;
          resolve();
        });
      };
    });
  }

  openDialogEndReplay() {
    PopupTextComponent.openDialog(
      this.dialogRef,
      {
        message: "<h2>Fin de la partie!</h2> Voulez-vous rejouer la partie?",
        btnText: 'Quitter',
        btnText2: 'Rejouer',
        preventClose: true,
      } as DialogData,
      this.endGameCallback,
    );
  }

  endGameCallback = (feedback: DialogFeedback) => {
    this.dialogRef.closeAll();
    const btn = feedback.event.target as HTMLButtonElement;

    if (btn.innerHTML === 'Rejouer') {
      this.controlBar.emitRestart();
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.indexEvent = 0;
    this.currentEvent = {} as EventDescription;
    this.clickHistoryService.incremented.unsubscribe();
    this.clickHistoryService.reinit();
  }
}