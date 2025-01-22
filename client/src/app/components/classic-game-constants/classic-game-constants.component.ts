import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { AuthentificationService } from '@app/services/authentification.service';
import { ClassicGameConstantsService } from '@app/services/classic-game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';
@Component({
  selector: 'app-classic-game-constants',
  templateUrl: './classic-game-constants.component.html',
  styleUrls: ['./classic-game-constants.component.scss']
})
export class ClassicGameConstantsComponent implements OnInit {

  initialTime: number;
  cheatMode: boolean = false;
  username: string;
  isChatVisible: boolean = false;

    constructor(
        private classicGameConstantsService: ClassicGameConstantsService,
        private cdr: ChangeDetectorRef,
        private authentificationService: AuthentificationService,
        private gameInfo: GameInfoService,
        private socketService: SocketService,
        private router: Router,
        protected ls: LanguageService,
    ) {}

  async ngOnInit() {
    this.authentificationService.user$.subscribe((user) => {
        if (user) {
            this.username = user.username;
        }
    });

      const constants = await this.classicGameConstantsService.getConstants();
      this.initialTime = constants.initialTime;


      console.log('initialTime', this.initialTime);
      console.log('cheatMode', this.cheatMode);
  }

  openDialogConfirmResetConstants() {
      PopupTextComponent.openDialog(
          this.classicGameConstantsService.dialogRef,
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
          const constants = this.classicGameConstantsService.defaultConstants();
          this.classicGameConstantsService.setConstants(constants);
          this.initialTime = constants.initialTime;
          this.cheatMode= constants.cheatMode;
      }
      this.classicGameConstantsService.dialogRef.closeAll();
  }

  

  setConstants() {
      this.classicGameConstantsService.setConstantsClient({
          initialTime: this.initialTime,
          cheatMode: this.cheatMode,
      });
      
      console.log('setConstants', this.initialTime, this.cheatMode);
     // this.confirmCreation();
     this.createLobby();
  }

  

  createLobby() {
    this.gameInfo.isObserver = false;
   // this.classicGameConstantsService.createGameLobby(this.username);
   this.createGameMulti(this.initialTime, this.cheatMode);
    console.log('Lobby created for:', this.username);
  }


  createGameMulti = (initialTime: number, cheatMode: boolean) => {
    console.log('createGameMulti');
        this.socketService.emit('createGameMulti', {
            gameCardId: this.gameInfo.gameCardId,
            username: this.username,
            initialTime,
            cheatMode,
            gameAccessType: this.gameInfo.gameAccessType,
        });
    console.log('createGameMulti', this.username, initialTime, cheatMode, this.gameInfo.gameCardId, this.gameInfo.gameAccessType);
    this.gameInfo.isObserver = false;
    this.router.navigate(['/lobby']);
    
}



  toggleCheatMode(): void {
      this.cheatMode = !this.cheatMode;
      this.cdr.detectChanges();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }
    

  

}
