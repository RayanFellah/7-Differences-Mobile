import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LobbyCommunicationService {

  private playerName: string;

  init(playerName: string) {
    this.playerName = playerName;
  }

  getPlayerName() {
    return this.playerName;
  }
}
