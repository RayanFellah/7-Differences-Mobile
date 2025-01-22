   import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { AuthentificationService } from '@app/services/authentification.service';
import { GameConstantsService } from '@app/services/game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { SocketService } from '@app/services/socket.service';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    initialTime: number;
    penalty: number;
    timeWon: number;
    cheatMode: boolean = false;
    username: string;
    maxTime: number = 120;
    isChatVisible: boolean = false;


    constructor(private gameConstantsService: GameConstantsService, private cdr: ChangeDetectorRef, private router : Router, private socketService:SocketService, private gameInfo:GameInfoService, private authentificationService:AuthentificationService, protected ls: LanguageService,
        
     ) {}

    async ngOnInit() {
        this.authentificationService.user$.subscribe((user) => {
            if (user) {
                this.username = user.username;
            }
        });
        const constants = await this.gameConstantsService.getConstants();
        this.initialTime = constants.initialTime;
        this.penalty = constants.penalty;
        this.timeWon = constants.timeWon;

        console.log('initialTime', this.initialTime);
        console.log('penalty', this.penalty);
        console.log('timeWon', this.timeWon);
        console.log('cheatMode', this.cheatMode);
    }

    openDialogConfirmResetConstants() {
        PopupTextComponent.openDialog(
            this.gameConstantsService.dialogRef,
            {
                message: `Réinitialiser les constantes?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.confirmResetConstantsCallback,
        );
    }

    confirmResetConstantsCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') {
            const constants = this.gameConstantsService.defaultConstants();
            this.gameConstantsService.setConstants(constants);
            this.initialTime = constants.initialTime;
            this.penalty = constants.penalty;
            this.timeWon = constants.timeWon;
            this.cheatMode= constants.cheatMode;
        }
        this.gameConstantsService.dialogRef.closeAll();
    }

    

    setConstants() {
        this.gameConstantsService.setConstantsClient({
            initialTime: this.initialTime,
            penalty: this.penalty,
            timeWon: this.timeWon,
            cheatMode: this.cheatMode,
        });
        
        console.log('setConstants', this.initialTime, this.penalty, this.timeWon, this.cheatMode);
       // this.confirmCreation();
       this.createLobby();
    
    }

    createLobby = () => {

        

        console.log('---');
       // console.log(this.username);

        this.socketService.emit('createGameLimite', {
            username: this.username,
            isObserver: false,
            initialTime: this.initialTime,
            penalty: this.penalty,
            timeWon: this.timeWon,
            cheatMode: this.cheatMode,
            maxTime: this.maxTime,
            gameAccessType: this.gameInfo.gameAccessType,
        });
        this.gameInfo.username = this.username;
        this.gameInfo.isObserver = false;
        this.router.navigateByUrl('/waiting-limited');

        console.log('createGameLimite', this.username, this.initialTime, this.penalty, this.timeWon, this.cheatMode);


        // this.socketService.listen('launchLobby').subscribe((data: any) => {
        //     const constants = data as Constants; 
        //     console.log('launchLobbylistend', constants);
        //     this.applyConstantsToGameInfo(constants);
        //     this.createLobby();
        // });
    };



    toggleCheatMode(): void {
        this.cheatMode = !this.cheatMode;
        this.cdr.detectChanges();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }

    

}