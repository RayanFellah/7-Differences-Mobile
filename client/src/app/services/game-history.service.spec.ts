import { TestBed } from '@angular/core/testing';

import { HttpClient, HttpHandler, HttpResponse } from '@angular/common/http';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { consts } from '@common/consts';
import { GameEnded, GameMode, NewTime } from '@common/game-classes';
import { Observable } from 'rxjs';
import { CommunicationService } from './communication.service';
import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
  let service: GameHistoryService;
  let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
  const gameMode = GameMode.CLASSIQUE_SOLO;
  const initialTime = new Date();
  const duration = 100;
  const player1 = 'player1';
  const player2 = 'player2';
  const gameCardId = 'gameCardId';
  const quit = false;
  const quitCoop = false;

  beforeEach(() => {
    communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['addGameToHistory', 'setNewTime']);
    TestBed.configureTestingModule({
      declarations: [GameHistoryComponent],
      providers: [
        { provide: CommunicationService, useValue: communicationServiceSpy },
        HttpClient,
        HttpHandler,
      ]
    });
    service = TestBed.inject(GameHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uploadHistory should call communicationService.addGameToHistory', () => {
    const game: GameEnded = {
      startDate: initialTime,
      duration: duration,
      gameMode: gameMode,
      player1: player1,
      player2: player2,
      quit: quit,
      quitCoop: quitCoop
    }
    const spy = communicationServiceSpy.addGameToHistory.and.returnValue(new Observable<HttpResponse<string>>((observer) => {
      observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_CREATED }));
    }))
    service.uploadHistory(gameMode, initialTime, duration, player1, player2, quit);
    expect(spy).toHaveBeenCalledWith(game);
  });

  it('uploadHistory should reject if communicationService.addGameToHistory returns an error', () => {
    communicationServiceSpy.addGameToHistory.and.returnValue(new Observable<HttpResponse<string>>((observer) => {
      observer.next(new HttpResponse<string>({ status: consts.HTTP_BAD_REQUEST }));
    }))
    service.uploadHistory(gameMode, initialTime, duration, player1, player2, quit).catch((error) => {
      expect(error).toEqual(new Error('Error while uploading to history'));
    });
  });

  it('uploadNewTime should call communicationService.setNewTime', () => {
    const game: NewTime = {
      duration: duration,
      gameMode: gameMode,
      player: player1,
      gameCardId: gameCardId,
    }
    const spy = communicationServiceSpy.setNewTime.and.returnValue(new Observable<HttpResponse<string>>((observer) => {
      observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_CREATED }));
    }))
    service.uploadNewTime(gameMode, duration, player1, gameCardId);
    expect(spy).toHaveBeenCalledWith(game);
  });

  it('uploadNewTime should reject if communicationService.setNewTime returns an error', () => {
    communicationServiceSpy.setNewTime.and.returnValue(new Observable<HttpResponse<string>>((observer) => {
      observer.next(new HttpResponse<string>({ status: consts.HTTP_BAD_REQUEST }));
    }))
    service.uploadNewTime(gameMode, duration, player1, gameCardId).catch((error) => {
      expect(error).toEqual(new Error('Error while setting new time'));
    });
  });
});
