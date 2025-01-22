import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent, StageLvl } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { AuthentificationService } from '@app/services/authentification.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameConstantsService } from '@app/services/game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';
import { UserAllowedInGameService } from '@app/services/user-allowed-in-game.service';
import { Game, GameAccessType, Status } from '@common/game';
import { GameCardTemplate } from '@common/game-card-template';
import { Constants } from '@common/game-classes';
@Component({
    selector: 'app-limited-selecto',
    templateUrl: './limited-selecto.component.html',
    styleUrls: ['./limited-selecto.component.scss']
})
export class LimitedSelectoComponent {
    cardOrder: number[] = [];
    nGameCards: number;
    gameCards: GameCardTemplate[];
    constants: any;
    username: string;
    lobbies: Game[] = [];
    games: Game[] = [];
    isChatVisible: boolean = false;
    _gameAccessType = GameAccessType;

    constructor(
        private readonly dialogRef: MatDialog,
        private readonly router: Router,
        private gameInfo: GameInfoService,
        private socketService: SocketService,
        private readonly communication: CommunicationService,
        private gameConstants: GameConstantsService,
        private authentificationService: AuthentificationService,
        private userAllowedInGameService: UserAllowedInGameService,
        protected ls: LanguageService,
    ) {
        this.configSockets()

        this.socketService.listen("orderSent").subscribe((res: any) => {
            if (res) {
                this.cardOrder = res.order;
            }
        });
        this.communication.downloadGameCards().subscribe((res: any) => {
            this.gameCards = res.body as GameCardTemplate[];
            this.nGameCards = this.gameCards.length;
        });
        this.socketService.listen('updateLobbiesLimite').subscribe({
            next: async (data: any) => {
                if (data) {
                    const filteredData = data
                    let filterstatus = filteredData.filter((game: { status: Status }) => game.status === 0 || game.status === 4);
                    const results = await Promise.all(
                        filterstatus.map(async (game: Game) => this.userAllowedInGameService.isUserAllowedInGame(game)),
                    );
                    filterstatus = filterstatus.filter((game: Game, index: number) => results[index]);

                    const actifGames = filteredData.filter((game: { status:Status }) => game.status===2);
                    console.log('updateLobbies');
                    console.log(filteredData);
                    this.lobbies = filterstatus;
                    this.games = actifGames;


                }
            },
        });
        this.authentificationService.user$.subscribe((user) => {
            if (user) {
                this.username = user.username;
            }
        }
        );
        this.socketService.listen('startGameLimite').subscribe((data) => {
            this.dialogRef.closeAll();
            this.router.navigateByUrl('/limited-time');

        });
        this.socketService.emit('getLobbiesLimite', null);

        this.socketService.listen('launchLobby').subscribe((data: any) => {
            const constants = data as Constants;
            console.log('launchLobbylistend', constants);
            this.applyConstantsToGameInfo(constants);
            //this.createLobby();
        });

    }

    applyConstantsToGameInfo(constants: Constants) {
        this.gameInfo.initialTime = constants.initialTime;
        this.gameInfo.penalty = constants.penalty;
        this.gameInfo.timeWon = constants.timeWon;
        this.gameInfo.cheatMode = constants.cheatMode;
        console.log('applyConstantsToGameInfo', this.gameInfo);
        this.createLobby();

    }



    createLobby = () => {
        console.log('---');
        console.log(this.username);
        this.socketService.emit('createGameLimite', { username: this.username, gameAccessType: GameAccessType.ALL });
        this.gameInfo.username = this.username;
        this.gameInfo.isObserver = false;
        this.router.navigateByUrl('/waiting-limited');
        this.socketService.listen('launchLobby').subscribe({
            next: (data: any) => {
                this.createLobby();
            },
        });
    };
    createLobbyFriends = () => {
        console.log('---');
        console.log(this.username);
        this.socketService.emit('createGameLimite', { username: this.username, gameAccessType: GameAccessType.FRIENDS_ONLY });
        this.gameInfo.username = this.username;
        this.gameInfo.isObserver = false;
        this.router.navigateByUrl('/waiting-limited');
        this.socketService.listen('launchLobby').subscribe({
            next: (data: any) => {
                this.createLobby();
            },
        });
    };
    createLobbyFriendsAndTheirFriends = () => {
        console.log('---');
        console.log(this.username);
        this.socketService.emit('createGameLimite', { username: this.username, gameAccessType: GameAccessType.FRIENDS_AND_THEIR_FRIENDS_ONLY });
        this.gameInfo.username = this.username;
        this.gameInfo.isObserver = false;
        this.router.navigateByUrl('/waiting-limited');

        console.log('called from create with', this.gameInfo);

        // this.socketService.listen('launchLobby').subscribe((data: any) => {
        //     const constants = data as Constants; 
        //     console.log('launchLobbylistend', constants);
        //     this.applyConstantsToGameInfo(constants);
        //     this.createLobby();
        // });


    };
    
