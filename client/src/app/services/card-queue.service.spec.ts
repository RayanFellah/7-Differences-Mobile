import { HttpClient, HttpHandler, HttpResponse } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { GameCardTemplate } from '@common/game-card-template';
import { Observable } from 'rxjs/internal/Observable';
import { CardQueueService } from './card-queue.service';
import { CommunicationService } from './communication.service';
import { MatDialogMock } from './create-page.service.spec';
import { GameInfoService } from './game-info.service';
import { SocketService } from './socket.service';

describe('CardQueueService', () => {
  let service: CardQueueService;
  let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
  let communicationService: CommunicationService;
  let gameInfoService: GameInfoService;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
    TestBed.configureTestingModule({
      providers: [
        CommunicationService, SocketService,
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useValue: matDialogSpy },
        HttpClient,
        HttpHandler
      ],
    });
    gameInfoService = TestBed.inject(GameInfoService);
    gameInfoService.gameCards = [new GameCardTemplate()];
    gameInfoService.nGameCards = 1;
    gameInfoService.cardOrder = [0];
    communicationService = TestBed.inject(CommunicationService);
    service = TestBed.inject(CardQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set cardOrder, nGameCards and gameCards with values in gameInfoService in the constructor ', () => {
    expect(service.cardOrder).toEqual(gameInfoService.cardOrder);
    expect(service.nGameCards).toEqual(gameInfoService.nGameCards);
    expect(service.gameCards).toEqual(gameInfoService.gameCards);
  });

  it('should update gameEnded if current is greater or equal than nGameCards in getNext', fakeAsync(() => {
    service['current'] = 1;
    service.nGameCards = 1;
    service.getNext();
    expect(service.gameEnded.value).toBe(true);
  }));

  it('should call pullUrl if current is less than nGameCards in getNext', fakeAsync(() => {
    service.pullUrl = jasmine.createSpy().and.returnValue(new Promise<void>((resolve) => {
      resolve();
    }));
    service.cardOrder = [0];
    service.current = 0;
    service.nGameCards = 1;
    service.getNext();
    expect(service.pullUrl).toHaveBeenCalled();
  }));

  it('should call downloadImage twice and not update img1 and img2 if downloadImage was not successfull in pullUrl', fakeAsync(() => {
    communicationService.downloadImage = jasmine.createSpy().and.returnValue(
      new Observable<HttpResponse<object>>((observer) => {
        observer.next(new HttpResponse<object>({ body: undefined }));
        observer.complete();
      }),
    );
    const img1ID = '1';
    const img2ID = '2';
    service.pullUrl(img1ID, img2ID);
    expect(communicationService.downloadImage).toHaveBeenCalledTimes(2);
  }));

  it('should update img1 and img2 in pullUrl if downloadImage was successfull', fakeAsync(() => {
    communicationService.downloadImage = jasmine.createSpy().and.returnValue(
      new Observable<HttpResponse<string>>((observer) => {
        observer.next(new HttpResponse<string>({ body: 'test' }));
        observer.complete();
      }),
    );
    const img1ID = '1';
    const img2ID = '2';
    service.pullUrl(img1ID, img2ID);
    expect(service.leftImage.value).toBe('data:image/bmp;base64,test');
    expect(service.rightImage.value).toBe('data:image/bmp;base64,test');
  }));
});
