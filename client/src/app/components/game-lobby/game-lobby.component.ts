import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Game } from '@common/game'; // Assurez-vous que le chemin d'importation est correct
import { Subject } from 'rxjs';

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss']
})
export class GameLobbyComponent implements OnInit, OnDestroy {

  games: Game[]; // Assurez-vous que les jeux sont initialisés correctement, soit ici, soit dans ngOnInit
  selectedGame: Game | null = null; // Initialisez à null
  destroy$ = new Subject<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Utilisez le type approprié pour `data`
    public dialogRef: MatDialogRef<GameLobbyComponent>, // Assurez-vous que le type est correct
  ) {
    this.games = data.games; // Supposons que les jeux sont passés via `data`
    this.dialogRef.disableClose = data.preventClose; // ou initialisez vos jeux ici si nécessaire
  }

  ngOnInit(): void {
    // Initialisation ici si vos données de jeux viennent d'un service par exemple
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  selectGame(game: Game): void {
    this.selectedGame = game;
  }
}
