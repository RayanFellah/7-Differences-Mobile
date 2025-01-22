import { Inject, Injectable } from '@angular/core';
import { GameCardTemplate } from '@common/game-card-template';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';
import { GameAccessType } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class GameInfoService {
    username = '';
    username2 = '';
    username3 = '';
    numberOfPlayers: number = 0;
    gameName: string | undefined = '';
    gameCardId: string | undefined = '';
    difficulty: string | undefined = '';
    nDiff: number | undefined = 0;
    isSolo: boolean | undefined = true;
    isLeader: boolean = false;
    time: number | undefined = 0;
    CoopUsername: string[] = [];
    gameCards: GameCardTemplate[] = [];
    nGameCards: number = 0;
    cardOrder: number[] = [];
    CoopId: string = '';
    gameAccessType: GameAccessType;
    
    timeAddedDifference: number = 0;
    playerNumber: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
    playerNames: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    isObserver: boolean = false;
    observerData:BehaviorSubject<any>=new BehaviorSubject<any>(null); 
    cheatMode: boolean = false;
    currentObserverName: string | null = null; // nom observer 

    initialTime: number = 120;
    penalty: number = 0;
    timeWon: number = 0;

    initialTimeGame: BehaviorSubject<number> = new BehaviorSubject<number>(120);
    penaltyGame: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    timeWonGame: BehaviorSubject<number> = new BehaviorSubject<number>(0);



    cheatModeActivated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isClassic=true;

    maxTime: BehaviorSubject<number> = new BehaviorSubject<number>(120);

    

    constructor(@Inject(SocketService) private socketService: SocketService) {
        console.log("GameInfoService");
        this.socketService.listen("PlayerNumber").subscribe((res: any) => {
            if (res != -1) {
                this.playerNumber.next(res);
            }
        });
        this.socketService.listen("Players").subscribe((res: any) => {
            if (res) {
                this.playerNames.next(res);
            }
        });
        this.socketService.listen('Constants').subscribe((res: any) => {
            if(res){
                console.log("Constants game info", res);
                this.initialTimeGame.next(res.initialTime);
                this.penaltyGame.next(res.penalty);
                this.timeWonGame.next(res.timeWon);
                this.cheatModeActivated.next(res.cheatMode); 
                this.maxTime.next(res.maxTime);
            }


        });
        this.socketService.listen('ClassicConstants').subscribe((res: any) => {
            if(res){
                console.log("Constants game info", res);
                this.initialTimeGame.next(res.initialTime);
                this.penaltyGame.next(res.penalty);
                this.timeWonGame.next(res.timeWon);
                this.cheatModeActivated.next(res.cheatMode); 
            }


        });
        this.socketService.listen('observerJoined').subscribe((res: any) => {
            if (res) {
                this.observerData.next(res);
                this.currentObserverName = res.observerName;
                console.log("observerfromGameInfo", res.observerName);
               
            }
        });
        this.socketService.listen('observerJoinedLimite').subscribe((res: any) => {
            if (res) {
                console.log("observerJoinedLimite", res);
                this.observerData.next(res);
                this.currentObserverName = res.observerName;
               
            }
        });
    
    this.socketService.listen('launchLobby').subscribe((res: any) => {
        console.log("launchLobby", res);
        if (res) {
            this.initialTime = res.initialTime;
            this.penalty = res.penalty;
            this.timeWon = res.timeWon;
            this.cheatMode = res.cheatMode;
        
        }
    });
}
}

