
//import { randomUUID } from 'crypto';
import { Difference } from "../client/src/app/interfaces/difference";
import { GameCardTemplate } from "./game-card-template";
import { Player } from "./player";

export enum Status {
    WAITING_PLAYER,
    FULL,
    ACTIVE,
    ENDED,
    VALIDE  // 2 ou 3 joueurs
}

export enum GameAccessType {
    ALL,
    FRIENDS_ONLY,
    FRIENDS_AND_THEIR_FRIENDS_ONLY,
}

export class Game {
    gameId: string; // = socket room id
    gameName: string;
    status: Status;
    gameCard: GameCardTemplate | undefined;
    counter1: number;
    counter2: number;
    counter3: number;
    counter4: number;
    gameAccessType: GameAccessType;
    private players: Player[];
    actifPlayers: number[];
    diffFound:Difference[] = [];

    initialTime: number=120;
    penaltyTime: number=0;
    timeWon: number=0;
    cheatMode: boolean=false;
    maxTime: number=120;
    numberOfObservers: number = 0;
    colors: string[] = ["blue", "red", "green", "yellow"];
    colorIndex: number = 0;
    constructor(gameAccessType: GameAccessType) {
        console.log("gameAcessType", gameAccessType);
        //this.gameId = randomUUID();
        this.gameId = (Math.random()*1000000).toString();
        this.gameAccessType = gameAccessType;
        this.status = Status.WAITING_PLAYER;
        this.counter1 = 0;
        this.counter2 = 0;
        this.counter3 = 0;
        this.counter4 = 0;
        this.players = [];
        this.actifPlayers = [];
    }

    getPlayers() {
        return this.players;
    }

    addPlayer(player: Player, multi: boolean = false) {
        if (multi) {
            if (this.players.length < 4) {
                this.players.push(player);
               
            } else {
                throw new Error(`Game is full, cannot add ${player.name} to game ${this.gameId}`);
            }

        } else {
            if (this.players.length < 2) {
                this.players.push(player);
            } else {
                throw new Error(`Game is full, cannot add ${player.name} to game ${this.gameId}`);
            }
        }
    }
    getCounters() {
        return [this.counter1, this.counter2, this.counter3, this.counter4];
    }
    leaveLobby(player: Player) {
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
        this.actifPlayers.splice(index, 1);
        this.setActifPlayers();
    }

    setConstants(initialTime: number, penaltyTime: number, timeWon: number, cheatMode: boolean, maxTime: number) {
        this.initialTime = initialTime;
        this.penaltyTime = penaltyTime;
        this.timeWon = timeWon;
        this.cheatMode = cheatMode;
        this.maxTime = maxTime;
    }

    setClassiConstants(initialTime: number,cheatMode: boolean) {
        this.initialTime = initialTime;
        this.cheatMode = cheatMode;
    }


    getPlayer(index: number) {
        return this.players[index];
    }

    popPlayer() {
        return this.players.pop();
    }
    addObserver() {
        this.numberOfObservers++;
    }
    removeObserver() {
        this.numberOfObservers--;
    }
    getColor() {
        if (this.colorIndex >= this.colors.length) {
            this.colorIndex = 0;
        }
        return this.colors[this.colorIndex++];
    }
    getNumberOfObservers() {
        return this.numberOfObservers;
    }

    resetCounters() {
        this.counter1 = 0;
        this.counter2 = 0;
    }
    getNumberOfPlayers() {
        return this.players.length;
    }
    setActifPlayers() {
        this.actifPlayers = [];
        for (let i = 0; i < this.players.length; i++) {
            this.actifPlayers.push(1);
        }
    }
    playerLeave(player: Player) {
        const index = this.players.indexOf(player);
        this.actifPlayers[index] = 0;
       
    }
    addFounDifference(diff: Difference) {
        this.diffFound.push(diff);
    }

    updateStatus() {
        if (this.gameCard) {
            const threshold = Math.ceil(this.gameCard.differences.length / 2);

            if (this.counter1 >= threshold) {
                this.status = Status.ENDED;

                return { status: this.status, winner: this.getPlayer(0).name }


            } else if (this.counter2 >= threshold) {
                this.status = Status.ENDED;

                return { status: this.status, winner: this.getPlayer(1).name }

            }
        }

        return { status: Status.ACTIVE, winner: "" };
    }
  
}