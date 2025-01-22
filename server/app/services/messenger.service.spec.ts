import { GameCardTemplate } from "@common/game-card-template";
import { GameMode, NewTime } from "@common/game-classes";
import { Message, SenderType } from "@common/message";
import { Server } from "app/server";
import { assert } from 'chai';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance } from "sinon";
import { Socket, io as ioClient } from 'socket.io-client';
import Container from "typedi";
import { FileSystemService } from "./file-system.service";
import { MessengerService } from "./messenger.service";

describe('MessengerService', () => {
    let fileSystemServiceStub: SinonStubbedInstance<FileSystemService>;
    let messengerService: MessengerService;
    let server: Server;
    let clientSocket: Socket;
    let socketEmitSpy: sinon.SinonSpy;
    const urlString = 'http://localhost:3000';

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

    beforeEach(() => {
        fileSystemServiceStub = createStubInstance(FileSystemService);

        server = Container.get(Server);
        server.init();
        messengerService = server['messengerService'];
        messengerService['fileSystemService'] = fileSystemServiceStub;
        clientSocket = ioClient(urlString);
        fileSystemServiceStub.getGameCardById.resolves({
            id: 'abc',
            name: 'test',
        } as GameCardTemplate);
        socketEmitSpy = sinon.spy(messengerService['io'].sockets, 'emit');

    });

    afterEach(() => {
        clientSocket.close();
        messengerService['io'].close();
        sinon.restore();
    });

    describe('Socket connection ', () => {

        it('should be defined', () => {
            assert(messengerService);
        });

        it('init should init socket service', () => {
            assert(messengerService['io']);
        });

        it('emit should broadcast to all sockets when emiting time', () => {
            messengerService['io'].emit('test');
            assert(socketEmitSpy.called);
        });
    });

    describe('sendGlobalMessage', () => {
        it('should send a message to the socket', async () => {
            await messengerService.sendGlobalMessage(newTimeSolo, 0);
            sinon.assert.calledOnce(socketEmitSpy);
        });

        it('should send a message to the socket with the correct message', async () => {
            await messengerService.sendGlobalMessage(newTimeSolo, 0);
            const message = `<strong>${newTimeSolo.player}</strong> obtient la <strong>3ème</strong> place dans les meilleurs temps du jeu <strong>test</strong> en <strong>1 joueur</strong>`;
            const expectedMessage = new Message(message, undefined, SenderType.EVENT)
            sinon.assert.calledWith(socketEmitSpy, 'newMessage', expectedMessage);
        });

        it('should change the message if the game mode is 1v1', async () => {

            await messengerService.sendGlobalMessage(newTime1v1, 0);
            const message = `<strong>${newTime1v1.player}</strong> obtient la <strong>3ème</strong> place dans les meilleurs temps du jeu <strong>test</strong> en <strong>2 joueurs</strong>`;
            const expectedMessage = new Message(message, undefined, SenderType.EVENT)
            sinon.assert.calledWith(socketEmitSpy, 'newMessage', expectedMessage);
        });

        it('should change the message if the player is in 1st place', async () => {
            await messengerService.sendGlobalMessage(newTimeSolo, 2);
            const message = `<strong>${newTimeSolo.player}</strong> obtient la <strong>1ère</strong> place dans les meilleurs temps du jeu <strong>test</strong> en <strong>1 joueur</strong>`;
            const expectedMessage = new Message(message, undefined, SenderType.EVENT)
            sinon.assert.calledWith(socketEmitSpy, 'newMessage', expectedMessage);
        });

        it('should change the message if the player is in 2nd place', async () => {
            await messengerService.sendGlobalMessage(newTimeSolo, 1);
            const message = `<strong>${newTimeSolo.player}</strong> obtient la <strong>2ème</strong> place dans les meilleurs temps du jeu <strong>test</strong> en <strong>1 joueur</strong>`;
            const expectedMessage = new Message(message, undefined, SenderType.EVENT)
            sinon.assert.calledWith(socketEmitSpy, 'newMessage', expectedMessage);
        });
    });
});