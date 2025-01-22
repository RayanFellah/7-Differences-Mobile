import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-popup-select-lobby',
  templateUrl: './popup-select-lobby.component.html',
  styleUrls: ['./popup-select-lobby.component.scss']
})
export class PopupSelectLobbyComponent implements OnInit {
  @Input() lobbies: any = [];
  @Output() lobbySelected = new EventEmitter<any>();

  constructor() {}

  joinLobby(gameId: string) {
    // Send a socket request to join the lobby with the gameId
    console.log('lobbies  ', this.lobbies);
    console.log('Joining lobby with gameId:', gameId);
    this.lobbySelected.emit(gameId);

  }

  ngOnInit(): void {
  }

}
