import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CommunicationService } from '@app/services/communication.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';
import { consts } from '@common/consts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnDestroy {
    destroy$ = new Subject<any>();
    isChatVisible : boolean = false;

    constructor(
        readonly communication: CommunicationService,
        readonly dialogRef: MatDialog,
        readonly socketService: SocketService,
        public router: Router,
        protected ls: LanguageService,
    ) {}

    openDialogConfirmDeleteAllCards() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: this.ls.translate('Supprimer toutes les fiches?', 'Delete all cards?'),
                btnText: this.ls.translate('Non', 'No'),
                btnText2: this.ls.translate('Oui', 'Yes'),
            } as DialogData,
            this.confirmDeleteAllCardsCallback,
        );
    }

    confirmDeleteAllCardsCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.id === 'button1') {
            this.deleteAllCards();
        }
        this.dialogRef.closeAll();
    };

    deleteAllCards() {
        const res = this.communication.deleteAllCards();
        res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response.status === consts.HTTP_STATUS_OK) this.socketService.emit('gameCardsDeleted', null);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }
    
}
