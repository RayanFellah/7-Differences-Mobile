import { Game, GameAccessType, Status } from '@common/game';
import { Game1v1 } from '@common/game-1v1';
import { GameCoop } from '@common/game-coop';
import { GameSolo } from '@common/game-solo';
import { GameLimite } from '@common/gameLimite';
import { GameMulti } from '@common/gameMulti';
import { Player } from '@common/player';
import { Service } from 'typedi';
import { FileSystemService } from './file-system.service';
import { LiveGamesService } from './liveGames.service';

@Service()
export class GamesManagerService {

    private gamesSolo: Game[];
    private games1v1: Game[];
    private gamesCoop: Game[];
    private gamesMulti: Game[];
    private gamesLimite: GameLimite[];

    constructor(private liveGamesService: LiveGamesService, private fileSystemService: FileSystemService) {
        this.gamesSolo = [];
        this.games1v1 = [];
        this.gamesCoop = [];
        this.gamesMulti = [];
        this.gamesLimite = [];
    }

    getLiveGamesService() {
        return this.liveGamesService;
    }

    async createNewGame(player: Player, game: Game, gameCardId?: string, multi: boolean = false): Promise<Game> {

        if (multi) {
            game.addPlayer(player, true);
        } else {

            game.addPlayer(player);
        }
        if (gameCardId) game.gameCard = await this.fileSystemService.getGameCardById(gameCardId);
        game.status = Status.WAITING_PLAYER;
        return game;
    }

    async joinGameSolo(gameCardId: string, player: Player): Promise<string> {
        const game = await this.createNewGame(player, new GameSolo(GameAccessType.ALL), gameCardId);
        game.status = Status.ACTIVE;
        this.gamesSolo.push(game);
        return game.gameId;
    }

    async joinGameClassic1v1(gameCardId: string, player: Player): Promise<object> {
        let game = this.getWaitingByGameCardId(gameCardId);
        if (game) {
            game.addPlayer(player);
            game.status = Status.FULL;

        } else {
            game = await this.createNewGame(player, new Game1v1(GameAccessType.ALL), gameCardId);
            this.games1v1.push(game);
        }
        return { id: game.gameId, status: game.status };
    }

    async joinGameMulti(gameCardId: string, player: Player): Promise<object> {
        let game = this.getWaitingMulti(gameCardId);

        if (game) { // if there is a game waiting for a player
            game.addPlayer(player, true);

            if (game.getNumberOfPlayers() === 4) {
                game.status = Status.FULL;

            } else if (game.getNumberOfPlayers() > 1) {    // if there are at least 2 players , doit tjrs etre true normalement
                game.status = Status.VALIDE;
            }
            return { id: game.gameId, status: game.status };

        } else {
            let validGame = this.getValidMulti(gameCardId);
            if (validGame) {
                validGame.addPlayer(player, true);

                if (validGame.getNumberOfPlayers() === 4) {
                    validGame.status = Status.FULL;

                }
                return { id: validGame.gameId, status: validGame.status };
            } else {// if there is no game waiting for a player
                game = await this.createNewGame(player, new GameMulti(GameAccessType.ALL), gameCardId, true);
                this.gamesMulti.push(game);
            }
        }
        return { id: game.gameId, status: game.status };
    }
    async createGameMulti(gameCardId: string, player: Player, gameAccessType: GameAccessType): Promise<Game> {
        let game = await this.createNewGame(player, new GameMulti(gameAccessType), gameCardId, true);
        this.gamesMulti.push(game);
        console.log("game created");
        console.log(this.gamesMulti);


        return game;
    }
    async createGameLimite(player: Player, gameAccessType: GameAccessType): Promise<Game> {
        let game = new GameLimite(gameAccessType);
        game.addPlayer(player, true)
        game.status = Status.WAITING_PLAYER;
        this.gamesLimite.push(game);
        const gameCards = await this.fileSystemService.getGameCards();
        for (let i = 0; i < gameCards.length; i++) {
            game.addCardToQueue(gameCards[i]);
        }
        game.queue = game.shuffle(game.queue);


        console.log("game created");
        console.log(this.gamesLimite);
        return game;
    }
    async joinGameLimiteById(player: Player, lobbyId: number): Promise<any> {
        console.log("join game by id Limite");
        let games: any = this.getAllJoinableLimite();
        console.log('JoinablegamesLimite', games);
        if (games) {
            for (let game of games) {
                console.log(game.gameId);
                if (game.gameId === lobbyId) {
                    game.addPlayer(player, true);
                    if (game.getNumberOfPlayers() === 4) {
                        game.status = Status.FULL;

                    } else if (game.getNumberOfPlayers() > 1) {    // if there are at least 2 players , doit tjrs etre true normalement
                        game.status = Status.VALIDE;
                    }
                    console.log(game);
                    return game;

                }
            }
        }
        return null;

    }





