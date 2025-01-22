import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogData } from '@app/interfaces/dialog-data';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { AuthentificationService } from '@app/services/authentification.service';
import { SocketService } from '@app/services/socket.service';
import { IUser } from '@common/user';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupFormComponent implements OnInit {
    signupFormGroup: FormGroup;
    passwordMatch: boolean = false;
    intervalId: any;
    constructor(
        public readonly authService: AuthentificationService,
        protected ls: LanguageService,
        private router: Router,
        private dialogRef: MatDialog,
        private socketService: SocketService,
        private readonly accountSettingsService: AccountSettingsService,
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.signupFormGroup = new FormGroup(
            {
                username: new FormControl('', [Validators.required, Validators.maxLength(10)]),
                email: new FormControl('', [
                    Validators.required,
                    Validators.email,
                    Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),
                ]),
                password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]),
                confirmPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]),
                avatar: new FormControl(null),
            },
            { validators: this.checkPasswords },
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkPasswords: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
        const group = control as FormGroup;
        const pass = group.get('password')?.value;
        const confirmPass = group.get('confirmPassword')?.value;

        return pass === confirmPass ? null : { notSame: true };
    };

    signupProcess() {
        if (this.isSignupFormValid()) {
            this.createUserAccount();
        }
    }

    isSignupFormValid() {
        return this.signupFormGroup.valid;
    }

    createUserAccount() {
        let newUser = this.extractNewUserInfo();
        console.log('newUser', newUser);
        this.authService.validateUserSignUp(newUser).subscribe({
            next: (res: any) => {
                console.log(res)
                console.log('navigateToHomeAfterDelay', newUser);
                this.socketService.emit('attachSocketToActiveUser', newUser.username);
                newUser = {...newUser, id: res.body!.id};
                this.setSignupData(newUser);
                this.accountSettingsService.currentUser = newUser;
                AuthentificationService.routine(this.socketService, newUser);
                this.navigateToHomeAfterDelay();

            },
            error: (err) => this.handleSignupError(err)
        });
    }

    extractNewUserInfo(): IUser {
        return {
            username: this.signupFormGroup.value.username,
            email: this.signupFormGroup.value.email,
            password: this.signupFormGroup.value.password,
            avatar: this.signupFormGroup.value.avatar,
            channelsAndMuted: [],
            dinars: 1000,
            boughtItems: [],
            replays: [],
        };
    }

    handleSignupError(err: any) {
        PopupTextComponent.openDialog(this.dialogRef, {
            message: `<h2>Erreur lors de l'inscription: ${err.error.message} </h2>`,
            preventClose: false,
        } as DialogData);
    }

    setSignupData(newUser: IUser) {
        this.authService.setUser(newUser);
        this.authService.isLoggedIn = true;
    }

    navigateToHomeAfterDelay() {
        this.router.navigate(['/home']);
    }

    onAvatarSelected(avatar: string) {
        this.signupFormGroup.get('avatar')!.setValue(avatar);
    }
}
