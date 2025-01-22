
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClickEventDescription } from '@app/classes/click-event-description';
import { CounterEventDescription } from '@app/classes/counter-event-description';
import { EndGameEventDescription } from '@app/classes/end-game-event-description';
import { ObserverEventDescription } from '@app/classes/observer-event-description';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { ClickHistoryService } from '@app/services/click-history.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { LanguageService } from '@app/services/language.service';
import { GameCardTemplate } from '@common/game-card-template';
import { Replay } from '@common/replay';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-replay-history',
  templateUrl: './replay-history.component.html',
  styleUrls: ['./replay-history.component.scss']
})
export class ReplayHistoryComponent implements OnInit {


  replayHistory = new MatTableDataSource<Replay>([]);

  displayedColumns: string[] = ['dateHeure', 'GameCard', 'replay', 'effacer'];

  destroy$ = new Subject<any>();
  constructor(private userService: AccountSettingsService, 
              protected languageService: LanguageService, 
              private router: Router, 
              private imageTransferService: ImageTransferService, 
              private communicationService: CommunicationService,
              private clickHistoryService: ClickHistoryService,
              private gameInfoService: GameInfoService) {}


  ngOnInit(): void {
    this.loadUserReplayHistory();
  }

  loadUserReplayHistory() {
    this.userService.getUserReplayHistory().subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.replayHistory.data = res.replays;
        console.log('User replay history:', this.replayHistory);
      },
      error: (error) => {
        console.error('Error fetching user replay history:', error);
      }
    });
  }

  playReplay(replay: Replay) {
    for(let i = 0; i < replay.eventHistory.length; i++) {
      if(replay.eventHistory[i].x !== undefined && replay.eventHistory[i].y !== undefined) {
        const eventClick = new ClickEventDescription(replay.eventHistory[i].time, replay.eventHistory[i].x as number, replay.eventHistory[i].y as number);
        this.clickHistoryService.clickHistory.push(eventClick);
      }else if(replay.eventHistory[i].userCounter !== undefined) {
        const eventCounter = new CounterEventDescription(replay.eventHistory[i].time, replay.eventHistory[i].userCounter as number[]);
        this.clickHistoryService.clickHistory.push(eventCounter);
      }else if (replay.eventHistory[i].color !== undefined && replay.eventHistory[i].rectangle !== undefined) {
        const eventObserver = new ObserverEventDescription(replay.eventHistory[i].time, replay.eventHistory[i].rectangle as {startX:number, startY:number, width:number, height:number}, replay.eventHistory[i].color as string);
        this.clickHistoryService.clickHistory.push(eventObserver);
      }else{
        const eventEndGame = new EndGameEventDescription(replay.eventHistory[i].time);
        this.clickHistoryService.clickHistory.push(eventEndGame);
      }
    }
    this.gameInfoService.playerNames.next(replay.userNames);
    this.communicationService.downloadGameCard(replay.gameCardId).subscribe({
      next: (res: any) => {
        const gameCard = res.body as GameCardTemplate;
        const response1 = this.communicationService.downloadImage(gameCard.img1ID);
        response1.pipe(takeUntil(this.destroy$)).subscribe((res) => {
          if (res.body) {
            console.log(res.body, 'test pour flutter');
            this.imageTransferService.link1 = `url(data:image/bmp;base64,${res.body})`;
            this.imageTransferService.img1 = `data:image/bmp;base64,${res.body}`;

            const response2 = this.communicationService.downloadImage(gameCard.img2ID);
          response2.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res.body) {
              this.imageTransferService.link2 = `url(data:image/bmp;base64,${res.body})`;
              this.imageTransferService.img2 = `data:image/bmp;base64,${res.body}`;

              this.imageTransferService.diff = gameCard.differences;
        
              this.router.navigate(['/replay']);
            }else{
              console.error('Error fetching game card image 2:', res);
            }
          });
          } else {
            console.error('Error fetching game card image 1:', res);
          }
          
        });
      },
      error: (error) => {
        console.error('Error fetching game card:', error);
      }
    });
  }

  effacerReplay(replay: Replay) {
    this.userService.deleteReplay(replay.dateHeure.toString()).subscribe({
      next: (res) => {
        console.log('Replay deleted', res);
        this.loadUserReplayHistory();
      },
      error: (error) => {
        console.error('Error deleting replay:', error);
      }
    });
  }

}
