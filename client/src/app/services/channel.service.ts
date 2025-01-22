import { Injectable } from '@angular/core';
import { Chat } from '@common/chat';
import { Message } from '@common/message';
import { Observable, map, tap } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})

export class ChannelService {

  // private mutedPlayers: Set<string> = new Set();

  mutedPlayers: string[] = [];
  mutedPlayersPerChannel: { [channelName: string]: string[] } = {};

  channelList: Chat[] = [];


  constructor(public socketService: SocketService) {
    this.getChannelList();
    this.handleMuteEvents();

  }

  getChannelList(): Observable<Chat[]> {
    this.socketService.emit('getChatList', {});
    return this.socketService.listen('updatedChatList').pipe(
      map(data => data as Chat[])
    );

    // this.channelList = this.channelList;
  }

  // my channels & join logique 
  joinChannel(username: string, channelName: string) {
    this.socketService.emit('joinChannel', { username, channelName });
  }

  getMyChannels(username: string): Observable<Chat[]> {
    this.socketService.emit('getMyChannels', { username });
    return this.socketService.listen('updatedMyChannels').pipe(
      map(data => data as Chat[])
    );
  }

  // listenForChannels(): void {
  //   this.socketService.listen('updateChatList').subscribe((data: any) => {
  //     const channels: Chat[] = data as Chat[];
  //     this.channelList = channels;
  //   });
  // }

  createChannel(channelName: string, creator: string) {
    const trimmedName = channelName.trim().toLowerCase(); 
    const nameExists = this.channelList.some(channel => 
        channel.name.toLowerCase() === trimmedName 
    );


    if (!trimmedName) {
      console.error('Le nom du canal ne peut pas être vide.');
      return;
    }

    if (nameExists) { // need to be fixed
      console.error('Un canal avec ce nom existe déjà.');
      return;
    }
    

    this.socketService.emit('createChat', {
      name: trimmedName, creatorName: creator, history: [
        {
          sender: 'SYSTEM',
          body: `Welcome to the ${trimmedName} chat!`,
          senderType: 0,
          time: Message.currentTime(),
        }
      ],
      playersInChat: [creator]
    });
    this.channelList.push({
      name: trimmedName, creatorName: creator,
      history: [
        {
          sender: 'SYSTEM',
          body: `Welcome to the ${trimmedName} chat!`,
          senderType: 0,
          time: Message.currentTime(),
          avatar: ''

        }
      ],
      playersInChat: [creator]
    });
  }


  selectChannel(channelName: string) {
    // this.socketService.emit('getSingleChat', channelName);
    this.socketService.emit('getChatHistory', channelName);

  }

  leaveChannel(channelName: string, username: string): Observable<any> {
    this.socketService.emit('leaveChannel', { channelName, username });
    return this.getMyChannels(username);
  }



  deleteChannel(channelName: string, username: string) {
    this.socketService.emit('deleteChannel', channelName);
    return this.getChannelList();
  }


  sendMessage(channelName: string, sender: string, messageContent: string): void {
    const message = new Message(messageContent, sender);
    this.socketService.emitGeneralChat(message, channelName);
  }

  private handleMuteEvents(): void {
    this.socketService.listen('playerMuted').subscribe(({ player }: any) => {
      //this.mutedPlayers.push(player);
    });

    this.socketService.listen('playerUnmuted').subscribe(({ player }: any) => {
      // this.mutedPlayers.filter(player);
      console.log('table apres UNMUTE from channelService', this.mutedPlayersPerChannel);

    });
  }



  mutePlayer(username: string, channelName: string, playerToMute: string): void {
    if (!this.mutedPlayersPerChannel[channelName]) {
      this.mutedPlayersPerChannel[channelName] = [];
    }
    this.socketService.emit('mutePlayerInChannel', { username, channelName, playerToMute });

    this.mutedPlayersPerChannel[channelName].push(playerToMute);

  }

  unmutePlayer(username: string, channelName: string, playerToUnmute: string): void {
    this.socketService.emit('unmutePlayerInChannel', { username, channelName, playerToUnmute });
    this.mutedPlayersPerChannel[channelName] = this.mutedPlayersPerChannel[channelName]?.filter(player => player !== playerToUnmute);

  }

  isPlayerMuted(player: string, channelName: string): boolean {
    return this.mutedPlayersPerChannel[channelName]?.includes(player) ?? false;
  }

  getMutedPlayersList(): string[] {
    return Array.from(this.mutedPlayers);
  }



  requestMutedPlayersInChannel(username: string): Observable<{ [channelName: string]: string[] }> {
    this.socketService.emit('getMutedPlayersInChannel', { username });
    return this.socketService.listen<{ [channelName: string]: string[] }>('mutedPlayersPerChannelResponse').pipe(
      tap((mutedPlayersPerChannel) => {
        this.mutedPlayersPerChannel = mutedPlayersPerChannel;
       // console.log('fromservice muted', this.mutedPlayersPerChannel);
      })
    );
}

  requestMutedPlayers(username: string): Observable<string[]> {
    this.socketService.emit('getMutedPlayers', { username });
    return this.socketService.listen<string[]>('updateMutedPlayers').pipe(
      tap((mutedPlayers: string[]) => {
        this.mutedPlayers = mutedPlayers;
      })
    );
  }

 



}

