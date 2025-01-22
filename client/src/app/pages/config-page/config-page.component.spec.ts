import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomButtonComponent } from '@app/components/custom-button/custom-button.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { consts } from '@common/consts';
import { Observable } from 'rxjs';
import { ConfigPageComponent } from './config-page.component';

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    let openDialogSpy: jasmine.Spy;
    let feedback: DialogFeedback;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver', 'openDialog', 'closeAll']);
        openDialogSpy = spyOn(PopupTextComponent, 'openDialog');
        await TestBed.configureTestingModule({
            declarations: [ConfigPageComponent, CustomButtonComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigPageComponent);
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

    it('should have the correct routerLinks for the buttons in the buttons-list section', () => {
        const buttons = fixture.debugElement.queryAll(By.css('.top-bar app-custom-button'));
        expect(buttons[0].nativeElement.getAttribute('routerlink')).toEqual('/');
        expect(buttons[1].nativeElement.getAttribute('routerlink')).toEqual('/config');
        expect(buttons[2].nativeElement.getAttribute('routerlink')).toEqual('/config/create-sheet');
        expect(buttons[3].nativeElement.getAttribute('routerlink')).toEqual('/config/game-constants');
        expect(buttons[4].nativeElement.getAttribute('routerlink')).toEqual('/config/game-history');
    });

    it('openDialogConfirmResetAllBestTimes should call openDialog', () => {
        component.openDialogConfirmResetAllBestTimes();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('openDialogConfirmResetAllBestTimes should open a dialog with confirmResetAllBestTimesCallback', () => {
        const spyCallback = spyOn(component, 'confirmResetAllBestTimesCallback');
        component.openDialogConfirmResetAllBestTimes();
        expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
    });

    it('should delete history if user clicked "Oui" button', () => {
        const button = feedback.event.target as HTMLButtonElement;
        button.innerHTML = 'Oui';
        spyOn(component, 'resetAllBestTimes');
        component.confirmResetAllBestTimesCallback(feedback);
        expect(component.resetAllBestTimes).toHaveBeenCalled();
    });

    it('should not delete history if user clicked "Non" button', () => {
        const button = feedback.event.target as HTMLButtonElement;
        button.innerHTML = 'Non';
        spyOn(component, 'resetAllBestTimes');
        component.confirmResetAllBestTimesCallback(feedback);
        expect(component.resetAllBestTimes).not.toHaveBeenCalled();
    });

    it('resetAllBestTimes should call communication.resetAllBestTimes', () => {
        const spy = spyOn(component.communication, 'resetAllBestTimes').and.returnValue(new Observable<HttpResponse<string>>((observer) => {
            observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_OK }));
        }));
        component.resetAllBestTimes();
        expect(spy).toHaveBeenCalled();
    });

    it('openDialogConfirmDeleteAllCards should call openDialog', () => {
        component.openDialogConfirmDeleteAllCards();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('openDialogConfirmDeleteAllCards should open a dialog with confirmDeleteAllCardsCallback', () => {
        const spyCallback = spyOn(component, 'confirmDeleteAllCardsCallback');
        component.openDialogConfirmDeleteAllCards();
        expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
    });

    it('should delete cards if user clicked "Oui" button', () => {
        const button = feedback.event.target as HTMLButtonElement;
        button.innerHTML = 'Oui';
        spyOn(component, 'deleteAllCards');
        component.confirmDeleteAllCardsCallback(feedback);
        expect(component.deleteAllCards).toHaveBeenCalled();
    });

    it('should not delete cards if user clicked "Non" button', () => {
        const button = feedback.event.target as HTMLButtonElement;
        button.innerHTML = 'Non';
        spyOn(component, 'deleteAllCards');
        component.confirmDeleteAllCardsCallback(feedback);
        expect(component.deleteAllCards).not.toHaveBeenCalled();
    });

    it('deleteAllCards should call communication.deleteAllCards', () => {
        const spy = spyOn(component.communication, 'deleteAllCards').and.returnValue(new Observable<HttpResponse<string>>((observer) => {
            observer.next(new HttpResponse<string>({ status: consts.HTTP_STATUS_OK }));
        }));
        component.deleteAllCards();
        expect(spy).toHaveBeenCalled();
    });
});