    async joinGameMultiById(gameCardId: string, player: Player, lobbyId: number): Promise<any> {
        console.log("join game by id");
        let games: any = this.getAllJoinableMulti(gameCardId);

        console.log('Joinablegames', games);
        if (games) {
            for (let game of games) {
                console.log(game.gameId);
                if (game.gameId === lobbyId) {
                    game.addPlayer(player, true);
                    if (game.getNumberOfPlayers() === 4) {
                        game.status = Status.FULL;

                    } else if (game.getNumberOfPlayers() > 1) {    // if there are at least 2 players , doit tjrs etre true normalement
                        game.status = Status.VALIDE;
                    }
                    console.log(game);
                    return game;

                }
            }

        }
        return null;
    }
    getAllJoinableMulti(gameCardId: string): Game[] {
        console.log("get all joinable");
        let waiting = this.getAllWaitingMulti(gameCardId);
        let valid = this.getAllValidMulti(gameCardId);
        console.log(waiting);
        console.log(valid);
        console.log([...waiting, ...valid]);
        return [...waiting, ...valid];

    }
    getAllJoinableLimite(): Game[] {
        let waiting = this.gamesLimite.filter((game) => game.status === Status.WAITING_PLAYER);
        let valid = this.gamesLimite.filter((game) => game.status === Status.VALIDE);
        console.log(waiting);
        console.log(valid);
        console.log([...waiting, ...valid]);
        return [...waiting, ...valid];
    }
    getLimiteById(gameId: string): GameLimite | undefined {
        return this.gamesLimite.find((game: Game) => game.gameId === gameId);
    }

