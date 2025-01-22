import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { Constants } from '@common/game-classes';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { GameConstantsComponent } from './game-constants.component';

describe('GameConstantsComponent', () => {
    let component: GameConstantsComponent;
    let fixture: ComponentFixture<GameConstantsComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<GameConstantsComponent>>;
    let openDialogSpy: jasmine.Spy;
    let feedback: DialogFeedback;

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

        fixture = TestBed.createComponent(GameConstantsComponent);
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

    it('ngOnInit() should call getConstants()', () => {
        spyOn(component['gameConstantsService'], 'getConstants').and.returnValue(
            Promise.resolve({
                initialTime: 0,
                penalty: 0,
                timeWon: 0
            } as Constants));
        component.ngOnInit();
        expect(component['gameConstantsService'].getConstants).toHaveBeenCalled();
    });

    it('ngOnInit() should set constants', async () => {
        spyOn(component['gameConstantsService'], 'getConstants').and.returnValue(
            Promise.resolve({
                initialTime: 0,
                penalty: 0,
                timeWon: 0
            } as Constants));
        await component.ngOnInit();
        fixture.detectChanges();
        expect(component.initialTime).toEqual(0);
        expect(component.penalty).toEqual(0);
        expect(component.timeWon).toEqual(0);
    });

    it('openDialogConfirmResetConstants should open a dialog with confirmResetConstantsCallback', () => {
        const spyCallback = spyOn(component, 'confirmResetConstantsCallback');
        component.openDialogConfirmResetConstants();
        expect(openDialogSpy).toHaveBeenCalledWith(jasmine.any(MatDialogMock), jasmine.any(Object), spyCallback);
    });

    it('confirmResetConstantsCallBack() should call setConstants() if user clicked "Oui" button', () => {
        (feedback.event.target as HTMLButtonElement).innerHTML = 'Oui';
        const setConstantsSpy = spyOn(component['gameConstantsService'], 'setConstants');
        component.confirmResetConstantsCallback(feedback);
        expect(setConstantsSpy).toHaveBeenCalled();
    });

    it('confirmResetConstantsCallBack() should not call setConstants() if user clicked "Non" button', () => {
        (feedback.event.target as HTMLButtonElement).innerHTML = 'Non';
        const setConstantsSpy = spyOn(component['gameConstantsService'], 'setConstants');
        component.confirmResetConstantsCallback(feedback);
        expect(setConstantsSpy).not.toHaveBeenCalled();
    });

    it('setConstants() should call gameConstantsService.setConstants()', () => {
        const spy = spyOn(component['gameConstantsService'], 'setConstants');
        component.setConstants();
        expect(spy).toHaveBeenCalled();
    });

});
