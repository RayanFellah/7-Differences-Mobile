import { Injectable } from '@angular/core';
import { AuthentificationService } from './authentification.service';
import { ThemeService } from './theme.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MultiWindowService {
    triggerParentRebuild = new Subject();
    poppedOut: boolean = false;
    isChild: boolean = false;
    ready: boolean = false;
    isElectron: boolean = (window as any).require;
    ipcRenderer;

    constructor(private authService: AuthentificationService, private ts: ThemeService) {
        if (this.isElectron) {
            this.ipcRenderer = (window as any).require('electron').ipcRenderer;
        } else {
            this.ipcRenderer = {
                on: () => {},
                send: () => {},
            };
        }

        this.ipcRenderer.on('chat-window-closed', () => {
            console.log('chat window closed');
            this.triggerParentRebuild.next(null);
            this.poppedOut = false;
        });

        this.ipcRenderer.on('requestInit', () => {
            this.ipcRenderer.send('sendUsername', {
                username: this.authService.currentUser?.username,
                avatar: this.authService.currentUser?.avatar,
            });
            this.sendTheme();
        });

        this.ts.themeChange.subscribe(() => {
            this.sendTheme();
        });
    }

    sendTheme(): void {
        this.ipcRenderer.send('sendTheme', this.ts.isThemeDark);
    }

    initChildProcess(): void {
        this.isChild = true;
        this.ipcRenderer.on('username', (event: any, data: any) => {
            console.log('received data:', data);
            this.authService.setUser({ username: data['username'], avatar: data['avatar'] });
            this.ready = true;
        });

        this.ipcRenderer.on('theme', (event: any, isThemeDark: boolean) => {
            console.log('received theme:', isThemeDark);
            this.ts.setTheme(isThemeDark);
        });
        this.ipcRenderer.send('requestInit');
    }

    popOut(): void {
        this.poppedOut = true;
        this.ipcRenderer.send('open-channel-widget');
    }
}
