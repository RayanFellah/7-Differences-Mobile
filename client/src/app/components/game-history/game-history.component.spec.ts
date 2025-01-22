import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { consts } from '@common/consts';
import { Observable } from 'rxjs';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { GameHistoryComponent } from './game-history.component';

describe('GameHistoricComponent', () => {
    let component: GameHistoryComponent;
    let fixture: ComponentFixture<GameHistoryComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    let openDialogSpy: jasmine.Spy;
    let feedback: DialogFeedback;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver', 'openDialog', 'closeAll']);
        openDialogSpy = spyOn(PopupTextComponent, 'openDialog');
        await TestBed.configureTestingModule({
            declarations: [GameHistoryComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(GameHistoryComponent);
        component = fixture.componentInstance;
        const event = new Event('click');
        Object.defineProperty(event, 'target', { value: document.createElement('button') });

        feedback = {
            event: event,
            name: 'test',
            radius: 3,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog when the user clicks on the reset button', () => {
        const button = fixture.nativeElement.querySelector('app-custom-button');
        const spy = spyOn(component, 'openDialogConfirmResetHistory');
        button.click();
        expect(spy).toHaveBeenCalled();
    });

    it('openDialogConfirmResetHistory should be called when the user clicks on the reset button', () => {
        const button = fixture.nativeElement.querySelector('app-custom-button');
        const spy = spyOn(component, 'openDialogConfirmResetHistory');
        button.click();
        expect(spy).toHaveBeenCalled();
    });

    it('openDialogConfirmResetHistory should open a dialog with confirmResetHistoryCallback', () => {
        const spyCallback = spyOn(component, 'confirmResetHistoryCallback');
        component.openDialogConfirmResetHistory();
        expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
    });

    it('should delete history if user clicked "Oui" button', () => {
        const button = feedback.event.target as HTMLButtonElement;
        button.innerHTML = 'Oui';
        spyOn(component, 'deleteHistory');
        component.confirmResetHistoryCallback(feedback);
        expect(component.deleteHistory).toHaveBeenCalled();
    });

    it('should not delete history if user clicked "Non" button', () => {
        const button = feedback.event.target as HTMLButtonElement;
        button.innerHTML = 'Non';
        spyOn(component, 'deleteHistory');
        component.confirmResetHistoryCallback(feedback);
        expect(component.deleteHistory).not.toHaveBeenCalled();
    });

    it('deleteHistory should call communication.deleteHistory', () => {
        const spy = spyOn(component.communication, 'deleteHistory').and.returnValue(new Observable());
        component.deleteHistory();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteHistory should open a dialog with confirmation message if deleteHistory is successful', () => {
        component.communication.deleteHistory = jasmine.createSpy('deleteHistory').and.returnValue(
            new Observable<HttpResponse<object>>((observer) => {
                observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_OK, body: [] }));
            }),
        );
        const spyCallback = spyOn(component, 'confirmDeleteHistoryCallback');
        component.deleteHistory();
        expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), {
            message: 'Historique de parties effacé',
            btnText: 'OK',
        }, spyCallback);
    });

    it('deleteHistory should open a dialog with error message if deleteHistory is not successful', () => {
        const spyCallback = spyOn(component, 'confirmDeleteHistoryCallback');
        component.communication.deleteHistory = jasmine.createSpy('deleteHistory').and.returnValue(
            new Observable<HttpResponse<object>>((observer) => {
                observer.next(new HttpResponse<object>({ status: consts.HTTP_SERVER_ERROR, body: [] }));
            }),
        );
        component.deleteHistory();
        expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), {
            message: 'Erreur lors de la suppression de l\'historique de parties',
            btnText: 'OK',
        }, spyCallback);
    });

    it('downloadHistory should call communication.getHistory', () => {
        const spy = spyOn(component.communication, 'getHistory').and.returnValue(
            new Observable<HttpResponse<object>>((observer) => {
                observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_OK, body: [] }));
            }),
        );
        component.downloadHistory();
        expect(spy).toHaveBeenCalled();
    });

    it('download history should set history', async () => {
        component.communication.getHistory = jasmine.createSpy('getHistory').and.returnValue(
            new Observable<HttpResponse<object>>((observer) => {
                observer.next(new HttpResponse<object>({ status: consts.HTTP_STATUS_OK, body: [] }));
            }),
        );
        await component.downloadHistory();
        expect(component.history).toBeDefined();
    });

    it('deleteHistory should subscribe to the deleteHistory observable', () => {
        const spy = spyOn(component.communication, 'deleteHistory').and.returnValue(new Observable());
        component.deleteHistory();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteHistory should subscribe set history to []', () => {
        spyOn(component.communication, 'deleteHistory').and.returnValue(new Observable<HttpResponse<string>>((observer) => {
            observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_OK }));
        }));
        component.deleteHistory();
        expect(component.history).toEqual([]);
    });

    it('confirmDeleteHistoryCallback should close the dialog', () => {
        spyOn(component['dialogRef'], 'closeAll');
        component.confirmDeleteHistoryCallback(feedback);
        expect(component['dialogRef'].closeAll).toHaveBeenCalled();
    });

});
