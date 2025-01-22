import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: any;

    constructor(private router: Router) {
        this.socket = io(environment.serverUrlAndPort);
        this.listenForSessionExpired();
    }

    emit(event: string, data: unknown) {
        this.socket.emit(event, data);
    }
    emitGeneralChat(message: any, channelName: string) {
        const data = {
            body: message.body,
            sender: message.sender,
            senderType: message.senderType,
            time: message.time,
            chatName: channelName,
            avatar: message.avatar,

        };
        console.log('emitting message:', data);

        this.socket.emit('updateChatHistory', data);

    }


    listen<T>(event: string): Observable<T> {
        return new Observable<T>((subscriber) => {
            this.socket.on(event, (data: T) => {
                subscriber.next(data);
            });
        });
    }

    private listenForSessionExpired(): void {
        this.socket.on('sessionExpired', () => {
            // ajoute une redirection vers le login
            alert('Votre session a expiré, veuillez vous reconnecter.');
            this.router.navigate(['/login']);
          // Ici, vous pouvez également naviguer vers une page de connexion ou effectuer toute autre action nécessaire.
        });
      }
}
