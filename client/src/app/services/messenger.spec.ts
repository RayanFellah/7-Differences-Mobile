import { TestBed } from "@angular/core/testing";
import { Message } from "@common/message";
import { of } from "rxjs";
import { Messenger } from "./messenger";
import { ReplayService } from "./replay.service";
import { SocketService } from "./socket.service";

describe('Messenger', () => {
    let service: Messenger;
    let socketServiceSpy: SocketService;
    let replayService: jasmine.SpyObj<ReplayService>;

    const message = new Message('test message', 'test user');

    beforeEach(() => {
        replayService = jasmine.createSpyObj('ReplayService', ['addMessageEventReplay']);
        TestBed.configureTestingModule({
            providers: [
                Messenger,
                { provide: ReplayService, useValue: replayService }
            ]
        });
        service = TestBed.inject(Messenger);
        socketServiceSpy = TestBed.inject(SocketService);
        service.socketService = socketServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('send should emit localMessage', () => {
        const emitSpy = spyOn(socketServiceSpy, 'emit');
        service.send(message.sender, message.body);
        expect(emitSpy).toHaveBeenCalledWith('localMessage', message);
    });

    it('should add a new message to the list when receiving a valid message', () => {
        spyOn(socketServiceSpy, 'listen').and.returnValue(of(message));

        service.receive();

        expect(service.messages.length).toBe(1);
        expect(service.messages[0]).toEqual(message);
    });

    it('addMessage should add a message to the list', () => {
        service.addMessage(message);
        expect(service.messages.length).toBe(1);
        expect(service.messages[0]).toEqual(message);
    });
});