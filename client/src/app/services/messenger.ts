import { Injectable } from "@angular/core";
import { Message } from "@common/message";
import { map, Observable, Subject } from "rxjs";
import { ReplayService } from "./replay.service";
import { SocketService } from "./socket.service";
@Injectable()
export class Messenger {

    messages: Message[] = [];
    destroy$ = new Subject<any>();

    $destroy: Subject<void> = new Subject<void>();

    constructor(public socketService: SocketService, public replayService: ReplayService
    ) {
        this.messages = [];
        this.onMessageReceived((message: Message) => {
        });

    }

    send(username: string, body: string, channelName: string ,avatar: string) {
        const message = new Message(body, username, avatar);
        this.socketService.emitGeneralChat(message, channelName); //TODO: changer nom de la focntion pour le chat
        //this.persistentMessenger.addMessage(message);

    }

    addMessage(message: Message) {
        this.messages.push(message);
    }

    ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }



    onMessageReceived(callback: Function) {
        this.socketService.listen('updatedHistory').subscribe((message: any) => {
            callback(message);
        });
    }

    getMessages(chatName: string): Observable<Message[]> {
        this.socketService.emit('getChatHistory', chatName); // ajouter le nom du channel ici 
        return this.socketService.listen('updatedHistory').pipe(
            //map((data) => data as Message[])
            map((data: any) => {
                return data.history as Message[];
            })
            
        );
    }





}