import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CommunicationService } from '@app/services/communication.service';
import { consts } from '@common/consts';
import { GameEnded } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';
import { PopupTextComponent } from '../popup-text/popup-text.component';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnDestroy {

    history: GameEnded[];
    destroy$ = new Subject();
    constructor(public communication: CommunicationService, readonly dialogRef: MatDialog) {}

    async ngOnInit() {
        await this.downloadHistory();
    }

    async downloadHistory() {
        const res = this.communication.getHistory();
        res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response.status === consts.HTTP_STATUS_OK) {
                const history = response.body as GameEnded[];
                this.history = history.reverse();
            }
        });
    }
    openDialogConfirmResetHistory() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: `Réinitialiser l'historique de parties?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.confirmResetHistoryCallback,
        );
    }

    confirmResetHistoryCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') {
            this.deleteHistory();
        }
        this.dialogRef.closeAll();
    }

    async deleteHistory() {
        const res = this.communication.deleteHistory();
        res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response.status === consts.HTTP_STATUS_OK) {
                this.history = [];
                PopupTextComponent.openDialog(this.dialogRef, {
                    message: 'Historique de parties effacé',
                    btnText: 'OK',
                } as DialogData,
                    this.confirmDeleteHistoryCallback,
                )
            } else {
                PopupTextComponent.openDialog(this.dialogRef, {
                    message: 'Erreur lors de la suppression de l\'historique de parties',
                    btnText: 'OK',
                } as DialogData,
                    this.confirmDeleteHistoryCallback,
                );
            }
        });
    }

    confirmDeleteHistoryCallback = (feedback: DialogFeedback) => {
        this.dialogRef.closeAll();
    }

    ngOnDestroy() {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}
