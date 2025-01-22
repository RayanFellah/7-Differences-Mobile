export enum SenderType {
    PLAYER,
    SYSTEM,
    EVENT
}

export class Message {
    time: string;
    senderType: SenderType;
    sender: string;
    body: string;
    avatar: string;
    isGif?: boolean;

    // chatName?: string;


    constructor(body: string, sender?: string, avatar?: string, senderType?: SenderType, chatName?: string ) {
        if (sender && avatar) {
            this.senderType = SenderType.PLAYER;
            this.sender = sender;
            this.avatar = avatar;  
        } else {
            this.senderType = senderType ? SenderType.EVENT : SenderType.SYSTEM;
            this.sender = senderType ? SenderType[2] : SenderType[1];
        }
        this.body = body;
        this.time = Message.currentTime();
    }

    static currentTime(): string {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        }).format(new Date());
    }
}

