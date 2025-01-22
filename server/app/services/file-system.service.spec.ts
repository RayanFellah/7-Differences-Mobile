import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { expect } from 'chai';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { FileSystemService } from './file-system.service';

const baseId = '123456';

describe('FileSystemService', () => {
    let fileSystemService: FileSystemService;
    let cryptoStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let readStub: sinon.SinonStub;
    let baseGameCards: GameCardTemplate[];
    const baseGameCard = new GameCardTemplate();

    beforeEach(async () => {
        fileSystemService = new FileSystemService();
        baseGameCards = [baseGameCard];
        cryptoStub = sinon.stub(crypto, 'randomUUID').callsFake(() => baseId);
        writeStub = sinon.stub(fs.promises, 'writeFile').callsFake(async () => Promise.resolve());
        readStub = sinon.stub(fs.promises, 'readFile').callsFake(async () => Promise.resolve(''));
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('saveImage test', () => {
        const baseImage = 'data:image/bmp;base64,test';
        const basePath = '/path';

        it('saveImage should generate a random id', async () => {
            await fileSystemService.saveImage(basePath, baseImage);
            expect(cryptoStub.callCount).to.equal(1);
        });

        it('saveImage should resolve to a valid id when file is written successfully', async () => {
            const id = await fileSystemService.saveImage(basePath, baseImage);
            expect(id).to.equal(baseId);
        });

        it('saveImage should resolve to an empty id if writing file fails', async () => {
            writeStub.callsFake(async () => Promise.reject());
            const id = await fileSystemService.saveImage(basePath, baseImage);
            expect(id).to.equal(consts.EMPTY_ID);
        });

        it('saveImage should call writeFile from fs.promises module', async () => {
            await fileSystemService.saveImage(basePath, baseImage);
            expect(writeStub.callCount).to.equal(1);
        });

        it('saveImage should write the new image to the file', async () => {
            let fakeFile = '';
            writeStub.callsFake(async (path: string, data: string) => {
                fakeFile = data;
                return Promise.resolve();
            });
            await fileSystemService.saveImage(basePath, baseImage);
            expect(fakeFile).to.equal(baseImage);
        });
    });

    describe('getImage test', () => {
        it('getImage should call readFile from fs.promises module', async () => {
            fileSystemService.getImage('');
            expect(readStub.callCount).to.equal(1);
        });

        it('getImage should return a promise', async () => {
            const promise = fileSystemService.getImage('');
            expect(promise).to.be.an.instanceOf(Promise);
        });
    });

    describe('saveGame test', () => {
        let gameCardsStub: sinon.SinonStub;
        beforeEach(() => {
            gameCardsStub = sinon.stub(fileSystemService, 'getGameCards').callsFake(async () => Promise.resolve(baseGameCards));
        });

        it('saveGameCard should generate a random id', async () => {
            await fileSystemService.saveGameCard(baseGameCard);
            expect(cryptoStub.callCount).to.equal(1);
        });

        it('saveGame should call getGameCards', async () => {
            await fileSystemService.saveGameCard(baseGameCard);
            expect(gameCardsStub.callCount).to.equal(1);
        });

        it('saveGame should add a new game card to the list of game cards', async () => {
            await fileSystemService.saveGameCard(baseGameCard);
            expect(baseGameCards.length).to.equal(2);
        });

        it('saveGame should return a promise', async () => {
            const promise = fileSystemService.saveGameCard(baseGameCard);
            expect(promise).to.be.an.instanceOf(Promise);
        });

        it('saveGame should write the new game cards list to the file', async () => {
            let fakeFile = '';
            writeStub.callsFake(async (path: string, data: string) => {
                fakeFile = data;
                return Promise.resolve();
            });
            await fileSystemService.saveGameCard(baseGameCard);
            expect(fakeFile).to.deep.equal(JSON.stringify({ gameCards: baseGameCards }));
        });
    });

    describe('getGameCards test', () => {
        beforeEach(() => {
            readStub.callsFake(async () => Promise.resolve(JSON.stringify({ gameCards: baseGameCards })));
        });

        it('getGameCards should call readFile from fs.promises module', async () => {
            await fileSystemService.getGameCards();
            expect(readStub.callCount).to.equal(1);
        });

        it('getGameCards should resolve to game cards', async () => {
            const cards = await fileSystemService.getGameCards();
            expect(cards).to.deep.equal(baseGameCards);
        });

        it('getGameCards should reject if reading file fails', async () => {
            readStub.rejects();
            try {
                await fileSystemService.getGameCards();
            } catch (error) {
                expect(error).to.exist;
            }
        });

    });

    describe('deleteGameCard test', () => {
        let gameCardsStub: sinon.SinonStub;
        let unlinkStub: sinon.SinonStub;
        beforeEach(() => {
            gameCardsStub = sinon.stub(fileSystemService, 'getGameCards').callsFake(async () => Promise.resolve(baseGameCards));
            unlinkStub = sinon.stub(fs.promises, 'unlink').callsFake(async () => Promise.resolve());
        });
        afterEach(() => {
            sinon.restore();
        });

        it('deleteGameCard should remove the game card with the provided id', async () => {
            const idToDelete = baseId;
            await fileSystemService.deleteGameCard(idToDelete);
            const remainingIds = baseGameCards.map(card => card.id);
            expect(remainingIds).to.not.include(idToDelete);
        });

        it('deleteGameCard should not remove any game card if the provided id does not exist', async () => {
            const idToDelete = '999999';
            try {
                await fileSystemService.deleteGameCard(idToDelete);
            } catch (e) {
                expect(e).equal(`Game card with id ${idToDelete} not found`);
            }
            expect(baseGameCards.length).to.equal(1);
        });

        it('deleteGameCard should call getGameCards', async () => {
            const idToDelete = baseId;
            await fileSystemService.deleteGameCard(idToDelete);
            expect(gameCardsStub.callCount).to.equal(1);
        });

        it('deleteGameCard should return a promise', async () => {
            const idToDelete = baseId;
            const promise = fileSystemService.deleteGameCard(idToDelete);
            expect(promise).to.be.an.instanceOf(Promise);
        });

        it('deleteGameCard should write the new game cards list to the file', async () => {
            let fakeFile = '';
            writeStub.callsFake(async (path: string, data: string) => {
                fakeFile = data;
                return Promise.resolve();
            });
            const idToDelete = baseId;
            await fileSystemService.deleteGameCard(idToDelete);
            expect(fakeFile).to.deep.equal(JSON.stringify({ gameCards: [] }));
        });
        it('deleteGameCard should call unlink from fs.promises module', async () => {
            const idToDelete = baseId;
            await fileSystemService.deleteGameCard(idToDelete);
            expect(unlinkStub.callCount).to.equal(2);
        });
    });

    describe('deleteAllGameCards test', () => {
        let gameCardsStub: sinon.SinonStub;
        let unlinkStub: sinon.SinonStub;
        beforeEach(() => {
            gameCardsStub = sinon.stub(fileSystemService, 'getGameCards').callsFake(async () => Promise.resolve(baseGameCards));
            unlinkStub = sinon.stub(fs.promises, 'unlink').callsFake(async () => Promise.resolve());
        });
        afterEach(() => {
            sinon.restore();
        });

        it('deleteAllGameCards should call getGameCards', async () => {
            await fileSystemService.deleteAllGameCards();
            expect(gameCardsStub.callCount).to.equal(1);
        });

        it('deleteAllGameCards should return a promise', async () => {
            const promise = fileSystemService.deleteAllGameCards();
            expect(promise).to.be.an.instanceOf(Promise);
        });

        it('deleteAllGameCards should call unlink from fs.promises module', async () => {
            await fileSystemService.deleteAllGameCards();
            expect(unlinkStub.callCount).to.equal(2);
        });

        it('deleteAllGameCards should write the new game cards list to the file', async () => {
            let fakeFile = '';
            writeStub.callsFake(async (path: string, data: string) => {
                fakeFile = data;
                return Promise.resolve();
            });
            await fileSystemService.deleteAllGameCards();
            expect(fakeFile).to.deep.equal(JSON.stringify({ gameCards: [] }));
        });
    });

    describe('getGameCardsLength test', () => {
        let gameCardsStub: sinon.SinonStub;
        beforeEach(() => {
            gameCardsStub = sinon.stub(fileSystemService, 'getGameCards').callsFake(async () => Promise.resolve(baseGameCards));
        });
        afterEach(() => {
            sinon.restore();
        });

        it('getGameCardsLength should call getGameCards', async () => {
            await fileSystemService.getGameCardsLength();
            expect(gameCardsStub.callCount).to.equal(1);
        });

        it('getGameCardsLength should return a promise', async () => {
            const promise = fileSystemService.getGameCardsLength();
            expect(promise).to.be.an.instanceOf(Promise);
        });

        it('getGameCardsLength should return the number of game cards', async () => {
            const length = await fileSystemService.getGameCardsLength();
            expect(length).to.equal(1);
        });
    });
});
