import { Injectable, OnDestroy } from '@angular/core';
import { consts } from '@common/consts';
import { GameEnded, GameMode, NewTime } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from './communication.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class GameHistoryService implements OnDestroy {
  destroy$ = new Subject<any>();

  constructor(private readonly communicationService: CommunicationService, private readonly socketService: SocketService) {}

  uploadHistory = (gameMode: GameMode, initialTime: Date, duration: number, player1: string, player2: string, quit: boolean, quitCoop: boolean = false): Promise<void> => {
    const game: GameEnded = {
      gameMode: gameMode,
      startDate: initialTime,
      duration: duration,
      player1: player1,
      player2: player2,
      quit: quit,
      quitCoop: quitCoop,
    }
    return new Promise<void>((resolve, reject) => {
      const res = this.communicationService.addGameToHistory(game);
      res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.status === consts.HTTP_STATUS_CREATED) {
          resolve();
        } else {
          alert(response.status);
          reject(new Error('Error while uploading to history'));
        }
      });
    });
  }

  uploadNewTime = (gameMode: GameMode, duration: number, player: string, gameCardId: string): Promise<void> => {
    const game: NewTime = { duration, gameMode, player, gameCardId };

    return new Promise<void>((resolve, reject) => {
      const res = this.communicationService.setNewTime(game);
      res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.status === consts.HTTP_STATUS_CREATED) {
          this.socketService.emit('bestTimesUpdate', {});
          resolve();
        } else if (response.status !== consts.HTTP_STATUS_OK) {
          alert(response.status);
          reject(new Error('Error while setting new time'));
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }
}