    joinLobby = () => {
        //TODO
        /*
        this.socketService.emit('joinGameLimiteById', this.gameInfo.username);
        */

    };
    onLobbySelected(selectedLobby: any) {
        // Handle the selected lobby data here
        console.log('Selected Lobby:', selectedLobby);
        this.joinGameById(selectedLobby);

    }
    onGameSelected(selectedGame: any) {
        // Handle the selected lobby data here
        console.log('Selected Game:', selectedGame);
        this.joinObserverById(selectedGame);
    }
    joinGameById(gameId: string) {

        console.log('Joining lobby with gameId:', gameId);
        this.socketService.emit('joinGameLimiteById', { lobbyId: gameId, username: this.username });
        this.gameInfo.isObserver = false;
        this.gameInfo.isClassic = false;
        this.router.navigateByUrl('/waiting-player');
    }
    joinObserverById(gameId: string) {

        this.socketService.emit('joinObserverLimiteById', { lobbyId: gameId, username: this.username });
        this.gameInfo.isObserver = true;
        this.router.navigateByUrl('/limited-time');

    }


    configSockets() {
        // the second player waits to be accepted and start the game
        this.socketService.listen('startGameCoop').subscribe({
            next: (data: any) => {
                this.dialogRef.closeAll();
                this.gameInfo.CoopUsername = [];

                this.gameInfo.CoopUsername.push(data.username1);
                this.gameInfo.CoopUsername.push(data.username2);
                this.gameInfo.gameCards = this.gameCards;
                this.gameInfo.nGameCards = this.nGameCards;
                this.gameInfo.cardOrder = data.order;
                this.gameInfo.CoopId = data.id;

                this.router.navigateByUrl('/limited-time');
            }
        });
    }

    openDialogEnterUsernameSolo = () => {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Entrez votre nom de joueur',
                btnText: 'Commencer',
                stage: StageLvl.EnterName,
            } as DialogData,
            this.startGameSolo,
        );
    }

    startGameSolo = async (feedback: DialogFeedback) => {
        if (!this.validateName(feedback.name)) {
            this.openDialogWrongSolo();
        } else {
            this.gameInfo.username = feedback.name;
            this.gameInfo.CoopUsername = [];

            this.dialogRef.closeAll();
            this.socketService.emit('startGameSolo', { username: feedback.name });
            if (!this.gameCards) {
                await this.downloadCards();
            }

            if (this.cardOrder.length == 0) {
                await this.getOrder();
            }
            this.constants = await this.gameConstants.getConstants();
            this.gameInfo.initialTime = this.constants.initialTime;
            this.gameInfo.gameCards = this.gameCards;
            this.gameInfo.nGameCards = this.nGameCards;
            this.gameInfo.cardOrder = this.cardOrder;
            this.gameInfo.timeAddedDifference = this.constants.timeWon;

            this.router.navigate(['/limited-time']);
        }
    }

    openDialogEnterUsernameDuo = () => {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Entrez votre nom de joueur',
                btnText: 'Continuer',
                stage: StageLvl.EnterName,
            } as DialogData,
            this.joinGame,
        );
    }

    joinGame = async (feedback: DialogFeedback) => {
        if (!this.validateName(feedback.name)) {
            this.openDialogWrongName();
        } else {
            this.constants = await this.gameConstants.getConstants();
            this.gameInfo.initialTime = this.constants.initialTime;
            this.socketService.emit('joinGameCoop', { username: feedback.name });
            this.gameInfo.username = feedback.name;
            this.gameInfo.timeAddedDifference = this.constants.timeWon;
            this.openDialogLoad();
        }
    }

    validateName(name: string) {
        return name && name.length > 0 && name.length < 10;
    }

    openDialogWrongName() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Nom incorrect',
                btnText: 'Recommencer',
            } as DialogData,
            this.openDialogEnterUsernameDuo,
        );
    }
    openDialogWrongSolo() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Nom incorrect',
                btnText: 'Recommencer',
            } as DialogData,
            this.openDialogEnterUsernameSolo,
        );
    }

    openDialogLoad() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'En attente d\'un autre joueur',
                btnText: 'Annuler',
                stage: StageLvl.Loading,
                preventClose: true,
            } as DialogData,
            this.leaveGame,
        );
    }

    leaveGame = () => {
        this.dialogRef.closeAll();
        this.socketService.emit('leaveGame', null);
    }

    async downloadCards() {
        return new Promise<void>((resolve) => {
            this.communication.downloadGameCards().subscribe((res: any) => {
                this.gameCards = res.body as GameCardTemplate[];
                this.nGameCards = this.gameCards.length;
                resolve();

            });
        });
    }

    async getOrder() {
        return new Promise<void>((resolve) => {
            this.socketService.listen("orderSent").subscribe((res: any) => {
                if (res) {
                    this.cardOrder = res.order;
                    resolve();
                }
            });
        });
    }
    openConfigDialog() {
        this.router.navigate(['/game-constants']);
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }
    friendsGame(gameAccessType: GameAccessType){
        this.gameInfo.gameAccessType = gameAccessType;
        this.openConfigDialog();
    }
};
