import { TestBed } from '@angular/core/testing';

import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameConstantsComponent } from '@app/components/game-constants/game-constants.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { consts } from '@common/consts';
import { Observable } from 'rxjs';
import { MatDialogMock } from './create-page.service.spec';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
  let service: GameConstantsService;
  let matDialogSpy: jasmine.SpyObj<MatDialogRef<GameConstantsService>>;
  let openDialogSpy: jasmine.Spy;
  let feedback: DialogFeedback;
  const constantsStub = {
    initialTime: 0,
    penalty: 0,
    timeWon: 0
  }

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver', 'openDialog', 'closeAll']);
    openDialogSpy = spyOn(PopupTextComponent, 'openDialog');
    await TestBed.configureTestingModule({
      declarations: [GameConstantsComponent],
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useValue: matDialogSpy },
      ],
    }).compileComponents();

    service = TestBed.inject(GameConstantsService)
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: document.createElement('button') });

    feedback = {
      event: event,
      name: 'test',
      radius: 3,
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('defaultConstants() should return default constants', () => {
    const INITIAL_TIME = 45;
    const TIME_REMOVED = 5;
    const TIME_ADDED = 2;
    const result = service.defaultConstants();
    expect(result.initialTime).toEqual(INITIAL_TIME);
    expect(result.penalty).toEqual(TIME_REMOVED);
    expect(result.timeWon).toEqual(TIME_ADDED);
  });

  it('setConstants should call communication.setConstants', async () => {
    const spy = spyOn(service['communication'], 'setConstants').and.returnValue(
      new Observable<HttpResponse<string>>((observer) => {
        observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_OK }));
      }),
    );

    await service.setConstants(constantsStub);
    expect(spy).toHaveBeenCalled();
  });

  it('setConstants should open a dialog if status is CREATED', async () => {
    service['communication'].setConstants = jasmine.createSpy('setConstants').and.returnValue(
      new Observable<HttpResponse<string>>((observer) => {
        observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_CREATED }));
      }),
    );
    await service.setConstants(constantsStub);
    expect(openDialogSpy).toHaveBeenCalled();
  });

  it('setConstants should open a dialog if status is NO_CONTENT', async () => {
    service['communication'].setConstants = jasmine.createSpy('setConstants').and.returnValue(
      new Observable<HttpResponse<string>>((observer) => {
        observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_NO_CONTENT }));
      }),
    );
    await service.setConstants(constantsStub);
    expect(openDialogSpy).toHaveBeenCalled();
  });

  it('getConstants should call communication.getConstants', async () => {
    const spy = spyOn(service['communication'], 'getConstants').and.returnValue(
      new Observable<HttpResponse<object>>((observer) => {
        observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_OK, body: [] }));
      }),
    );
    await service.getConstants();
    expect(spy).toHaveBeenCalled();
  });

  it('getconstants should return constants if status is OK', async () => {
    service['communication'].getConstants = jasmine.createSpy('getConstants').and.returnValue(
      new Observable<HttpResponse<object>>((observer) => {
        observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_OK, body: constantsStub }));
      }),
    );
    const result = await service.getConstants();
    expect(result.initialTime).toEqual(constantsStub.initialTime);
    expect(result.penalty).toEqual(constantsStub.penalty);
    expect(result.timeWon).toEqual(constantsStub.timeWon);
  });

  it('getConstants should call useDefault if status is not OK', async () => {
    const spy = spyOn(service, 'defaultConstants');
    service['communication'].getConstants = jasmine.createSpy('getConstants').and.returnValue(
      new Observable<HttpResponse<object>>((observer) => {
        observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_NO_CONTENT, body: [] }));
      }),
    );
    await service.getConstants();
    expect(spy).toHaveBeenCalled();
  });

  it('confirmSaveConstantsCallback should close all dialogs', () => {
    const spy = spyOn(service.dialogRef, 'closeAll');
    service.confirmSaveConstantsCallback(feedback);
    expect(spy).toHaveBeenCalled();
  });

});