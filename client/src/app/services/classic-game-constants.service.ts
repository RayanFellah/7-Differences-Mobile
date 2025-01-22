import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { consts } from '@common/consts';
import { ClassicConstants } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from './communication.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ClassicGameConstantsService {

  destroy$ = new Subject<any>();
  
  initialTime: number = consts.DEFAULT_INITIAL_TIME;
  cheatMode: boolean = consts.DEFAULT_CHEAT_MODE;


  constructor(private communication: CommunicationService, readonly dialogRef: MatDialog, private socketService: SocketService ) {}

  async getConstants(): Promise<ClassicConstants> {
    return new Promise<ClassicConstants>((resolve, reject) => {
      const res = this.communication.getConstants();
      res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.status === consts.HTTP_STATUS_OK) {
          const classicConstants = response.body as ClassicConstants;
          resolve(classicConstants);
        } else {
          resolve(this.defaultConstants());
        }
      }, reject);
    });
  }

  defaultConstants(): ClassicConstants {
    return {
      initialTime: consts.DEFAULT_INITIAL_TIME,
      cheatMode: consts.DEFAULT_CHEAT_MODE,
    }
  }

  setConstantsClient(classicConstants: ClassicConstants) {
    this.initialTime = classicConstants.initialTime;
    this.cheatMode = classicConstants.cheatMode;

  }

  createGameLobby(username: string): void {
    this.socketService.emit('requestCreateGameMulti', {
      username: username,
      initialTime: this.initialTime,
      cheatMode: this.cheatMode
    });
    console.log('requestmultigame emiited from service');
  }



  async setConstants(classicConstants: ClassicConstants) {
    const res = this.communication.setClassicConstants(classicConstants);
    res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response.status === consts.HTTP_STATUS_CREATED) {
         PopupTextComponent.openDialog(this.dialogRef, {
          message: 'Constantes mises à jour',
          btnText: 'OK',
        } as DialogData,
          this.confirmSaveConstantsCallback,
        )
        console.log('setConstantsfromservice', classicConstants);

        this.launchLobby(classicConstants);

      } else {
        PopupTextComponent.openDialog(this.dialogRef, {
          message: 'Erreur lors de la mise à jour des constantes',
          btnText: 'OK',
        } as DialogData,
          this.confirmSaveConstantsCallback,
        );
      }
    });


  }
  confirmSaveConstantsCallback = (feedback: DialogFeedback) => {
    this.dialogRef.closeAll();
    
    
  }

  launchLobby(classicConstants: ClassicConstants){
    //return constants;
    console.log('launchLobbyfromservice', classicConstants);
    
    this.socketService.emit('launchLobby', classicConstants);
  }

  ngOnDestroy() {
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }
}
