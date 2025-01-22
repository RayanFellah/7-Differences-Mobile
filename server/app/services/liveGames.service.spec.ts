import { Game, Status } from '@common/game';
import { Player } from '@common/player';
import { expect } from 'chai';
import { LiveGamesService } from './liveGames.service';
import sinon = require('sinon');

export enum Difficulty {
    Easy = 'Facile',
    Hard = 'Difficile',
}

describe('LiveGamesService service', () => {
    let liveGamesService: LiveGamesService = new LiveGamesService();

    it('should add a game', () => {
        const game = new Game();
        liveGamesService.add(game);
        expect(liveGamesService.current.length).to.equal(1);
    });
    it('should remove a game', () => {
        const game = new Game();
        liveGamesService.add(game);
        liveGamesService.removeGame(game.gameId);
        expect(liveGamesService.current.length).to.equal(0);
    });
    it('should get players', () => {
        const game = new Game();
        game.gameId = "id";
        const player1 = new Player('1', 'player1');
        const player2 = new Player('2', 'player2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        liveGamesService.add(game);
        expect(liveGamesService.getPlayers(game.gameId)).to.equal(game.getPlayers());
    });
    it('should increment counter', () => {
        const game = new Game();
        game.gameId = "id";
        const player1 = new Player('1', 'player1');
        const player2 = new Player('2', 'player2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        liveGamesService.add(game);
        liveGamesService.incrementCounter(game.gameId, player1.id);
        expect(liveGamesService.getGameById("id")?.counter1).to.equal(1);
        expect(liveGamesService.getGameById("id")?.counter2).to.equal(0);
        liveGamesService.incrementCounter(game.gameId, player2.id);
        expect(liveGamesService.getGameById("id")?.counter1).to.equal(1);
        expect(liveGamesService.getGameById("id")?.counter2).to.equal(1);
        liveGamesService.incrementCounter(game.gameId, "3");
        expect(liveGamesService.getGameById("id")?.counter1).to.equal(1);
        expect(liveGamesService.getGameById("id")?.counter2).to.equal(1);
    });

    it("should update status winner 1", () => {
        const game = new Game();
        game.gameId = "id5";
        const player1 = new Player('1', 'player1');
        const player2 = new Player('2', 'player2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        game.gameCard = { id: "a", name: "b", difficulty: Difficulty.Easy, img1ID: "c", img2ID: "d", differences: [{ points: [111111] }, { points: [222222] }], initDefault() {}, isComplete() { return true; } };

        liveGamesService.add(game);
        expect(liveGamesService.updateStatus(game.gameId)).to.deep.equal({ status: Status.ACTIVE, winner: "" });
        liveGamesService.incrementCounter(game.gameId, player1.id);
        expect(liveGamesService.updateStatus(game.gameId)).to.deep.equal({ status: Status.ENDED, winner: player1.name });
    });

    it("should update status winner 2", () => {
        const game = new Game();
        game.gameId = "id6";
        const player1 = new Player('1', 'player1');
        const player2 = new Player('2', 'player2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        game.gameCard = { id: "a", name: "b", difficulty: Difficulty.Easy, img1ID: "c", img2ID: "d", differences: [{ points: [111111] }, { points: [222222] }], initDefault() {}, isComplete() { return true; } };

        liveGamesService.add(game);
        expect(liveGamesService.updateStatus(game.gameId)).to.deep.equal({ status: Status.ACTIVE, winner: "" });
        liveGamesService.incrementCounter(game.gameId, player2.id);
        expect(liveGamesService.updateStatus(game.gameId)).to.deep.equal({ status: Status.ENDED, winner: player2.name });
    });

    it("should not update status if not gamecard", () => {
        const game = new Game();
        game.gameId = "id7";
        const player1 = new Player('1', 'player1');
        const player2 = new Player('2', 'player2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        liveGamesService.add(game);
        expect(liveGamesService.updateStatus(game.gameId)).to.deep.equal({ status: Status.ACTIVE, winner: "" });
        liveGamesService.incrementCounter(game.gameId, player1.id);
        expect(liveGamesService.updateStatus(game.gameId)).to.deep.equal({ status: Status.ACTIVE, winner: "" });
    });

    it('should not increment counter if no game', () => {
        liveGamesService.incrementCounter("zzz", "z");
        expect(liveGamesService.getGameById("zzz")?.counter1).to.equal(undefined);
        expect(liveGamesService.getGameById("zzz")?.counter2).to.equal(undefined);
    });

    it('getPlayers should call getGameById', () => {
        const getGameByIdStub = sinon.stub(liveGamesService, 'getGameById');
        const gameId = "test"
        liveGamesService.getPlayers(gameId);
        expect(getGameByIdStub.callCount).to.equal(1);
        expect(getGameByIdStub.calledWith(gameId)).to.equal(true);
    });

    it('updateStatus should return status active if no game', () => {
        const gameId = "test"
        expect(liveGamesService.updateStatus(gameId)).to.deep.equal({ status: Status.ACTIVE, winner: "" });
    });
});
