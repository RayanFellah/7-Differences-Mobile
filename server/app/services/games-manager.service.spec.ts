import { Game, Status } from '@common/game';
import { GameCardTemplate } from '@common/game-card-template';
import { GameSolo } from '@common/game-solo';
import { Player } from '@common/player';
import { expect } from 'chai';
import { FileSystemService } from './file-system.service';
import { GamesManagerService } from './games-manager.service';
import { LiveGamesService } from './liveGames.service';
import sinon = require('sinon');

describe('GamesManagerService', () => {
    let service: GamesManagerService;
    let fileSystemService: FileSystemService;
    let liveGamesService: LiveGamesService;
    beforeEach(async () => {
        fileSystemService = new FileSystemService();
        liveGamesService = new LiveGamesService();
        service = new GamesManagerService(liveGamesService, fileSystemService);
    });

    it("should return this.liveGamesService when calling getLiveGamesService()", () => {
        expect(service.getLiveGamesService()).to.equal(service['liveGamesService']);
    });

    it("should create a new game with gameCardId and player when calling createNewGame()", async () => {
        const gameCardId = "1";
        const player = new Player('1', 'name');
        const game1 = new Game();
        game1.addPlayer(player);
        game1.gameCard = await service['fileSystemService'].getGameCardById(gameCardId);
        game1.status = Status.WAITING_PLAYER;

        const game2 = await service.createNewGame(player, new GameSolo(), gameCardId);
        expect(game2.getPlayer).to.equal(game1.getPlayer);
        expect(game2.gameCard).to.equal(game1.gameCard);
    });

    it("should return the right game.gameId when calling joinGameSolo()", async () => {
        const gameCardId = "1";
        const player = new Player(gameCardId, 'name');
        const game1 = await service.createNewGame(player, new GameSolo(), gameCardId);
        const game2Id = await service.joinGameSolo(gameCardId, player);
        const game2 = service.getGameById(game2Id);

        expect(game2?.getPlayers).to.equal(game1.getPlayers);
    });

    it("should add player and make game full when joining existing 1v1 game", async () => {
        const game = new Game();
        sinon.stub(service, 'getWaitingByGameCardId').returns(game);
        const player = new Player('1', 'name');
        service.joinGameClassic1v1('1', player);
        expect(game['players'][0]).to.equal(player);
        expect(game.status).to.equal(Status.FULL);
    });

    it("should delete the game when calling deleteGameById()", async () => {
        const wrongId = "0";
        const player = new Player(wrongId, 'name');
        const game1 = await service.createNewGame(player, new GameSolo(), wrongId);
        service.deleteGameById(game1.gameId);
        expect(service.getGameById(game1.gameId)).to.equal(undefined);
    });

    it("should return the right game when calling getGameById()", async () => {
        const game = new Game();
        sinon.stub(service, 'getGameById').returns(game);
        service.endGame('1');
        expect(game.status).to.equal(Status.ENDED);
        expect(game.counter1).to.equal(0);
    });

    it("should return all waiting game cards by id", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;

        const game = new Game();
        game.gameCard = gameCard;
        service['games1v1'] = [game];

        expect(service.getAllWaitingByGameCardId(id).toString()).to.deep.equal([game].toString());
    });

    it("should return all full game cards by id", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        game.status = Status.FULL;
        service['games1v1'] = [game];

        expect(service.getAllFullByGameCardId(id).toString()).to.deep.equal([game].toString());
    });

    it("should return first waiting game card by id", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;

        service['games1v1'] = [game];

        expect(service.getWaitingByGameCardId(id)?.toString()).to.deep.equal(game.toString());
    });
    it("should return undefined if no waiting game card", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.status = Status.FULL;
        game.gameCard = gameCard;

        service['games1v1'] = [game];

        expect(service.getWaitingByGameCardId(id)).to.deep.equal(undefined);
    });
    it("should return undefined if no full game card", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;

        service['games1v1'] = [game];

        expect(service.getFullByGameCardId(id)).to.deep.equal(undefined);
    });

    it("should return all first full game card by id", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        game.status = Status.FULL;
        service['games1v1'] = [game];

        expect(service.getFullByGameCardId(id)?.toString()).to.deep.equal(game.toString());
    });

    it("should return waiting game by id", async () => {
        const game = new Game();
        service['games1v1'] = [game];

        expect(service.getWaitingById(game.gameId)?.toString()).to.deep.equal(game.toString());
    });
    it("should return full game by id", async () => {
        const game = new Game();
        game.status = Status.FULL;
        service['games1v1'] = [game];

        expect(service.getFullById(game.gameId)?.toString()).to.deep.equal(game.toString());
    });

    it("should return started game by id", async () => {
        const game = new Game();
        game.status = Status.ACTIVE;
        service['games1v1'] = [game];

        expect(service.getStartedById(game.gameId)?.toString()).to.equal(game.toString());
    });

    it("should return true if is a waiting game card", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        service['games1v1'] = [game];

        expect(service.isWaitingGameCard(id)).to.equal(true);
    });
    it("should return false if is not a waiting game card", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        game.status = Status.FULL;
        service['games1v1'] = [game];

        expect(service.isWaitingGameCard(id)).to.equal(false);
    });
    it("should return true if is a full game card", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        game.status = Status.FULL;
        service['games1v1'] = [game];

        expect(service.isFullGameCard(id)).to.equal(true);
    });
    it("should return false if is not a full game card", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        service['games1v1'] = [game];

        expect(service.isFullGameCard(id)).to.equal(false);
    });
    it("should return true if is a waiting game", async () => {
        const game = new Game();
        service['games1v1'] = [game];

        expect(service.isWaitingGame(game.gameId)).to.equal(true);
    });
    it("should return false if is not a waiting game", async () => {
        const game = new Game();
        game.status = Status.FULL;
        service['games1v1'] = [game];

        expect(service.isWaitingGame(game.gameId)).to.equal(false);
    });
    it("should return true if is creator", async () => {
        const game = new Game();
        const player = new Player('1', 'name');
        game.addPlayer(player);
        service['games1v1'] = [game];

        expect(service.isCreator(game.gameId, player.id)).to.equal(true);
    });
    it("should return false if is not creator", async () => {
        const game = new Game();
        const player1 = new Player('1', 'name1');
        const player2 = new Player('2', 'name2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        service['games1v1'] = [game];

        expect(service.isCreator(game.gameId, player2.id)).to.equal(false);
    });
    it("should return false if is undefined", async () => {
        const game = new Game();
        const player = new Player('1', 'name');
        game.addPlayer(player);

        expect(service.isCreator(game.gameId, player.id)).to.equal(false);
    });

    it("should call endGame() if creator leaves game", async () => {
        const game = new Game();
        const player1 = new Player('1', 'name1');
        const player2 = new Player('2', 'name2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        service['games1v1'] = [game];

        service.leaveGame(game.gameId, player1.id);
        expect(game.status).to.equal(Status.ENDED);
        expect(game.counter1).to.equal(0);
    });
    it("should call rejectPlayer() if non creator leaves game", async () => {
        const game = new Game();
        const player1 = new Player('1', 'name1');
        const player2 = new Player('2', 'name2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        game.status = Status.FULL;
        service['games1v1'] = [game];

        service.leaveGame(game.gameId, player2.id);
        expect(game.status).to.equal(Status.WAITING_PLAYER);
    });

    it("should reject player if is full game", async () => {
        const game = new Game();
        game.status = Status.FULL;
        service['games1v1'] = [game];

        service.rejectPlayer(game.gameId);

        expect(game.status).to.equal(Status.WAITING_PLAYER);
    });
    it("should not reject player if is not full game", async () => {
        const game = new Game();
        game.status = Status.ACTIVE;
        service['games1v1'] = [game];

        service.rejectPlayer(game.gameId);

        expect(game.status).to.equal(Status.ACTIVE);
    });
    it("should start game if is existing when calling startGame()", async () => {
        const game = new Game();
        service['gamesSolo'] = [game];

        service.startGame(game.gameId);

        expect(game.status).to.equal(Status.ACTIVE);
    });
    it("should not start game if is not existing when calling startGame()", async () => {
        const game = new Game();

        service.startGame(game.gameId);

        expect(game.status).to.equal(Status.WAITING_PLAYER);
    });
    it("should not start game if is not existing when calling startGame()", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        service['gamesSolo'] = [game];

        expect(service.getGamesByGameCardId(id)?.toString).to.equal([game].toString);
    });

    it("getGamesByGameCardId should return empty list  if gameCardId is not existing", async () => {
        const result = service.getGamesByGameCardId('invalidId');
        expect(result[0]).to.equal(undefined);
    });

    it("getGamesByGameCardID should return the right gameCard", async () => {
        const id = 'test';
        const gameCard = new GameCardTemplate();
        gameCard.id = id;
        const game = new Game();
        game.gameCard = gameCard;
        service['games1v1'] = [game];

        const result = service.getGamesByGameCardId(id);
        expect(result?.toString).to.equal([game].toString);
    });

    it("should create new game if is not existing when calling joinGameClassic1v1()", async () => {
        const mockId = 'test';
        const createNewGameStub = sinon.stub(service, 'createNewGame').returns(Promise.resolve({ gameId: mockId } as Game));
        sinon.stub(service['fileSystemService'], 'getGameCardById').returns(Promise.resolve({ id: mockId } as GameCardTemplate));
        const player = new Player('1', 'name');
        await service.joinGameClassic1v1(mockId, player);
        expect(createNewGameStub.called).to.equal(true);
    });

    it("endGame should not call removeGame if game doest not exist", async () => {
        const removeGameStub = sinon.stub(service['liveGamesService'], 'removeGame');
        const gameId = 'invalidId';
        service.endGame(gameId);
        expect(removeGameStub.called).to.equal(false);
    });

    it("should return undefined if game is not existing when calling getWaitingByGameCardId()", async () => {
        const gameCardId = 'test';
        const game = service.getWaitingByGameCardId(gameCardId);
        expect(game).to.equal(undefined);
    });

    it("should return game if game is existing when calling getWaitingByGameCardId()", async () => {
        const gameCardId = 'test';
        const game = new Game();
        game.gameCard = new GameCardTemplate();
        game.gameCard.id = gameCardId;
        service['games1v1'] = [game];
        const result = service.getWaitingByGameCardId(gameCardId);
        expect(result).to.equal(game);
    });

    it("should return the first game of the list when calling getWaitingByGameCardId", async () => {
        const gameCardId = 'test';
        const game = new Game();
        game.gameCard = new GameCardTemplate();
        game.gameCard.id = gameCardId;
        game.status = Status.WAITING_PLAYER;
        const game2 = new Game();
        game2.gameCard = new GameCardTemplate();
        game2.gameCard.id = gameCardId;
        game.status = Status.WAITING_PLAYER;
        service['games1v1'] = [game, game2];
        const result = service.getWaitingByGameCardId(gameCardId);
        expect(result).to.equal(game);
    });

    it("getWaitingByGameCardId should call getAllWaitingByGameCardId with the gameCardId", async () => {
        const gameCardId = 'test';
        const getAllWaitingByGameCardIdStub = sinon.stub(service, 'getAllWaitingByGameCardId');
        service.getWaitingByGameCardId(gameCardId);
        expect(getAllWaitingByGameCardIdStub.calledWith(gameCardId)).to.equal(true);
    });

    it("should return the first game of the list when calling getFullByGameCardId", async () => {
        const gameCardId = 'test';
        const game = new Game();
        game.gameCard = new GameCardTemplate();
        game.gameCard.id = gameCardId;
        game.status = Status.FULL;
        const game2 = new Game();
        game2.gameCard = new GameCardTemplate();
        game2.gameCard.id = gameCardId;
        game2.status = Status.FULL;
        service['games1v1'] = [game, game2];
        const result = service.getFullByGameCardId(gameCardId);
        expect(result).to.equal(game);
    });

    it("should return undefined if game is not existing when calling getFullByGameCardId()", async () => {
        const gameCardId = 'test';
        const game = service.getFullByGameCardId(gameCardId);
        expect(game).to.equal(undefined);
    });

    it("should return game if game is existing when calling getFullByGameCardId()", async () => {
        const gameCardId = 'test';
        const game = new Game();
        game.gameCard = new GameCardTemplate();
        game.gameCard.id = gameCardId;
        game.status = Status.FULL;
        service['games1v1'] = [game];
        const result = service.getFullByGameCardId(gameCardId);
        expect(result).to.equal(game);
    });

    it("getFullByGameCardID should call getAllFullByGameCardId with the gameCardId", async () => {
        const gameCardId = 'test';
        const getAllFullByGameCardIdStub = sinon.stub(service, 'getAllFullByGameCardId');
        service.getFullByGameCardId(gameCardId);
        expect(getAllFullByGameCardIdStub.calledWith(gameCardId)).to.equal(true);
    });

    it("should return the first game of the list when calling getFullByGameCardId", async () => {
        const gameCardId = 'test';
        const game = new Game();
        game.gameCard = new GameCardTemplate();
        game.gameCard.id = gameCardId;
        game.status = Status.FULL;
        const game2 = new Game();
        game2.gameCard = new GameCardTemplate();
        game2.gameCard.id = gameCardId;
        game2.status = Status.FULL;
        service['games1v1'] = [game, game2];
        const result = service.getFullByGameCardId(gameCardId);
        expect(result).to.equal(game);
    });

    it("should return undefined if game is not existing when calling getStartedById()", async () => {
        const gameId = 'test';
        const game = service.getStartedById(gameId);
        expect(game).to.equal(undefined);
    });

    it("leaveGame should not call endGame if game doest not exist", async () => {
        const endGameStub = sinon.stub(service, 'endGame');
        const gameId = 'invalidId';
        const playerId = 'invalidId';
        service.leaveGame(gameId, playerId);
        expect(endGameStub.called).to.equal(false);
    });

    it("should add player to game if game is existing when calling joinGameCoop()", async () => {
        const game = new Game();
        game.status = Status.WAITING_PLAYER;
        service['gamesCoop'] = [game];
        const player = new Player('1', 'name');
        await service.joinGameCoop(player);
        expect(game['players'].length).to.equal(1);
    });

    it("should call createNewGame if game is not existing when calling joinGameCoop()", async () => {
        const createNewGameStub = sinon.stub(service, 'createNewGame').returns(Promise.resolve({ gameId: 'test' } as Game));
        const player = new Player('1', 'name');
        await service.joinGameCoop(player);
        expect(createNewGameStub.called).to.equal(true);
    });

    it("should call getGameCardById if gameCardId is existing when calling createNewGame()", async () => {
        const getGameCardByIdStub = sinon.stub(service['fileSystemService'], 'getGameCardById').returns(Promise.resolve({ id: 'test' } as GameCardTemplate));
        const player = new Player('1', 'name');
        await service.createNewGame(player, new Game(), 'test');
        expect(getGameCardByIdStub.called).to.equal(true);
    });

    it("should not call getGameCardById if gameCardId is not existing when calling createNewGame()", async () => {
        const getGameCardByIdStub = sinon.stub(service['fileSystemService'], 'getGameCardById').returns(Promise.resolve({ id: 'test' } as GameCardTemplate));
        const player = new Player('1', 'name');
        await service.createNewGame(player, new Game());
        expect(getGameCardByIdStub.called).to.equal(false);
    });

    it("should return all games when calling getAllGames()", async () => {
        const game = new Game();
        service['gamesSolo'] = [game];
        service['games1v1'] = [game];
        service['gamesCoop'] = [game];
        const result = service.getAllGames();
        expect(result.length).to.equal(3);
    });

    it("should return game if game is existing when calling getSoloById()", async () => {
        const game = new Game();
        service['gamesSolo'] = [game];
        const result = service.getSoloById(game.gameId);
        expect(result).to.equal(game);
    });

    it("should return undefined if game is not existing when calling getSoloById()", async () => {
        const game = service.getSoloById('test');
        expect(game).to.equal(undefined);
    });

    it("should return game if game is existing when calling get1v1ById()", async () => {
        const game = new Game();
        service['games1v1'] = [game];
        const result = service.get1v1ById(game.gameId);
        expect(result).to.equal(game);
    });

    it("should return undefined if game is not existing when calling get1v1ById()", async () => {
        const game = service.get1v1ById('test');
        expect(game).to.equal(undefined);
    });

    it("should return game if game is existing when calling getCoopById()", async () => {
        const game = new Game()
        service['gamesCoop'] = [game];
        const result = service.getCoopById(game.gameId);
        expect(result).to.equal(game);
    });

    it("should return undefined if game is not existing when calling getCoopById()", async () => {
        const game = service.getCoopById('test');
        expect(game).to.equal(undefined);
    });

    it("should return game if game is existing when calling getWaitingCoop()", async () => {
        const game = new Game();
        game.status = Status.WAITING_PLAYER;
        service['gamesCoop'] = [game];
        const result = service.getWaitingCoop();
        expect(result).to.equal(game);
    });

    it("should return undefined if game is not existing when calling getWaitingCoop()", async () => {
        const game = service.getWaitingCoop();
        expect(game).to.equal(undefined);
    });
});