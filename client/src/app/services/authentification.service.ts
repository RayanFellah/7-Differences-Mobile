import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from '@common/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class AuthentificationService {

    // default
    specialErrorSoundUsed = false;
    specialSuccessSoundUsed = false;

    isLoggedIn: boolean = false;
    private userSubject: BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(null);
    currentUser: IUser | null = null;
    public user$ = this.userSubject.asObservable(); // Observable for the user
    avatarPath: string | undefined;
    static intervalId: any;
    private readonly baseUrl: string = environment.serverUrlAndPort + '/api/fs/players';
    constructor(private readonly http: HttpClient, private readonly router: Router) { }

    setUser(user: IUser) {
        this.userSubject.next(user);
        this.currentUser = user;
        // Mettre à jour également avatarPath ici si nécessaire
        this.avatarPath = environment.serverUrlAndPort + '/avatars/' + user.avatar;
    }

    setAvatarPath() {
        const user = this.userSubject.getValue();
        console.log(user, 'user');
    }

    validateUserLogin(user: IUser) {
        console.log('validateUserLogin', user);
        console.log(`${this.baseUrl}/login`);
        return this.http.post(`${this.baseUrl}/login`, user, {
            observe: 'response',
            responseType: 'json',
        });
    }

    validateUserSignUp(user: IUser) {
        return this.http.post(`${this.baseUrl}/new`, user, {
            observe: 'response',
            responseType: 'json',
        });
    }

    logout() {
        const user = this.userSubject.getValue();
        const url = `${this.baseUrl}/${user!.username}/logout`;
        const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

        this.http.patch(url, {}, { headers }).subscribe({
            next: () => {
                localStorage.clear();
                this.isLoggedIn = false;
                console.log('Logout successful');
                this.redirect('/login');
                AuthentificationService.intervalId = clearInterval(AuthentificationService.intervalId);
            },
            error: (error) => {
                console.error('Logout failed', error);
                this.redirect('/login'); // temp before fixing the error
            },
        });
    }

    saveUserLanguage(isLanguageFrench: boolean) {
        const user = this.userSubject.getValue();
        const url = `${this.baseUrl}/${user!.username}/language`;
        const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

        this.http.patch(url, { isLanguageFrench }, { headers }).subscribe({
            next: () => console.log('Language saved'),
            error: (error) => console.error('Language not saved', error),
        });
    }

    saveUserTheme(isThemeDark: boolean) {
        const user = this.userSubject.getValue();
        const url = `${this.baseUrl}/${user!.username}/theme`;
        const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

        this.http.patch(url, { isThemeDark }, { headers }).subscribe({
            next: () => console.log('Theme saved'),
            error: (error) => console.error('Theme not saved', error),
        });
    }

    static routine(socketService: SocketService, loginResponse: any) {
        this.intervalId = setInterval(() => {
            socketService.emit('updateLastPing', { date: Date.now() });
        }, 10000);
    }

    redirect(path: string) {
        this.router.navigate([path]);
    }
}
