import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';
import { ChannelService } from '@app/services/channel.service';
import { LanguageService } from '@app/services/language.service';
import { MultiWindowService } from '@app/services/multi-window.service';
import { SocketService } from '@app/services/socket.service';
import { WidgetStateService } from '@app/services/widget-state.service';
import { Chat } from '@common/chat';
import { IUser } from '@common/user';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-channel-widget',
    templateUrl: './channel-widget.component.html',
    styleUrls: ['./channel-widget.component.scss'],
})
export class ChannelWidgetComponent implements OnInit, OnDestroy {
    @Input() enabled: boolean = false;
    state: 'fullscreen' | 'integrated-opened' | 'game-mode' | 'integrated-closed' = 'integrated-closed';
    subMenuIndex: number | null = null;
    searchTerm: string = '';
    channelList: Chat[] = [];
    myChannelList: Chat[] = [];
    filteredChannelList: Chat[] = [];
    myFilteredChannelList: Chat[] = [];
    showCreateChannelInput: boolean = false; // need to be developped
    selectedChannel: any = null;
    showPlayerList: boolean = false;
    muteStates: { [playerName: string]: boolean } = {};
    mutedPlayers: string[] = [];
    currentUser: IUser | null;
    channelDisplay: boolean = true;
    mutedPlayersPerChannel: { [channelName: string]: string[] } = {};
    isDraggable: boolean = false;
    isVisible: boolean = true;
    isGameMode = false;
    private subscriptions: Subscription = new Subscription();
    private destroy$ = new Subject<void>();




    constructor(
        public socketService: SocketService,
        public channelService: ChannelService,
        public authentificationService: AuthentificationService,
        protected readonly languageService: LanguageService,
        public mws: MultiWindowService,
        public widgetStateService: WidgetStateService
    ) {}

