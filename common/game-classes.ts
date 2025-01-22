export enum GameMode {
    CLASSIQUE_SOLO = 'Classique solo',
    CLASSIQUE_1V1 = 'Classique 1v1',
    TEMPS_LIMITE = 'Temps limité',
    TEMPS_LIMITE_COOP = 'Temps limité coop',

}

export class GameEnded {
    startDate: Date;
    duration: number;
    gameMode: GameMode;
    player1: string;
    player2: string = "";
    quit: boolean = false;
    quitCoop: boolean = false;
}

export class NewTime {
    gameMode: GameMode;
    duration: number;
    player: string;
    gameCardId: string;
}

export class Constants {
    initialTime: number;
    penalty: number;
    timeWon: number;
    cheatMode: boolean;
}

export class ClassicConstants {
    initialTime: number;
    cheatMode: boolean;
}