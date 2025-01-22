import { Injectable, OnDestroy } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { GameStats } from '@common/gameStats';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ReplayService } from './replay.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentGameService implements OnDestroy {
  playerCounts: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  playerNames: string[] = [];
  diffArray: BehaviorSubject<Difference[] | undefined> = new BehaviorSubject<Difference[] | undefined>([]);
  endGame: BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>([false, false]);
  winner: BehaviorSubject<string> = new BehaviorSubject<string>('');
  leader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject<any>();

  constructor(private socketService: SocketService, private replayService: ReplayService) {
    this.socketService.listen("leader").pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.leader.next(true);
    });
    /*
    this.socketService.listen("diffFound").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        // Assuming res includes the playerIndex indicating which player found the difference
        this.increment(res.playerIndex); // Directly use playerIndex to increment the correct player's score

        if (!res.other) {
          // If the event is for the current player, add a click event to the replay service
          this.replayService.addClickEventReplay({ x: res.coords.x, y: res.coords.y });
        }

        // Add a counter event to the replay service indicating which player's score to increment
        this.replayService.addCounterEventReplay(res.playerIndex); // Assuming this method is updated to take a player index
      }
    });
    */
    this.socketService.listen("diffFound").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        console.log("res currentGameService "+res);
        console.log("diffFound");
        console.log(res);
        console.log(res.counters);
        this.playerCounts.next(res.counters);

        // Add a counter event to the replay service indicating which player's score to increment
        this.replayService.addCounterEventReplay(res.counters); // Assuming this method is updated to take a player index
        
      }
    });

    this.socketService.listen("End").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        console.log("End Game official");
        this.winner.next(res.winner);
        this.endGame.next([true, false]);
      }
    });

    this.socketService.listen("otherPlayerQuit").pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Adjusted to set the winner based on the quitting logic you have
      // This might need more logic to determine which player name to set as the winner when one quits
      this.winner.next(this.playerNames[0]); // Example: Default to the first player as winner, adjust as necessary
      this.endGame.next([true, true]);
    });
  }

  ngOnDestroy() {
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }
  /*
    init(...playerNames: string[]): void {
      this.playerNames = playerNames;
      // Initialize the playerCounts with zeros based on the number of players
      console.log("CurrentGameService init");
      console.log(playerNames.length);
  
      this.playerCounts.next(new Array(playerNames.length).fill(0));
  
  
      console.log(this.playerNames);
      console.log(this.playerCounts.value);
    }
    */

  increment(playerIndex: number) {
    const updatedCounts = [...this.playerCounts.value];
    if (updatedCounts[playerIndex] !== undefined) {
      updatedCounts[playerIndex]++;
      this.playerCounts.next(updatedCounts);
      console.log("increment");
      console.log(this.playerCounts.value);

    }
  }

  resetCounts(): void {
    this.playerCounts.next(new Array(this.playerNames.length).fill(0));
  }

  gameEnded(quit: boolean, gameStats: GameStats): void {
    this.replayService.addEndGameEventReplay();
    console.log("gameEnded", gameStats);
    this.socketService.emit("gameEnded", { quit, gameStats });
  }

  emitMoney(data: any) {
    console.log('emit money');
    this.socketService.emit('endMoney', data);
  }
}
