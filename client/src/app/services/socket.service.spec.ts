import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('socket uri is localhost:3000', () => {
        expect(service.uri).toEqual('ws://localhost:3000');
    });

    it('emit calls this.socket.emit with the good parameters', () => {
        service.socket.emit = jasmine.createSpy();
        service.emit('test', 'test message');
        expect(service.socket.emit).toHaveBeenCalledWith('test', 'test message');
    });

    it('listen creates an observable', () => {
        service.emit('test', 'test message');
        const obs = service.listen('test');
        expect(obs).toBeInstanceOf(Observable);
    });

    it('listen listens to the right event and send correct data', () => {
        const testData = 'test message';
        const mockSocket = jasmine.createSpyObj('socket', ['on', 'emit']);
        service.socket = mockSocket;
        service.listen('test').subscribe((data: unknown) => {
            expect(data).toBe(testData);
        });
        service.socket.on.calls.argsFor(0)[1](testData);
    });
});
