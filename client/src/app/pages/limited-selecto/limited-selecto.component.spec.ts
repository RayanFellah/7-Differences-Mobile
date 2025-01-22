import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CommunicationService } from '@app/services/communication.service';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { GameConstantsService } from '@app/services/game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { SocketService } from '@app/services/socket.service';
import { GameCardTemplate } from '@common/game-card-template';
import { Constants } from '@common/game-classes';
import { Observable } from 'rxjs/internal/Observable';
import { LimitedTimePageComponent } from '../limited-time-page/limited-time-page.component';
import { LimitedSelectoComponent } from './limited-selecto.component';

describe('LimitedSelectoComponent', () => {
  let matDialogSpy: jasmine.SpyObj<MatDialogRef<LimitedSelectoComponent>>;
  let component: LimitedSelectoComponent;
  let fixture: ComponentFixture<LimitedSelectoComponent>;
  let communicationService: CommunicationService;
  let gameInfoService: GameInfoService;
  let gameConstantsService: GameConstantsService;
  let socketService: SocketService;
  let router: Router;
  let openDialogSpy: jasmine.Spy;

  const gameCard = new GameCardTemplate();
  const pathLimitedTime = 'limited-time';
  const routes = [
    { path: pathLimitedTime, component: LimitedTimePageComponent }
  ] as Routes;

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver', 'openDialog', 'closeAll']);

    await TestBed.configureTestingModule({
      declarations: [LimitedSelectoComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes)],
      providers: [
        CommunicationService, SocketService,
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useValue: matDialogSpy },
      ]
    }).compileComponents();

    gameInfoService = TestBed.inject(GameInfoService);
    gameConstantsService = TestBed.inject(GameConstantsService);
    const constants: Constants = { initialTime: 0, penalty: 10, timeWon: 10 };
    gameConstantsService.getConstants = jasmine.createSpy().and.returnValue(
      new Observable<HttpResponse<Constants>>((observer) => {
        observer.next(new HttpResponse<Constants>({ body: constants }));
        observer.complete();
      }),
    );
    communicationService = TestBed.inject(CommunicationService);
    communicationService.downloadGameCards = jasmine.createSpy('downloadGameCards').and.returnValue(
      new Observable((observer) => {
        observer.next({ gameCards: [gameCard] });
      }),
    );
    socketService = TestBed.inject(SocketService);
    socketService.listen = jasmine.createSpy('listen').and.returnValue(
      new Observable((observer) => {
        observer.next({
          username1: 'user1',
          username2: 'user2',
          id: 'id',
          order: [0]
        });
      }),
    );
    socketService.emit = jasmine.createSpy('emit');
    router = TestBed.inject(Router);
    router.initialNavigation();
    router.navigateByUrl = jasmine.createSpy('navigateByUrl');
    openDialogSpy = spyOn(PopupTextComponent, 'openDialog');
    fixture = TestBed.createComponent(LimitedSelectoComponent);
    component = fixture.componentInstance;
    component['socketService'] = socketService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to socketService.listen and set cardOrder in constructor', () => {
    expect(socketService.listen).toHaveBeenCalled();
    expect(component.cardOrder).toEqual([0]);
  });

  it('should call communicationService.downloadGameCards in constructor', () => {
    expect(communicationService.downloadGameCards).toHaveBeenCalled();
  });

  it('should subscribe to socketService.listen in configSockets', () => {
    component.configSockets();
    expect(socketService.listen).toHaveBeenCalled();
  });

  it('should set gameInfoService attributes in configSockets', () => {
    component.gameCards = [gameCard];
    component.nGameCards = 1;
    component.cardOrder = [0];
    component.configSockets();
    expect(gameInfoService.CoopUsername[0]).toEqual('user1');
    expect(gameInfoService.CoopUsername[1]).toEqual('user2');
    expect(gameInfoService.gameCards).toEqual([gameCard]);
    expect(gameInfoService.nGameCards).toEqual(1);
    expect(gameInfoService.cardOrder).toEqual([0]);
    expect(gameInfoService.CoopId).toEqual('id');

  });

  it('should navigate to limited-time in configSockets', () => {
    component.configSockets();
    expect(router.navigateByUrl).toHaveBeenCalledWith("/" + pathLimitedTime);
  });

  it('openDialogEnterUsernameSolo should open a dialog with startGameSolo as a callBack', () => {
    const spyCallback = spyOn(component, 'startGameSolo');
    component.openDialogEnterUsernameSolo();
    expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
  });

  it('should call openDialogWrongSolo in startGameSolo if feedback.name is empty', fakeAsync(() => {
    const spyOpenDialogWrongSolo = spyOn(component, 'openDialogWrongSolo');
    const feedback = {
      name: '',
    } as DialogFeedback;
    component.startGameSolo(feedback);
    expect(spyOpenDialogWrongSolo).toHaveBeenCalled();
  }));

  it('should set gameInfoService attributes in startGameSolo', fakeAsync(() => {
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    component.gameCards = [gameCard];
    component.nGameCards = 1;
    component.cardOrder = [0];
    component.startGameSolo(feedback);
    expect(gameInfoService.username).toEqual('test');
    expect(gameInfoService.initialTime).toEqual(0);
    expect(gameInfoService.cardOrder).toEqual([0]);
  }));

  it('should call socketService.emit in startGameSolo and navigate to limited-time', fakeAsync(() => {
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    const emitMessage = {
      username: feedback.name,
    };
    component.gameCards = [gameCard];
    component.nGameCards = 1;
    component.cardOrder = [0];
    component.startGameSolo(feedback);
    expect(socketService.emit).toHaveBeenCalledWith('startGameSolo', emitMessage);
    expect(router.navigateByUrl).toHaveBeenCalledWith("/" + pathLimitedTime);
  }));

  it('should call downloadGameCards in startGameSolo if gameCards is empty', fakeAsync(() => {
    component.downloadCards = jasmine.createSpy('downloadCards').and.callFake(() => {});
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    component.startGameSolo(feedback);
    expect(communicationService.downloadGameCards).toHaveBeenCalled();
  }));

  it('should call getOrder in startGameSolo if cardOrder is empty', fakeAsync(() => {
    component.getOrder = jasmine.createSpy('getOrder').and.callFake(() => {});
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    component.gameCards = [gameCard];
    component.nGameCards = 1;
    component.cardOrder = [];
    component.startGameSolo(feedback);
    expect(component.getOrder).toHaveBeenCalled();
  }));

  it('openDialogEnterUsernameDuo should open a dialog with joinGame as a callBack', () => {
    const spyCallback = spyOn(component, 'joinGame');
    component.openDialogEnterUsernameDuo();
    expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
  });

  it('should call openDialogWrongName in joinGame if the name is not valid', fakeAsync(() => {
    const feedback = {
      name: '',
    } as DialogFeedback;
    const spyCallback = spyOn(component, 'openDialogWrongName');
    component.joinGame(feedback);
    expect(spyCallback).toHaveBeenCalled();
  }));

  it('should call getConstants in joinGame if the name is valid', fakeAsync(() => {
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    component.joinGame(feedback);
    expect(gameConstantsService.getConstants).toHaveBeenCalled();
  }));

  it('should call socketService.emit in joinGame if the name is valid', fakeAsync(() => {
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    const emitMessage = {
      username: feedback.name,
    };
    component.joinGame(feedback);
    tick(1000);
    expect(socketService.emit).toHaveBeenCalledWith('joinGameCoop', emitMessage);
  }));

  it('should call openDialogLoad in joinGame if the name is valid', fakeAsync(() => {
    component.openDialogLoad = jasmine.createSpy('openDialogLoad').and.callFake(() => {});
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    component.joinGame(feedback);
    tick(1000);
    expect(component.openDialogLoad).toHaveBeenCalled();
  }));

  it('should set gameInfoService username in joinGame if the name is valid', fakeAsync(() => {
    const feedback = {
      name: 'test',
    } as DialogFeedback;
    component.joinGame(feedback);
    tick(1000);
    expect(gameInfoService.username).toEqual('test');
  }));


  it('should validate a name between 1 and 10 characters', fakeAsync(() => {
    const name = 'test';
    expect(component.validateName(name)).toBeTruthy();
  }));

  it('should not validate a name with more than 10 characters', fakeAsync(() => {
    const name = 'testtesttest';
    expect(component.validateName(name)).toBeFalsy();
  }));

  it('should not validate a name with less than 1 character', fakeAsync(() => {
    const name = '';
    expect(component.validateName(name)).toBeFalsy();
  }));

  it('openDialogWrongName should open a dialog with openDialogEnterUsernameDuo as a callBack', () => {
    const spyCallback = spyOn(component, 'openDialogEnterUsernameDuo');
    component.openDialogWrongName();
    expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
  });

  it('openDialogWrongSolo should open a dialog with openDialogEnterUsernameSolo as a callBack', () => {
    const spyCallback = spyOn(component, 'openDialogEnterUsernameSolo');
    component.openDialogWrongSolo();
    expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
  });

  it('openDialogLoad should open a dialog with leaveGame as a callBack', () => {
    const spyCallback = spyOn(component, 'leaveGame');
    component.openDialogLoad();
    expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
  });

  it('should emit in leaveGame', () => {
    component.leaveGame();
    expect(socketService.emit).toHaveBeenCalled();
  });

  it('shoud call downloadGameCards in downloadCards', () => {
    const gameCards = [gameCard];
    communicationService.downloadGameCards = jasmine.createSpy().and.returnValue(
      new Observable<HttpResponse<object>>((observer) => {
        observer.next(new HttpResponse<object>({ body: gameCards }));
        observer.complete();
      }),
    );
    component.downloadCards();
    expect(communicationService.downloadGameCards).toHaveBeenCalled();
  });

  it('should set gameCards and nGameCards in downloadCards', () => {
    const gameCards = [gameCard];
    communicationService.downloadGameCards = jasmine.createSpy().and.returnValue(
      new Observable<HttpResponse<object>>((observer) => {
        observer.next(new HttpResponse<object>({ body: gameCards }));
        observer.complete();
      }),
    );
    component.downloadCards();
    expect(component.gameCards).toEqual(gameCards);
    expect(component.nGameCards).toEqual(gameCards.length);
  });

  it('should subscribe to socketService in getOrder', fakeAsync(() => {
    component.getOrder();
    expect(socketService.listen).toHaveBeenCalled();
  }));
});
