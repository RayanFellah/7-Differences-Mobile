import { GameEnded, GameMode, NewTime } from "@common/game-classes";
import { expect } from "chai";
import { Collection } from "mongodb";
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance } from "sinon";
import { DatabaseService } from "./database.service";
import { MessengerService } from "./messenger.service";

describe('databaseService', () => {
    let messengerServiceStub: SinonStubbedInstance<MessengerService>;
    let databaseService: DatabaseService;
    let collectionStub: any;
    const gameEnded = {
        startDate: new Date(),
        duration: 0,
        gameMode: GameMode.CLASSIQUE_SOLO,
        player1: 'TESTS -> SHOULD NOT UPDATE',
        player2: 'TESTS -> SHOULD NOT UPDATE',
        quit: false,
        quitCoop: false
    } as GameEnded;

    const newTimeSolo = {
        gameMode: GameMode.CLASSIQUE_SOLO,
        duration: 1000,
        player: 'TESTS -> SHOULD NOT UPDATE',
        gameCardId: 'abc',
    } as NewTime;

    const newTime1v1 = {
        gameMode: GameMode.CLASSIQUE_1V1,
        duration: 1000,
        player: 'TESTS -> SHOULD NOT UPDATE',
        gameCardId: 'abc',
    } as NewTime;

    const bestTimes = [
        newTimeSolo, newTimeSolo, newTimeSolo, newTime1v1, newTime1v1, newTime1v1
    ]

    const newBestTime = {
        gameMode: GameMode.CLASSIQUE_SOLO,
        duration: 500,
        player: 'TESTS -> SHOULD NOT UPDATE',
        gameCardId: 'abc',
    } as NewTime;

    beforeEach(async () => {
        messengerServiceStub = createStubInstance(MessengerService);
        databaseService = new DatabaseService(messengerServiceStub);
        collectionStub = sinon.createStubInstance(Collection);
        collectionStub.insertOne.resolves();
        collectionStub.find.returns({
            toArray: sinon.stub().resolves([]),
        } as any);
        collectionStub.deleteMany.resolves();
        collectionStub.replaceOne.resolves();
        sinon.stub(databaseService['database'], 'collection').returns(collectionStub);
        await databaseService.start();
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        sinon.restore();
    });

    describe('start', () => {
        it('should call client.connect', async () => {
            const connectStub = sinon.stub(databaseService['client'], 'connect').resolves();
            await databaseService.start();
            sinon.assert.calledOnce(connectStub);
        });

        it('should throw an error if client.connect fails', async () => {
            const connectStub = sinon.stub(databaseService['client'], 'connect').rejects();
            try {
                await databaseService.start();
                expect.fail('start should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Database connection error');
                sinon.assert.calledOnce(connectStub);
            }
        });
    });

    describe('closeConnection', () => {
        it('should call client.close', async () => {
            const closeStub = sinon.stub(databaseService['client'], 'close').resolves();
            await databaseService.closeConnection();
            sinon.assert.calledOnce(closeStub);
        });
    });

    describe('saveGameToHistory', () => {
        it('should insert a gameEnded object into the history collection', async () => {
            await databaseService.saveGameToHistory(gameEnded);
            collectionStub.insertOne.resolves();
            sinon.assert.calledOnce(collectionStub.insertOne);
            sinon.assert.calledWith(collectionStub.insertOne, {
                startDate: gameEnded.startDate,
                duration: gameEnded.duration,
                gameMode: gameEnded.gameMode,
                player1: gameEnded.player1,
                player2: gameEnded.player2,
                quit: gameEnded.quit,
                quitCoop: gameEnded.quitCoop,
            });
        });

        it('should throw an error if client.connect fails', async () => {
            const connectStub = sinon.stub(databaseService['client'], 'connect').rejects();
            try {
                await databaseService.start();
            } catch (error) {
                expect(error.message).to.equal('Database connection error');
            }
            sinon.assert.calledOnce(connectStub);
        });
    });

    describe('getHistory', () => {
        it('should return an array of gameEnded objects', async () => {
            const games = [
                gameEnded,
                gameEnded,
            ];
            collectionStub.find.returns({
                toArray: sinon.stub().resolves(games),
            });
            const result = await databaseService.getHistory();
            expect(result).to.deep.equal(games);
        });
    });

    describe('deleteHistory', () => {
        it('should call deleteMany on the history collection', async () => {
            await databaseService.deleteHistory();
            sinon.assert.calledOnce(collectionStub.deleteMany);
            sinon.assert.calledWith(collectionStub.deleteMany, {});
        });
    });

    describe('setNewTime', () => {
        it('should call replaceOne on the bestTime collection', async () => {
            sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);
            collectionStub.replaceOne.resolves();
            collectionStub.replaceOne = sinon.spy();
            await databaseService.setNewTime(newBestTime);

            sinon.assert.calledOnce(collectionStub.replaceOne);
            sinon.assert.calledWith(collectionStub.replaceOne, { gameCardId: newTimeSolo.gameCardId, duration: bestTimes[0].duration, gameMode: newTimeSolo.gameMode }, {
                duration: newBestTime.duration,
                gameMode: newBestTime.gameMode,
                player: newBestTime.player,
                gameCardId: newBestTime.gameCardId,
            });
        });

        it('should call sendGlobalMessage on messengerService if a new best time is set', async () => {
            sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);
            await databaseService.setNewTime(newBestTime);
            sinon.assert.calledOnce(messengerServiceStub.sendGlobalMessage);
        });

        it('should return false if there are not 6 best times for the gameCardId', async () => {
            sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes.slice(0, 5));
            const result = await databaseService.setNewTime(newBestTime);
            expect(result).to.equal(false);
        });

        it('should return false if the new time is not a best time', async () => {
            sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);
            const result = await databaseService.setNewTime(newTimeSolo);
            expect(result).to.equal(false);
        });

    });

    describe('getBestTimes', () => {
        it('should return an array of newTime objects', async () => {
            const games = [
                newBestTime,
                newBestTime,
            ];
            collectionStub.find.returns({
                toArray: sinon.stub().resolves(games),
            });
            const result = await databaseService.getBestTimes('gameCardId');
            expect(result).to.deep.equal(games);
        });
    });

    describe('setMockData', () => {
        it('should call insertMany on the bestTime collection', async () => {
            await databaseService.setMockData('abc', GameMode.CLASSIQUE_SOLO);
            sinon.assert.calledOnce(collectionStub.insertMany);
            sinon.assert.calledWith(collectionStub.insertMany, [
                {
                    duration: 30000,
                    gameMode: GameMode.CLASSIQUE_SOLO,
                    player: 'Booba',
                    gameCardId: 'abc',
                },
                {
                    duration: 40000,
                    gameMode: GameMode.CLASSIQUE_SOLO,
                    player: 'Kaaris',
                    gameCardId: 'abc',
                },
                {
                    duration: 50000,
                    gameMode: GameMode.CLASSIQUE_SOLO,
                    player: 'Jul',
                    gameCardId: 'abc',
                },
            ]);
        });
    });

    describe('deleteBestTimes', () => {
        it('should call deleteMany on the bestTime collection', async () => {
            await databaseService.deleteBestTimes('abc');
            sinon.assert.calledOnce(collectionStub.deleteMany);
            sinon.assert.calledWith(collectionStub.deleteMany, { gameCardId: 'abc' });
        });
    });

    describe('resetBestTimes', () => {
        it('should call deleteBestTimes and setMockData', async () => {
            const deleteBestTimesStub = sinon.stub(databaseService, 'deleteBestTimes').resolves();
            const setMockDataStub = sinon.stub(databaseService, 'setMockData').resolves();
            await databaseService.resetBestTimes('abc');
            sinon.assert.calledOnce(deleteBestTimesStub);
            sinon.assert.calledWith(deleteBestTimesStub, 'abc');
            sinon.assert.calledTwice(setMockDataStub);
            sinon.assert.calledWith(setMockDataStub, 'abc', GameMode.CLASSIQUE_SOLO);
            sinon.assert.calledWith(setMockDataStub, 'abc', GameMode.CLASSIQUE_1V1);
        });
    });

    describe('resetAllBestTimes', () => {
        it('should call resetBestTimes for each gameCardId', async () => {
            const resetBestTimesStub = sinon.stub(databaseService, 'resetBestTimes').resolves();
            await databaseService.resetAllBestTimes(['abc', 'def']);
            sinon.assert.calledTwice(resetBestTimesStub);
            sinon.assert.calledWith(resetBestTimesStub, 'abc');
            sinon.assert.calledWith(resetBestTimesStub, 'def');
        });
    });

    describe('getConstants', () => {
        it('should return an object of type Constants', async () => {
            const constants = {
                initialTime: 100,
                penalty: 10,
                timeWon: 20,
            };
            collectionStub.findOne.returns(constants);
            const result = await databaseService.getConstants();
            expect(result).to.deep.equal(constants);
        });

        it('should return an empty object if no constants are found', async () => {
            collectionStub.findOne.returns(null);
            const result = await databaseService.getConstants();
            expect(result).to.deep.equal({});
        });
    });

    describe('setConstants', () => {
        it('should call replaceOne on the constants collection', async () => {
            const constants = {
                initialTime: 100,
                penalty: 10,
                timeWon: 20,
            };
            await databaseService.setConstants(constants);
            sinon.assert.calledOnce(collectionStub.replaceOne);
            sinon.assert.calledWith(collectionStub.replaceOne, {}, constants);
        });
    });

    describe('deleteAllBestTimes', () => {
        it('should call deleteMany on the bestTime collection', async () => {
            await databaseService.deleteAllBestTimes();
            sinon.assert.calledOnce(collectionStub.deleteMany);
            sinon.assert.calledWith(collectionStub.deleteMany, {});
        });
    });
});