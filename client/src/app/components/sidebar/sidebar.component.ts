import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Messenger } from '@app/services/messenger';
import { SenderType } from '@common/message';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    providers: [Messenger],
})
export class SidebarComponent {
    @Input() username: string;
    @Input() canSend: boolean;
    @Output() clicked = new EventEmitter();
    @Output() unclicked = new EventEmitter();


    messageContent: string;
    senderType: typeof SenderType;

    constructor(public messenger: Messenger) {
        this.messageContent = '';
        this.clicked = new EventEmitter();
        this.unclicked = new EventEmitter();
        this.senderType = SenderType;
    }

    setContent(event: Event) {
        const target = event.target as HTMLInputElement;
        this.messageContent = target.value;
    }

    send() {
        if (this.messageContent) {
            //this.messenger.send(this.username, this.messageContent, );
            this.messageContent = '';
        }
    }

    clickChat() {
        this.clicked.emit();
    }

    closeChat() {
        this.unclicked.emit();
    }
}
