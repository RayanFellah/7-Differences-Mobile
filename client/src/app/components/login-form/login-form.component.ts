import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogData } from '@app/interfaces/dialog-data';
import { AuthentificationService } from '@app/services/authentification.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';
import { ThemeService } from '@app/services/theme.service';
import { IUser } from '@common/user';
import { Subscription } from 'rxjs';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
    @Input() socketId: string;
    formGroup: FormGroup;
    user: IUser;
    intervalId: any;
    subscription: Subscription;
    constructor(
        private authService: AuthentificationService,
        private readonly router: Router,
        private dialogRef: MatDialog,
        private socketService: SocketService,
        private themeService: ThemeService,
        protected languageService: LanguageService,
    ) {}

    // A considérer pour la suite (si on veut que l'utilisateur soit considéré comme connecté s'il a un token valide dans le localStorage)
    ngOnInit(): void {
        // if (this.authService.isLoggedIn()) {
        //     this.router.navigate(['/home']);
        // }
        this.subscription = this.authService.user$.subscribe(user => {
            // Mise à jour de l'état local du composant ou du service avec les nouvelles données de l'utilisateur
            this.user = user as IUser;
            this.initForm();
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


    initForm() {
        this.formGroup = new FormGroup({
            username: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]),
        });
    }

    loginProcess() {
        if (this.isFormValid()) {
            this.performLogin();
        }
    }

    isFormValid() {
        return this.formGroup.valid;
    }

    performLogin() {
        console.log('performLogin', this.formGroup.value);
        this.authService.validateUserLogin(this.formGroup.value).subscribe({
            next: (res) => {
                const loginResponse = res.body as {
                    username: string;
                    token: string;
                    avatar: string;
                    isLanguageFrench: boolean;
                    isThemeDark: boolean;
                    dinars:number;
                    id: string;
                };
                if (loginResponse && loginResponse.username) {
                    this.languageService.setLanguage(loginResponse.isLanguageFrench);
                    this.themeService.setTheme(loginResponse.isThemeDark);
                    this.socketService.emit('attachSocketToActiveUser', loginResponse.username);
                    console.log('res', (res.body! as IUser).username);
                    this.socketService.emit('attachSocketToActiveUser', loginResponse?.username);
                    // localStorage.setItem('token', loginResponse.token as string);
                    this.authService.setUser({
                        id: loginResponse.id,
                        username: loginResponse.username,
                        avatar: loginResponse.avatar,
                        dinars: loginResponse.dinars,
                    });
                    // this.accountSettingsService.currentUser = this.authService.user;
                    this.authService.isLoggedIn = true;
                    this.navigateToHomeAfterDelay();
                    AuthentificationService.routine(this.socketService, loginResponse);
                    console.log('loginResponse', loginResponse);
                } else {
                    console.error('La réponse du login est invalide ou manquante', loginResponse);
                }
            },
            error: (err) => this.handleLoginError(err),
        });
    }

    private handleLoginError(error: any) {
        PopupTextComponent.openDialog(this.dialogRef, {
            message: `<h2>Erreur lors de la connexion: ${error.error.message} </h2>`,
            preventClose: false,
        } as DialogData);
    }

    private navigateToHomeAfterDelay() {
        this.router.navigate(['home']);
    }
}
