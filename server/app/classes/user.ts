import { Item } from '@common/items';
import * as io from 'socket.io';

export class ActiveUser {
    socket: io.Socket;
    username: string;
    password: string;
    email: string;
    avatarFileName: string;
    boughtItems: Item[];
    private lastPing: number;

    constructor(userName: string) {
        this.username = userName;
        this.lastPing = Date.now();
    }

    destructor() {
        // Do some cleanup here
        // Save the user data to the database
    }

    initSocket() {
        this.socket.on('updateLastPing', (data) => {
            // this.lastPing = data.date;       // changer sur flutter pour que on prenne le temps denvoi
            this.lastPing = Date.now();
        });
    }

    addSocket(socket: io.Socket) {
        this.socket = socket;
        this.initSocket();
    }

    isUserActive(): boolean {
        const fifteenSeconds = 15000;
        const intervalSinceLastPing = Date.now() - this.lastPing;
        const condition = intervalSinceLastPing <= fifteenSeconds;
        condition
            ? console.log(`User is active, because ${intervalSinceLastPing} < ${fifteenSeconds}`)
            : console.log(`User is not active, because ${intervalSinceLastPing} > ${fifteenSeconds}`);
        return condition;
    }

    setAvatar(avatarFileName: string) {
        this.avatarFileName = avatarFileName;
    }

    // emitSessionExpired() {
        // this.socket.emit('sessionExpired');
        // console.log('Session expired emitted');
    // }
}
