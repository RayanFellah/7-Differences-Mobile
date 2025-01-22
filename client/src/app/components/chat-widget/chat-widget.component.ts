import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';
import { ChannelService } from '@app/services/channel.service';
import { LanguageService } from '@app/services/language.service';
import { Messenger } from '@app/services/messenger';
import { PersistentMessengerService } from '@app/services/persistent-messenger.service';
import { SocketService } from '@app/services/socket.service';
import { Chat } from '@common/chat';
import { Message, SenderType } from '@common/message';
import { IUser } from '@common/user';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
  providers: [Messenger, PersistentMessengerService],
  encapsulation: ViewEncapsulation.None // Ceci appliquera les styles globalement


})
export class ChatWidgetComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() channel: string;
  @Input() username: string;
  @Input() canSend: boolean;
  @Output() clicked = new EventEmitter();
  @Output() unclicked = new EventEmitter();
  @Output() onCloseChat = new EventEmitter<void>();


  isVisible: boolean = true;

  messages: Message[] = [];
  messageContent: string;
  senderType: typeof SenderType;
  @Input() mutedPlayers: string[] = [];
  currentUser: IUser | null = null;

  private subscriptions: Subscription = new Subscription();





  private openChatHandler = (event: Event) => {
    this.isVisible = true;
  };

  constructor(public messenger: Messenger, public persistentMessenger: PersistentMessengerService, public socketService: SocketService, public authService: AuthentificationService, public channelService: ChannelService, protected readonly languageService: LanguageService
  ) {
    this.authService.user$.subscribe((user: IUser | null) => {
      this.currentUser = user;
    });

    this.messageContent = '';
    this.clicked = new EventEmitter();
    this.unclicked = new EventEmitter();
    this.senderType = SenderType;
    this.socketService.listen('updatedHistory').subscribe((chat: any) => {
      if(this.channel==chat.name){
        this.messages = chat.history;
      }

    })
  }

  ngOnInit(): void {
    this.subscriptions.add(this.messenger.getMessages(this.channel).subscribe((messages: Message[]) => {
      this.messages = messages;

    }));
    this.scrollToBottom();

    this.messenger.onMessageReceived((chat: Chat) => {
      this.messages = chat.history;
      this.scrollToBottom();

    });

    window.addEventListener('open-chat', this.openChatHandler);


  }

  ngAfterViewInit(): void {
    window.addEventListener('open-chat', this.openChatHandler);
    this.scrollToBottom();
   // window.addEventListener('open-chat', this.openChatHandler);

  }



  setContent(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.messageContent = textarea.value;

    textarea.style.height = 'auto';

    const maxHeight = 150;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }


  send() {
    if (this.messageContent.trim()) {
      this.messenger.send(this.currentUser!.username, this.messageContent, this.channel , this.currentUser!.avatar);


      this.messageContent = '';
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.focus();
      }
    }
    this.scrollToBottom();
  }


  closeChat() {
    this.isVisible = false;
    this.onCloseChat.emit();


  }

  handleEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }


  scrollToBottom(): void {
    setTimeout(() => {
      const scrollBox = document.getElementById('scrollBox');
      if (scrollBox) {
        scrollBox.scrollTop = scrollBox.scrollHeight;
      }
    }, 300);
    //console.log('scrolling to bottom');
  }


  public openChat(): void {
    this.isVisible = true;
  }

  ngOnDestroy(): void {
    window.removeEventListener('open-chat', this.openChatHandler);
    this.subscriptions.unsubscribe();

  }

  getFilteredMessages(): Message[] {
    return this.messages.map(message => {
      if (message.body && message.body.includes('.gif')) {
        message.isGif = true;
      }
      return message;
    }).filter(message =>
      message.sender && message.sender.trim() !== '' &&
      !this.channelService.isPlayerMuted(message.sender, this.channel)
    );
  }

  getAvatarUrl(avatar: string): string {
    return `${environment.serverUrlAndPort}/avatars/${avatar}`;
  }


  isGameChannel(channelName: string): boolean {
    return /^\d*\.\d*$/.test(channelName); //glitch pr les channelgame 
  }
  

  



}