    ngOnInit(): void {
        this.authentificationService.user$.subscribe((user: IUser | null) => {
            this.currentUser = user;
            this.loadChannels();
            this.loadMutedPlayersInChannel();
        });

    this.subscriptions.add(this.socketService.listen('updateChannelList').subscribe(() => {
      this.loadChannels();
    //   this.highlightGameChannels();
    //   this.loadMutedPlayersInChannel();

     }));
    // // this.loadChannels();
    // // this.loadMutedPlayersInChannel();


    // this.subscriptions.add(this.socketService.listen('updateMyChannels').subscribe(() => {
    //   this.channelService.getMyChannels(this.currentUser!.username).subscribe((chatList: Chat[]) => {
    //     this.myChannelList = chatList;
    //     this.myFilteredChannelList = this.myChannelList;
    //     this.highlightGameChannels();
    //   });
    //   this.mutedPlayers = this.channelService.mutedPlayers
    // }));

        this.mws.triggerParentRebuild.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.loadChannels();
            this.loadMutedPlayersInChannel();
        });
        this.loadChannels();
        this.loadMutedPlayersInChannel();
        // this.channelService.getChannelList();
        // this.channelList = this.channelService.channelList;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.subscriptions.unsubscribe();
    }

  loadChannels() {
    this.subscriptions.add(this.channelService.getChannelList().subscribe((chatList: Chat[]) => {
      this.channelList = chatList;
      this.filteredChannelList = this.channelList;
    }));
    this.subscriptions.add(this.channelService.getMyChannels(this.currentUser!.username).subscribe((chatList: Chat[]) => {
      this.myChannelList = chatList;
      this.myFilteredChannelList = this.myChannelList;
      this.highlightGameChannels();
      this.loadMutedPlayersInChannel();
      this.mutedPlayers = this.channelService.mutedPlayers
    }));
   // this.mutedPlayers = this.channelService.mutedPlayers
    // this.filteredChannelList = this.channelList;
    // this.myFilteredChannelList = this.myChannelList;
  }

    // exit  button
    toggleSubMenu(index: number) {
        this.subMenuIndex = this.subMenuIndex === index ? null : index;
    }

    // join maybe need to be reverse // no need to reverse but need to fix problem related to the chatnameLIst --> ChannelSANdMuted 
    joinChannel(channelName: string) {
        this.channelService.joinChannel(this.currentUser!.username, channelName);
    }

    createChannel(channelName: string) {
        this.channelService.createChannel(channelName, this.currentUser!.username);
    }

    selectChannel(channelName: string) {
        this.channelService.selectChannel(channelName);
        this.selectedChannel = channelName;
        const event = new CustomEvent('open-chat', { detail: channelName });
        window.dispatchEvent(event);
        this.channelDisplay = false;
    }

    leaveChannel(channelName: string) {
        this.channelService.leaveChannel(channelName, this.currentUser!.username).subscribe(() => {
            this.myChannelList = this.myChannelList.filter(channel => channel.name !== channelName);
            this.subMenuIndex = null;
        });
    }

    deleteChannel(channelName: string) {
        this.channelService.deleteChannel(channelName, this.currentUser!.username).subscribe(() => {
            this.channelList = this.channelList.filter(channel => channel.name !== channelName);
            this.subMenuIndex = null;
        });
    }

    filterChannels() {
        if (!this.searchTerm) {
            this.filteredChannelList = this.channelList;
            this.myFilteredChannelList = this.myChannelList;
            this.highlightGameChannels();
        } else {
            this.filteredChannelList = this.channelList.filter(channel =>
                channel.name.toLowerCase().startsWith(this.searchTerm.toLowerCase())
            );
            this.myFilteredChannelList = this.myChannelList.filter(channel =>
                channel.name.toLowerCase().startsWith(this.searchTerm.toLowerCase())
            );

            this.myFilteredChannelList = this.myFilteredChannelList.filter(channel => !this.isGameChannel(channel.name));
            // const filteredGameChannels = this.myChannelList.filter(channel =>
            //   this.isGameChannel(channel.name) && channel.name.toLowerCase().startsWith(this.searchTerm.toLowerCase()));
            // const filteredOtherChannels = this.myChannelList.filter(channel =>
            //   !this.isGameChannel(channel.name) && channel.name.toLowerCase().startsWith(this.searchTerm.toLowerCase()));

            // this.myFilteredChannelList = [...filteredGameChannels, ...filteredOtherChannels];
            // this.filteredChannelList = [...filteredOtherChannels]; 
        }
    }

    resetSearch() {
        this.searchTerm = '';
        this.filterChannels();
    }

    isChannelJoined(channelName: string): boolean {
        return this.myChannelList.some(channel => channel.name === channelName);
    }


    showPlayers() {
        //this.selectedChannel = channelName;
        this.showPlayerList = !this.showPlayerList;
        // if (this.showPlayerList) {
        //     this.channelService.requestMutedPlayers(this.currentUser!.username).subscribe(mutedPlayers => {
        //         this.mutedPlayers = mutedPlayers;
        //         this.updateMuteStates();
        //     });
        // }

    }

  
    toggleMute(player: string, channelName: string): void {
        //const channelName = this.selectedChannel;
        if (this.channelService.isPlayerMuted(player, channelName)) {
            this.channelService.unmutePlayer(this.currentUser!.username, channelName, player);
        } else {
            this.channelService.mutePlayer(this.currentUser!.username, channelName, player);
        }
    }

    onMutePlayer(player: string, channelName: string): void {
        this.channelService.mutePlayer(this.currentUser!.username, this.selectedChannel, player);
    }

    onUnmutePlayer(player: string): void {
        this.channelService.unmutePlayer(this.currentUser!.username, this.selectedChannel, player);
    }


    loadMutedPlayersInChannel(): void {
        const username = this.currentUser!.username;
        this.channelService.requestMutedPlayersInChannel(username).subscribe((mutedPlayersPerChannel) => {
            this.mutedPlayersPerChannel = mutedPlayersPerChannel;
            this.updateMuteStates();
        });
    }
    
    updateMuteStates(): void {
        this.muteStates = {};
        this.mutedPlayers.forEach(player => {
            this.muteStates[player] = true;
        });
    }

   
    disableDraggable() {
        this.widgetStateService.setDraggable(false);
        this.widgetStateService.resetWidget();
    }

    isGameChannel(channelName: string): boolean {
        return /^\d*\.\d*$/.test(channelName);
        // glitch pr les channelgame
    }

    highlightGameChannels() {
        const gameChannels = this.myChannelList.filter(channel => this.isGameChannel(channel.name));
        const otherChannels = this.myChannelList.filter(channel => !this.isGameChannel(channel.name));

        this.myFilteredChannelList = [...gameChannels, ...otherChannels];
        // this.filteredChannelList = [ ...otherChannels];
    }

    openChat() {
        this.enabled = true;
        this.state = 'integrated-opened';
    }
    closeChat() {
        this.enabled = false;
        this.state = 'integrated-closed';
    }
    gameMode(){
        this.enabled = true;
        this.isGameMode = true;
        this.state = 'game-mode';
    }


}
