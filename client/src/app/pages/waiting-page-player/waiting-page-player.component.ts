import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { MatDialog } from '@angular/material/dialog';
//import { Router } from '@angular/router';
import { GameInfoService } from '@app/services/game-info.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';

@Component({
  selector: 'app-waiting-page-player',
  templateUrl: './waiting-page-player.component.html',
  styleUrls: ['./waiting-page-player.component.scss']
})
export class WaitingPagePlayerComponent implements OnInit {
  gameName: string | undefined;
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
  isChatVisible: boolean = false;
 
  constructor(public gameInfo: GameInfoService,
    private socketService: SocketService,
   
    private router: Router,
    protected ls: LanguageService,
     /*
    private dialogRef: MatDialog
    */) { }

  ngOnInit(): void {
    this.player1Name = '';
    this.player2Name = '';
    this.player3Name = '';
    this.player4Name = '';
    this.gameName = this.gameInfo.gameName;
    this.socketService.listen('creatorLeft').subscribe((data) => {
      console.log('creatorLeft',data);
      if(this.gameInfo.isClassic){
        this.router.navigate(['/selecto']);
      }else{

        this.router.navigate(['/limited-selecto']);
      }
    });



    this.socketService.listen('players').subscribe((data: any) => {
      console.log(data);
  
      if(data.length ==1){
          this.player1Name = data[0].name;
          this.player2Name = '';
          this.player3Name = '';
          this.player4Name = '';
        }


        if(data.length ==2){
          this.player1Name = data[0].name;
          this.player2Name = data[1].name;

          this.player3Name = '';
          this.player4Name = '';
        }
        if(data.length ==3){
          this.player1Name = data[0].name;
          this.player2Name = data[1].name;
          this.player3Name = data[2].name;
       
          this.player4Name = '';
        }
        if(data.length ==4){
          this.player1Name = data[0].name;
          this.player2Name = data[1].name;
          this.player3Name = data[2].name;
          this.player4Name = data[3].name;
        }
  
    });
    this.socketService.listen('newPlayer').subscribe((data: any) => {
      /*
     if(!this.player3Name){
      this.player3Name = data.username;
     }else if(!this.player4Name){
      this.player4Name = data.username;
     }
     */
      this.getPlayers();




    });
    this.socketService.listen('startGame').subscribe({
      next: (data: any) => {
        console.log('startGame',data);

      
              this.router.navigateByUrl('/game1v1');
         
      }
  });



    this.socketService.listen('startGameLimite').subscribe(() => {
      this.router.navigate(['/limited-time']);

    });
    this.getPlayers();

    this.socketService.listen('kick').subscribe((data:any) => {
      console.log(data.message,'pour le joueur',data.playerName);
      if(data.playerName == this.gameName){
        this.router.navigate(['/selecto']);
      }
    });

  }
 


  getPlayers = () => {
    this.socketService.emit('getPlayers', this.gameName);
    
  }

  leaveLobby = () => {
    this.socketService.emit('leaveLobby', this.gameName);
   


  };

  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
}

  /*

  transferImage = () => {
    this.imageTransfer.link1 = this.img1URL;
    this.imageTransfer.link2 = this.img2URL;
    this.imageTransfer.img1 = this.img1;
    this.imageTransfer.img2 = this.img2;

    this.imageTransfer.diff = this.gameCard.differences;
};
*/

}
