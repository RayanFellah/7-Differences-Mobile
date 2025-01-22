import { Application } from '@app/app';
import { DatabaseService } from '@app/services/database.service';
import { FileSystemService } from '@app/services/file-system.service';
import { MessengerService } from '@app/services/messenger.service';
import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { Constants, GameEnded, GameMode, NewTime } from '@common/game-classes';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import sinon = require('sinon');

describe('FileSystemController', () => {
    const baseId = '123456';
    const emptyId = consts.EMPTY_ID;
    let fileSystemServiceStub: SinonStubbedInstance<FileSystemService>;
    let messengerServiceStub: SinonStubbedInstance<MessengerService>;
    let databaseService: DatabaseService;
    let expressApp: Express.Application;
    let app: Application;
    const newTime = {
        gameMode: GameMode.CLASSIQUE_SOLO,
        duration: 0,
        player: 'TESTS -> SHOULD NOT UPDATE',
        gameCardId: 'TESTS -> SHOULD NOT UPDATE',
    } as NewTime;

    const gameEnded = {
        startDate: new Date(),
        duration: 0,
        gameMode: GameMode.CLASSIQUE_SOLO,
        player1: 'TESTS -> SHOULD NOT UPDATE',
        player2: 'TESTS -> SHOULD NOT UPDATE',
        quit: false,
        quitCoop: false,
    } as GameEnded;

    const gameCardTemplate = {
        id: baseId,
    } as GameCardTemplate;


    beforeEach(async () => {
        fileSystemServiceStub = createStubInstance(FileSystemService);
        messengerServiceStub = createStubInstance(MessengerService);
        databaseService = new DatabaseService(messengerServiceStub);
        await databaseService.start();
        app = Container.get(Application);
        Object.defineProperty(app['fileSystemController'], 'fileSystemService', { value: fileSystemServiceStub });
        Object.defineProperty(app['fileSystemController'], 'databaseService', { value: databaseService });
        expressApp = app.app;
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    describe('destructor', () => {

        it('should call closeConnection', async () => {
            const closeConnectionSpy = sinon.spy(databaseService, 'closeConnection');
            app['fileSystemController'].destructor();
            expect(closeConnectionSpy.calledOnce).to.be.true;
        });

    });

    describe('post request to /image', () => {
        it('should return a valid id on valid post request to /image', async () => {
            fileSystemServiceStub.saveImage.resolves(baseId);
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/image`)
                .send({ img: '' })
                .set('Accept', 'application/text')
                .expect(StatusCodes.CREATED)
                .then((response) => {
                    expect(response.text).to.deep.equal(baseId);
                });
        });

        it('should return an empty id on invalid post request to /image', async () => {
            fileSystemServiceStub.saveImage.resolves(emptyId);
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/image`)
                .send({ img: '' })
                .set('Accept', 'application/text')
                .expect(StatusCodes.BAD_REQUEST)
                .then((response) => {
                    expect(response.text).to.deep.equal(emptyId);
                });
        });
    });

    describe('post request to /gameCard', () => {
        it('should return created status code on valid post request to /gameCard', async () => {
            fileSystemServiceStub.saveGameCard.resolves();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/gameCard`)
                .send({ gameCard: gameCardTemplate })
                .set('Accept', 'application/json')
                .expect(StatusCodes.CREATED);
        });

        it('should return bad request status code on invalid post request to /gameCard', async () => {
            fileSystemServiceStub.saveGameCard.resolves();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/gameCard`)
                .set('Accept', 'application/json')
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should return server error if saveGameCard fails', async () => {
            fileSystemServiceStub.saveGameCard.rejects();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/gameCard`)
                .send({ gameCard: gameCardTemplate })
                .set('Accept', 'application/json')
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('get request to /image', () => {
        it('should return an image on valid get request to /image', async () => {
            const image = 'data';
            fileSystemServiceStub.getImage.resolves(image);
            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/image?id=${baseId}`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.text).to.deep.equal(image);
                });
        });

        it('should return no content status code on invalid get request to /image', async () => {
            fileSystemServiceStub.getImage.rejects();
            return supertest(expressApp).get(`/api/${consts.FILE_SYSTEM}/image?id=${emptyId}`).expect(StatusCodes.NO_CONTENT);
        });
    });

    describe('get request to /gameCard', () => {
        it('should return game cards list on get request to /gameCards', async () => {
            const gameCards = [gameCardTemplate];
            fileSystemServiceStub.getGameCards.resolves(gameCards);
            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/gameCards`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(gameCards);
                });
        });

        it('should return no content status on get request to /gameCards when file system service fails', async () => {
            fileSystemServiceStub.getGameCards.rejects();
            return supertest(expressApp).get(`/api/${consts.FILE_SYSTEM}/gameCards`).expect(StatusCodes.NO_CONTENT);
        });
    });

    describe('delete request to /gameCard', () => {
        it('should return ok status code on valid delete request to /gameCard', async () => {
            fileSystemServiceStub.deleteGameCard.resolves();
            return supertest(expressApp)
                .delete(`/api/${consts.FILE_SYSTEM}/gameCard?id=${baseId}`)
                .expect(StatusCodes.OK);
        });

        it('should return no content status code on invalid delete request to /gameCard', async () => {
            fileSystemServiceStub.deleteGameCard.rejects();
            return supertest(expressApp)
                .delete(`/api/${consts.FILE_SYSTEM}/gameCard?id=${emptyId}`)
                .expect(StatusCodes.NO_CONTENT);
        });
    });

    describe('delete request to /gameCards', () => {

        beforeEach(() => {
            sinon.stub(databaseService, 'deleteAllBestTimes').resolves();
        });

        it('should return ok status code on valid delete request to /gameCards', async () => {
            fileSystemServiceStub.deleteAllGameCards.resolves();
            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/gameCards`).expect(StatusCodes.OK);
        });

        it('should return no content status code on invalid delete request to /gameCards', async () => {
            fileSystemServiceStub.deleteAllGameCards.rejects();
            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/gameCards`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('post request to /gameEnded', () => {
        it('should return created status code on valid post request to /gameEnded', async () => {
            sinon.stub(databaseService, 'saveGameToHistory').resolves();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/gameEnded`)
                .send({ gameEnded })
                .set('Accept', 'application/json')
                .expect(StatusCodes.CREATED);
        });

        it('should return bad request status code on invalid post request to /gameEnded', async () => {
            sinon.stub(databaseService, 'saveGameToHistory').resolves();
            const invalidGameEnded = {};
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/gameEnded`)
                .send({ invalidGameEnded })
                .set('Accept', 'application/json')
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should return server error status code if saveGameToHistory fails', async () => {
            sinon.stub(databaseService, 'saveGameToHistory').rejects();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/gameEnded`)
                .send({ gameEnded })
                .set('Accept', 'application/json')
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });

    });

    describe('get request to /history', () => {
        it('should return history on get request to /history', async () => {
            const history = [gameEnded];
            sinon.stub(databaseService, 'getHistory').resolves(history);
            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/history`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    const result = response.body as GameEnded[];
                    result.forEach((game) => {
                        game.startDate = new Date(game.startDate);
                    });
                    expect(result).to.deep.equal(history);
                });
        });

        it('should return server error status on get request to /history when database service fails', async () => {
            sinon.stub(databaseService, 'getHistory').rejects();
            return supertest(expressApp).get(`/api/${consts.FILE_SYSTEM}/history`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('delete request to /history', () => {
        it('should return ok status code on valid delete request to /history', async () => {
            sinon.stub(databaseService, 'deleteHistory').resolves();
            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/history`).expect(StatusCodes.OK);
        });

        it('should return server error status code on invalid delete request to /history', async () => {
            sinon.stub(databaseService, 'deleteHistory').rejects();
            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/history`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('post request to /newTime', () => {
        it('should return created status code on valid post request if it sets a new time', async () => {
            sinon.stub(databaseService, 'setNewTime').resolves(true);
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/newTime`)
                .send({ newTime })
                .set('Accept', 'application/json')
                .expect(StatusCodes.CREATED);
        });

        it('should return ok status code on valid post request if it doesnt set a new time', async () => {
            sinon.stub(databaseService, 'setNewTime').resolves(false);

            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/newTime`)
                .send({ newTime })
                .set('Accept', 'application/json')
                .expect(StatusCodes.OK);
        });

        it('should return bad request status code on invalid post request', async () => {
            const invalidNewTime = {};
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/newTime`)
                .send({ invalidNewTime })
                .set('Accept', 'application/json')
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should return server error status code if setNewTime fails', async () => {
            sinon.stub(databaseService, 'setNewTime').rejects();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/newTime`)
                .send({ newTime })
                .set('Accept', 'application/json')
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('get request to /bestTimes', () => {
        it('should return best times on get request to /bestTimes', async () => {
            const bestTimes = [newTime];
            sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);

            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(bestTimes);
                });
        });

        it('should return server error status code on get request to /bestTimes when database service fails', async () => {
            sinon.stub(databaseService, 'getBestTimes').rejects();

            return supertest(expressApp).get(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        it('should call getBestTimes with the correct gameCardId', async () => {
            const bestTimes = [newTime];
            const getBestTimesStub = sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);

            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`)
                .expect(StatusCodes.OK)
                .then(() => {
                    expect(getBestTimesStub.calledWith('1')).to.be.true;
                });
        });

        it('should call getBestTimes', async () => {
            const bestTimes = [newTime];
            const getBestTimesStub = sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);

            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`)
                .expect(StatusCodes.OK)
                .then(() => {
                    expect(getBestTimesStub.called).to.be.true;
                });
        });

        it('should call getBestTimes with the correct gameCardId', async () => {
            const bestTimes = [newTime];
            const getBestTimesStub = sinon.stub(databaseService, 'getBestTimes').resolves(bestTimes);

            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`)
                .expect(StatusCodes.OK)
                .then(() => {
                    expect(getBestTimesStub.calledWith('1')).to.be.true;
                });
        });
        it('should return bad request status code on invalid get request', async () => {
            return supertest(expressApp).get(`/api/${consts.FILE_SYSTEM}/bestTimes`).expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('delete request to /bestTimes/all', () => {
        it('should return ok status code on valid delete request to /bestTimes/all', async () => {
            const gameCards = [gameCardTemplate];
            fileSystemServiceStub.getGameCards.resolves(gameCards);
            sinon.stub(databaseService, 'resetAllBestTimes').resolves();

            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/bestTimes/all`).expect(StatusCodes.OK);
        });

        it('should return server error status code on invalid delete request to /bestTimes/all', async () => {
            const gameCards = [gameCardTemplate];
            fileSystemServiceStub.getGameCards.resolves(gameCards);
            sinon.stub(databaseService, 'resetAllBestTimes').rejects();

            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/bestTimes/all`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        it('should return no content status code if there are no game cards', async () => {
            fileSystemServiceStub.getGameCards.resolves([]);

            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/bestTimes/all`).expect(StatusCodes.NO_CONTENT);
        });

    });

    describe('delete request to /bestTimes', () => {
        it('should return ok status code on valid delete request', async () => {
            sinon.stub(databaseService, 'resetBestTimes').resolves();
            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`).expect(StatusCodes.OK);
        });

        it('should return server error status code if resetBestTimes fails', async () => {
            sinon.stub(databaseService, 'resetBestTimes').rejects();

            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/bestTimes?gameCardId=1`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        it('should return bad request status code on invalid delete request', async () => {
            return supertest(expressApp).delete(`/api/${consts.FILE_SYSTEM}/bestTimes`).expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('get request to /constants', () => {
        it('should return constants on get request to /constants', async () => {
            const constants = new Constants();
            sinon.stub(databaseService, 'getConstants').resolves(constants);
            return supertest(expressApp)
                .get(`/api/${consts.FILE_SYSTEM}/constants`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(constants);
                });
        });

        it('should return server error status code on get request to /constants when database service fails', async () => {
            sinon.stub(databaseService, 'getConstants').rejects();

            return supertest(expressApp).get(`/api/${consts.FILE_SYSTEM}/constants`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('post request to /constants', () => {
        it('should return created status code on valid post request to /constants', async () => {
            sinon.stub(databaseService, 'setConstants').resolves();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/constants`)
                .expect(StatusCodes.CREATED)
                .send({ constants: newTime })
                .expect(StatusCodes.CREATED)
        });

        it('should return server error status code on invalid post request to /constants', async () => {
            sinon.stub(databaseService, 'setConstants').resolves();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/constants`)
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should return server error status code if setConstants fails', async () => {
            sinon.stub(databaseService, 'setConstants').rejects();
            return supertest(expressApp)
                .post(`/api/${consts.FILE_SYSTEM}/constants`)
                .send({ constants: newTime })
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

});
