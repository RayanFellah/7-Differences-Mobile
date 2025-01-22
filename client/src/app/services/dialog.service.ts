import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { PopupTextComponent, StageLvl } from "@app/components/popup-text/popup-text.component";
import { DialogData } from "@app/interfaces/dialog-data";
import { DialogFeedback } from "@app/interfaces/dialog-feedback";
import { CreatePageService } from "./create-page.service";
import { GameCreationToolsService } from "./game-creation-tools.service";
import { SocketService } from "./socket.service";

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    resetCanvasId: number;
    router: Router;
    constructor(
        private readonly dialogRef: MatDialog,
        private readonly createPageService: CreatePageService,
        public gameCreationToolsService: GameCreationToolsService,
        private readonly socketService: SocketService,
    ) {}

    openDialogWrongFormat() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: "<h2>Mauvais format!</h2> L'image doit être de format .bmp 640x480",
                btnFileText: 'Réessayer',
            } as DialogData,
            this.wrongFormatCallback,
        );
    }

    openDialogReinit(event: Event) {
        const elem = event.target as HTMLButtonElement;
        this.resetCanvasId = parseInt(elem.id, 10);

        const zone =
            this.resetCanvasId === 0 ? "l'image originale" : this.resetCanvasId === 1 ? "l'image modifiée" : "l'image originale et l'image modifiée";

        PopupTextComponent.openDialog(
            this.dialogRef,
            { message: `<h2>Êtes-vous sur de vouloir réinitialiser ${zone}?</h2`, btnText: 'Réinitialiser' } as DialogData,
            this.reinitCallback,
        );
    }

    openDialogConfirm() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            { btnText: 'Suivant', stage: StageLvl.SetRadius } as DialogData,
            this.confirmCallback,
        );
    }

    openDialogDifferences(img: string) {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: '<h2>Voici les différences détectées</h2>',
                differencesImg: img,
                nbDifferences: this.createPageService.game.differences.length,
                btnText: 'Suivant',
                stage: StageLvl.ShowDifferences,
            } as DialogData,
            this.differencesCallback,
        );
    }

    openDialogCreateGame() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            { message: 'Nommez votre jeu.', btnText: 'Créer', stage: StageLvl.EnterName } as DialogData,
            this.createGameCallback,
        );
    }

    openDialogLoad() {
        PopupTextComponent.openDialog(this.dialogRef, { stage: StageLvl.Loading } as DialogData);
    }

    openDialogNotify(message: string) {
        PopupTextComponent.openDialog(this.dialogRef, { message } as DialogData);
    }

    confirmCallback = async (feedback: DialogFeedback) => {
        console.log('clbk1');
        const canvasTempLeft = this.createPageService.combineLeftImage();
        const canvasTempRight = this.createPageService.combineRightImage();
        console.log('clbk2');

        localStorage.setItem('img1', canvasTempLeft.toDataURL().replace('data:image/png;base64,', ''));
        localStorage.setItem('img2', canvasTempRight.toDataURL().replace('data:image/png;base64,', ''));
        console.log('clbk3');
        this.createPageService.radius = feedback.radius;
        this.openDialogLoad();
        console.log('clbk3');
        await this.createPageService.detection(canvasTempLeft, canvasTempRight)
            .then((imgUrl: string) => {
                this.openDialogDifferences(imgUrl);
            })
            .catch((error: string) => {
                this.openDialogNotify(error);
            });
    };

    wrongFormatCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLInputElement;
        const files = res.files as FileList;
        this.gameCreationToolsService.imageToStorage(this.gameCreationToolsService.lastUpload, files[0]);
        this.dialogRef.closeAll();
    };

    reinitCallback = () => {
        this.gameCreationToolsService.clearCanvas(this.resetCanvasId);
        this.dialogRef.closeAll();
    };

    differencesCallback = () => {
        this.openDialogCreateGame();
    };

    createGameCallback = async (feedback: DialogFeedback) => {
        if (!feedback.name) {
            this.openDialogCreateGame();
        } else {
            this.createPageService.game.name = feedback.name;

            this.openDialogLoad();
            await this.createPageService.uploadGame()
                .then(async () => {
                    this.openDialogNotify(`<h2>Le jeu ${this.createPageService.game.name} a été créé!</h2>`);
                    this.socketService.emit('gameCardsModified', null);
                    this.redirectToConfig();
                })
                .catch(() => {
                    this.openDialogNotify('<h2>Erreur lors de la création du jeu!</h2> Essayez à nouveau');
                });
        }
    };

    redirectToConfig() {
        this.router.navigate(['/config']);
    }
}