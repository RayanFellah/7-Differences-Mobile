import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { consts } from '@common/consts';
import { Observable, Observer, Subject, takeUntil } from 'rxjs';

export enum StageLvl {
    SetRadius,
    Loading,
    ShowDifferences,
    EnterName,
}

@Component({
    selector: 'app-popup-text',
    templateUrl: './popup-text.component.html',
    styleUrls: ['./popup-text.component.scss'],
})
export class PopupTextComponent implements OnDestroy {
    private feedback: DialogFeedback;
    destroy$ = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: DialogData,
        public dialogRef: MatDialogRef<PopupTextComponent>,
    ) {

        this.dialogRef.disableClose = data.preventClose;

        this.feedback = {
            radius: consts.DEFAULT_RADIUS,
        } as DialogFeedback;

    }

    static openDialog(absDialogRef: MatDialog, data: DialogData, callback?: (feedback: DialogFeedback) => void) {
        absDialogRef.closeAll();
        const observer = {
            next: (feedback: DialogFeedback) => {
                if (callback) callback(feedback);
            },
        } as Observer<DialogFeedback>;

        data.observer = observer;
        return absDialogRef.open(PopupTextComponent, {
            data,
        });
    }

    setFeedbackRadius($event: Event) {
        const target = $event.target as HTMLInputElement;
        this.feedback.radius = parseInt(target.value, 10);
    }

    setFeedbackName($event: Event) {
        const target = $event.target as HTMLInputElement;
        this.feedback.name = target.value;
    }

    handleEvent($event: Event) {
        this.feedback.event = $event;
        this.notifyObserver();
    }

    notifyObserver() {
        const obs = new Observable<DialogFeedback>((observer) => {
            observer.next(this.feedback);
        });

        obs.pipe(takeUntil(this.destroy$)).subscribe(this.data.observer);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}
