import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { consts } from '@common/consts';

import { PopupTextComponent } from './popup-text.component';

export class MockMatDialogRef {
    open() {
        return {};
    }
}

describe('PopupTextComponent', () => {
    let component: PopupTextComponent;
    let fixture: ComponentFixture<PopupTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PopupTextComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useClass: MockMatDialogRef,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        observer: {
                            next: jasmine.createSpy('next'),
                            error: jasmine.createSpy('error'),
                            complete: jasmine.createSpy('complete'),
                        },
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PopupTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set preventClose to true', () => {
        component.data.preventClose = true;
        new PopupTextComponent(component.data, component.dialogRef);
        expect(component.dialogRef.disableClose).toBeTrue();
    });

    it('should close dialog when closeDialog is called', () => {
        component.dialogRef.close = jasmine.createSpy('close');
        component.closeDialog();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });

    it('should initialize feedback with default radius', () => {
        expect(component['feedback']).toEqual({ radius: consts.DEFAULT_RADIUS } as DialogFeedback);
    });

    it('should set feedback radius', () => {
        component.data.stage = 0;
        fixture.detectChanges();
        const inputElement = fixture.debugElement.nativeElement.querySelector('input[id="0"]');
        const event = new Event('click');
        inputElement.dispatchEvent(event);
        expect(component['feedback'].radius + '').toBe(inputElement.value);
    });

    it('should set feedback name', () => {
        component.data.stage = 3;
        fixture.detectChanges();
        const inputElement = fixture.debugElement.nativeElement.querySelector('input[id="name"]');
        inputElement.value = 'test name';
        const event = new Event('change');
        inputElement.dispatchEvent(event);
        expect(component['feedback'].name).toBe(inputElement.value);
    });

    it('handleEvent should define the data event and notify the observer', () => {
        const spy = spyOn(component, 'notifyObserver');
        const event = new Event('click');

        component.data.btnText = 'test';
        fixture.detectChanges();

        const buttonElement = fixture.debugElement.nativeElement.querySelector('button');
        buttonElement.dispatchEvent(event);

        expect(component['feedback'].event).toEqual(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should notify observers with feedback', () => {
        component.notifyObserver();
        expect(component.data.observer.next).toHaveBeenCalledWith(component['feedback']);
    });

    describe('openDialog test', () => {
        let absDialogRef: jasmine.SpyObj<MatDialog>;

        beforeEach(() => {
            absDialogRef = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
        });

        it('should close all dialogs', () => {
            PopupTextComponent.openDialog(absDialogRef, {} as DialogData);
            expect(absDialogRef.closeAll).toHaveBeenCalled();
        });

        it('should open a modal dialog', () => {
            PopupTextComponent.openDialog(absDialogRef, {} as DialogData);
            expect(absDialogRef.open).toHaveBeenCalled();
        });

        it('should pass data to dialog', () => {
            const data = { message: 'Test' } as DialogData;
            PopupTextComponent.openDialog(absDialogRef, data);
            expect(absDialogRef.open).toHaveBeenCalledWith(PopupTextComponent, { data: { message: 'Test', observer: jasmine.any(Object) } });
        });

        it('should instantiate an observer', () => {
            const data = {} as DialogData;
            PopupTextComponent.openDialog(absDialogRef, data);
            expect(data.observer).not.toBeUndefined();
        });

        it('should call the callback when notified', () => {
            const data = {} as DialogData;
            const callBack = jasmine.createSpy('callback');

            PopupTextComponent.openDialog(absDialogRef, data, callBack);

            const feedback = {} as DialogFeedback;
            data.observer.next(feedback);

            expect(callBack).toHaveBeenCalledWith(feedback);
        });
    });
});
