import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { GameInfoService } from '@app/services/game-info.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-waiting-page',
  templateUrl: './waiting-page.component.html',
  styleUrls: ['./waiting-page.component.scss']
})
export class WaitingPageComponent implements OnInit, OnDestroy {

  gameName: string | undefined;
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
  gameClosed: boolean;
  destroy$: Subject<any>;
  isChatVisible: boolean = false;

  constructor(
    private gameInfo: GameInfoService,
    private socketService: SocketService,
    private router: Router,
    private dialogRef: MatDialog,
    protected ls: LanguageService,
  ) {}

  ngOnInit(): void {
    this.player1Name = this.gameInfo.username;
    this.player2Name = '';
    this.player3Name = '';
    this.player4Name = '';
    this.gameName = this.gameInfo.gameName;
    this.gameClosed = false;
    this.destroy$ = new Subject<any>();
    this.configSockets();
  }

  ngOnDestroy(): void {
    if (!this.gameClosed) {
      this.socketService.emit('leaveGame', null);
    };
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }

  configSockets(): void {
    this.socketService.listen('newPlayer').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (this.player2Name === '') {
          this.player2Name = data.username;
        } else if (this.player3Name === '') {
          this.player3Name = data.username;
        } else if (this.player4Name === '') {
          this.player4Name = data.username;
        }
      },
    });
    this.socketService.listen('players').subscribe((data: any) => {
      console.log(data);
  
      if(data.length ==1){
          this.player1Name = data[0].name;
          this.player2Name = '';
          this.player3Name = '';
          this.player4Name = '';
        }


        if(data.length ==2){
          this.player1Name = data[0].name;
          this.player2Name = data[1].name;

          this.player3Name = '';
          this.player4Name = '';
        }
        if(data.length ==3){
          this.player1Name = data[0].name;
          this.player2Name = data[1].name;
          this.player3Name = data[2].name;
       
          this.player4Name = '';
        }
        if(data.length ==4){
          this.player1Name = data[0].name;
          this.player2Name = data[1].name;
          this.player3Name = data[2].name;
          this.player4Name = data[3].name;
        }
  
    });

    this.socketService.listen('playerLeft').pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (this.player2Name !== '') {
          this.player2Name = '';
        } else if (this.player3Name !== '') {
          this.player3Name = '';
        } else if (this.player4Name !== '') {
          this.player4Name = '';
        }
      }
    });

    this.socketService.listen('abortGame').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (data.message) {
          this.gameClosed = true;
          this.openDialogNotify(data.message);
          this.socketService.emit('leaveGame', null);
          this.router.navigate(['/selecto']);
        }
      }
    });
  }

  startGame(): void {
    if (this.player2Name && this.player1Name) {
      this.socketService.emit('startGameMulti', { gameName: this.gameName });

      this.gameInfo.username2 = this.player2Name;

      this.gameClosed = true;
      this.router.navigate(['/game1v1']);
    }
  }

  leaveLobbyCreator(){
    this.socketService.emit('leaveLobbyCreator', this.gameName);
    }

  rejectPlayer() {
    this.socketService.emit('rejectPlayer', null);
    this.player2Name = '';
  }

  setName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.gameName = target.value;
  }

  openDialogNotify(message: string) {
    PopupTextComponent.openDialog(this.dialogRef, {
      message,
    } as DialogData);
  }

  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
  } 
}