    getAllGames(): Game[] {
        return [...this.gamesSolo, ...this.games1v1, ...this.gamesCoop, ...this.gamesMulti, ...this.gamesLimite];
    }
    getWaitingMulti(gameCardId: string): Game | undefined {
        console.log("get waiting");
        console.log(this.gamesMulti);
        const game = this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.WAITING_PLAYER);
        console.log(game);
        return game ? game[0] : undefined;

    }
    getAllWaitingMulti(gameCardId: string): Game[] {
        console.log("get all waiting");
        console.log(this.gamesMulti);
        console.log(this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.WAITING_PLAYER));
        return this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.WAITING_PLAYER);
    }
    getValidMulti(gameCardId: string): Game | undefined {
        console.log("get valid");
        console.log(this.gamesMulti);
        const game = this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.VALIDE);
        console.log(game);
        return game ? game[0] : undefined;
    }
    getAllValidMulti(gameCardId: string): Game[] {
        console.log("get all valid");
        console.log(this.gamesMulti);
        console.log(this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.VALIDE));
        return this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.VALIDE);

    }




    async deleteGameMultiById(gameId: string) {
        this.gamesMulti = this.gamesMulti.filter((e) => { e.gameId != gameId });
    }



    async joinGameCoop(player: Player): Promise<object> {
        let game = this.getWaitingCoop();
        if (game) {
            game.addPlayer(player);
            game.status = Status.ACTIVE;
        } else {
            game = await this.createNewGame(player, new GameCoop(GameAccessType.ALL));
            this.gamesCoop.push(game);
        }
        return { id: game.gameId, status: game.status };
    }

    deleteGameById(gameId: string) {
        this.gamesSolo = this.gamesSolo.filter((e) => { e.gameId != gameId });
        this.games1v1 = this.games1v1.filter((e) => { e.gameId != gameId });
        this.gamesCoop = this.gamesCoop.filter((e) => { e.gameId != gameId });
    }

    endGame(gameId: string) {
        let game = this.getGameById(gameId);
        if (game) {
            game.status = Status.ENDED;
            this.liveGamesService.removeGame(gameId);
            game.resetCounters();
        }
    }

    getSoloById(gameId: string): Game | undefined {
        return this.gamesSolo.find((game: Game) => game.gameId === gameId);
    }

    get1v1ById(gameId: string): Game | undefined {
        return this.games1v1.find((game: Game) => game.gameId === gameId);
    }

    getCoopById(gameId: string): Game | undefined {
        return this.gamesCoop.find((game: Game) => game.gameId === gameId);
    }
    getMultiById(gameId: string): Game | undefined {
        return this.gamesMulti.find((game: Game) => game.gameId === gameId);
    }

    getGameById(gameId: string): Game | undefined {
        let game = this.get1v1ById(gameId);
        if (!game) game = this.getCoopById(gameId);
        if (!game) game = this.getSoloById(gameId);
        if (!game) game = this.getMultiById(gameId);
        if (!game) game = this.getLimiteById(gameId);

        return game;
    }
    getAllGamesLimites(): GameLimite[] {
        return this.gamesLimite;
    }
    getAllGamesMulti(): GameMulti[] {
        return this.gamesMulti;
    }



    getWaitingCoop(): Game | undefined {
        return this.gamesCoop.find((game) => game.status === Status.WAITING_PLAYER);
    }

    getGamesByGameCardId(gameCardId: string): Game[] {
        return this.games1v1.filter((game: Game) => game.gameCard && game.gameCard.id === gameCardId);
    }

    getAllWaitingByGameCardId(gameCardId: string): Game[] {
        return this.games1v1.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.WAITING_PLAYER);
    }

    getAllFullByGameCardId(gameCardId: string): Game[] {
        return this.games1v1.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.FULL);
    }
    getAllFullByGameCardIdMulti(gameCardId: string): Game[] {
        return this.gamesMulti.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.FULL);
    }

    getWaitingByGameCardId(gameCardId: string): Game | undefined {
        const game = this.getAllWaitingByGameCardId(gameCardId);
        return game ? game[0] : undefined;
    }

    getFullByGameCardId(gameCardId: string): Game | undefined {
        const game = this.getAllFullByGameCardId(gameCardId);
        return game ? game[0] : undefined;
    }
    getFullByGameCardIdMulti(gameCardId: string): Game | undefined {
        const game = this.getAllFullByGameCardIdMulti(gameCardId);
        return game ? game[0] : undefined;
    }

    getWaitingById(gameId: string): Game | undefined {
        const game = this.getGameById(gameId);
        return game && game.status === Status.WAITING_PLAYER ? game : undefined;
    }

    getFullById(gameId: string): Game | undefined {
        const game = this.get1v1ById(gameId);
        return game && game.status === Status.FULL ? game : undefined;
    }

    getStartedById(gameId: string): Game | undefined {
        const game = this.get1v1ById(gameId);
        return game && game.status === Status.ACTIVE ? game : undefined;
    }

    isWaitingGameCard(gameCardId: string): boolean {
        const game = this.getWaitingByGameCardId(gameCardId);
        return game !== undefined;
    }

    isFullGameCard(gameCardId: string): boolean {
        const game = this.getFullByGameCardId(gameCardId);
        return game !== undefined;
    }
    isFullGameMulti(gameCardId: string): boolean {
        const game = this.getFullByGameCardIdMulti(gameCardId);
        return game !== undefined;
    }

    isWaitingGame(gameId: string): boolean {
        const game = this.getWaitingById(gameId);
        return game !== undefined;
    }

    isCreator(gameId: string, playerId: string): boolean {
        const game = this.getGameById(gameId);
        return game !== undefined && game.getPlayers()[0].id === playerId;
    }

    leaveGame(gameId: string, playerId: string) {

        const game = this.getGameById(gameId);
        if (game) {
            if (this.isCreator(gameId, playerId)) {
                this.endGame(gameId);
            } else {
                this.rejectPlayer(gameId);
            }
        }
    }

    rejectPlayer(gameId: string) {
        const game = this.getFullById(gameId);
        if (game) {
            game.popPlayer();
            game.status = Status.WAITING_PLAYER;
        }
    }

    startGame(gameId: string) {

        const game = this.getGameById(gameId);

        if (game) {
            game.status = Status.ACTIVE;
            this.liveGamesService.add(game);

        }
    }
    startMultiGame(gameId: string) {

        const game = this.getMultiById(gameId);

        if (game) {
            game.setActifPlayers();
            game.status = Status.ACTIVE;
            this.liveGamesService.add(game);

        }
    }
    leaveGameMulti(gameId: string, player: Player) {
            
            const game = this.getMultiById(gameId);
            if (game) {
                game.playerLeave(player);
              
            }
    }
    leaveGameLimite(gameId: string, player: Player) {
            
        const game = this.getLimiteById(gameId);
        if (game) {
            game.playerLeave(player);
          
        }
}




    startLimiteGame(gameId: string) {

        const game = this.getLimiteById(gameId);

        if (game) {
            game.setActifPlayers();
            game.status = Status.ACTIVE;
            this.liveGamesService.add(game);

        }
    }
    clearEndedGames() {
        this.gamesSolo = this.gamesSolo.filter((game) => game.status !== Status.ENDED);
        this.games1v1 = this.games1v1.filter((game) => game.status !== Status.ENDED);
        this.gamesCoop = this.gamesCoop.filter((game) => game.status !== Status.ENDED);
        this.gamesMulti = this.gamesMulti.filter((game) => game.status !== Status.ENDED);
        this.gamesLimite = this.gamesLimite.filter((game) => game.status !== Status.ENDED);
    }  
}