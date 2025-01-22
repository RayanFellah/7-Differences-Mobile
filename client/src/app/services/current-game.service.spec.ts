import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/internal/Observable';

import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ReplayPageComponent } from '@app/pages/replay-page/replay-page.component';
import { CurrentGameService } from './current-game.service';
import { ReplayService } from './replay.service';
import { SocketService } from './socket.service';

describe('CurrentGameService', () => {
  let service: CurrentGameService;
  let socketService: SocketService;
  let replayService: jasmine.SpyObj<ReplayService>;

  const pathReplay = 'replay';
  const pathNotReplay = 'game';

  const routes = [
    { path: pathReplay, component: ReplayPageComponent },
    { path: pathNotReplay, component: GamePageComponent },
  ] as Routes;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        { provide: ReplayService, useValue: replayService }
      ],
    });

    service = TestBed.inject(CurrentGameService);
    socketService = TestBed.inject(SocketService);
    replayService = jasmine.createSpyObj('ReplayService', ['addClickEventReplay', 'addCounterEventReplay']);

    socketService.listen = jasmine.createSpy('listen').and.returnValue(
      new Observable((observer) => {
        observer.next({ diffArray: [{ points: [0, 4, 8] }], winner: 'test', other: false });
      }),
    );
    socketService.emit = jasmine.createSpy('emit');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a currentPlayerCount attribute set to 0', () => {
    expect(service.currentPlayerCount.value).toEqual(0);
  });

  it('should have a currentPlayerName attribute set to ""', () => {
    expect(service.currentPlayerName).toEqual('');
  });

  it('should have a otherPlayerCount attribute set to 0', () => {
    expect(service.otherPlayerCount.value).toEqual(0);
  });

  it('should have a otherPlayerName attribute set to ""', () => {
    expect(service.otherPlayerName).toEqual('');
  });

  it('should have a diffArray attribute set to []', () => {
    expect(service.diffArray.value).toEqual([]);
  });

  it('should have a endGame attribute set to false-false', () => {
    expect(service.endGame.value).toEqual([false, false]);
  });

  it('should have a winner attribute set to ""', () => {
    expect(service.winner.value).toEqual('');
  });

  it('should have a leader attribute set to false', () => {
    expect(service.leader.value).toEqual(false);
  });

  it('should subscribe to socketService.listen("leader")', () => {
    service = new CurrentGameService(socketService, replayService);
    expect(socketService.listen).toHaveBeenCalledWith('leader');
  });

  it('should set leader to true when socketService.listen("leader") is called', () => {
    service = new CurrentGameService(socketService, replayService);
    expect(service.leader.value).toEqual(true);
  });

  it('should subscribe to socketService.listen("diffFound")', () => {
    socketService.listen = jasmine.createSpy('listen').and.returnValue(
      new Observable((observer) => {
        observer.next({ other: false, coords: { x: 0, y: 0 } });
      }),
    );
    service = new CurrentGameService(socketService, replayService);
    expect(socketService.listen).toHaveBeenCalledWith('diffFound');
  });

  it('should increment currentPlayerCount when socketService.listen("diffFound") is called', () => {
    socketService.listen = jasmine.createSpy('listen').and.returnValue(
      new Observable((observer) => {
        observer.next({ other: false, coords: { x: 0, y: 0 } });
      }),
    );
    service = new CurrentGameService(socketService, replayService);
    expect(service.currentPlayerCount.value).toEqual(1);
  });

  it('should increment otherPlayerCount when socketService.listen("diffFound") is called', () => {
    socketService.listen = jasmine.createSpy('listen').and.returnValue(
      new Observable((observer) => {
        observer.next({ other: true, coords: { x: 0, y: 0 } });
      }),
    );
    service = new CurrentGameService(socketService, replayService);
    expect(service.otherPlayerCount.value).toEqual(1);
  });

  it('should subscribe to socketService.listen("End")', () => {
    service = new CurrentGameService(socketService, replayService);
    expect(socketService.listen).toHaveBeenCalledWith('End');
  });

  it('should set winner to res when socketService.listen("End") is called', () => {
    socketService.listen = jasmine.createSpy('listen').and.callFake(
      (event: string) =>
        new Observable((observer) => {
          if (event === 'End') {
            observer.next("test");
          }
        }),
    );
    service = new CurrentGameService(socketService, replayService);
    expect(service.winner.value).toEqual('test');
  });

  it('should subscribe to socketService.listen("otherPlayerQuit")', () => {
    service = new CurrentGameService(socketService, replayService);
    expect(socketService.listen).toHaveBeenCalledWith('otherPlayerQuit');
  });

  it('should set endGame to true-true when socketService.listen("otherPlayerQuit") is called', () => {
    service = new CurrentGameService(socketService, replayService);
    expect(service.endGame.value).toEqual([true, true]);
  });

  it('should set currentplayerName to test1 and otherPlayerName to test2 when init is called', () => {
    service.init('test1', 'test2');
    expect(service.currentPlayerName).toEqual('test1');
    expect(service.otherPlayerName).toEqual('test2');
  });

  it('should increment currentPlayerCount when increment is called', () => {
    service.increment();
    expect(service.currentPlayerCount.value).toEqual(1);
  });

  it('should increment otherPlayerCount when incrementOther is called', () => {
    service.incrementOther();
    expect(service.otherPlayerCount.value).toEqual(1);
  });

  it('should reset currentPlayerCount and otherPlayerCount to 0 when resetCount is called', () => {
    service.resetCount();
    expect(service.currentPlayerCount.value).toEqual(0);
    expect(service.otherPlayerCount.value).toEqual(0);
  });
});
