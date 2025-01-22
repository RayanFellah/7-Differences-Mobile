import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogData } from '@app/interfaces/dialog-data';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { AuthentificationService } from '@app/services/authentification.service';
import { UploadService } from '@app/services/upload.service';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
    @ViewChild('avatarUpload', { static: false }) avatarUpload: ElementRef;
    updateProfileForm: FormGroup;


    currentAvatar: string;
    currentUsername: string;
    selectedFile: File | undefined;
    isCustomAvatarUploaded: boolean = false;
    newUserName: string = '';
    isPanelOpened: boolean = false;
    constructor(private readonly accountSettingsService: AccountSettingsService,
        private dialogRef: MatDialog,
        private readonly uploadService: UploadService,
        private authService: AuthentificationService,
        protected ls: LanguageService,
    ) {}

    ngOnInit(): void {
        this.currentAvatar = this.accountSettingsService.currentUser!.avatar;
        this.currentUsername = this.accountSettingsService.currentUser!.username;
        this.initForm();
    }

    initForm() {
        this.updateProfileForm = new FormGroup({
            username: new FormControl(this.currentUsername),
            avatar: new FormControl('')
        });
    }

    updateUsername(newUsername: string) {
        console.log('newUsername', newUsername);
        this.accountSettingsService.updateUsername(newUsername).subscribe({
            next: (res) => {
                console.log('res', res);
                PopupTextComponent.openDialog(this.dialogRef, {
                    message: `<h2> ${(res as { message: string }).message} </h2>`,
                    preventClose: false,
                } as DialogData);
                this.authService.setUser({ ...this.accountSettingsService.currentUser!, username: newUsername });
                this.authService.redirect('home');
                // this.accountSettingsService.currentUser!.username = newUsername;
            },
            error: (error) => {
        
        

        PopupTextComponent.openDialog(this.dialogRef, {
          message: `<h2> ${(error.error as { message: string }).message} </h2>`,
          preventClose: false,
        } as DialogData);
        console.log('error', error);
            }
        });
    }

    updateAvatar() {

        this.currentAvatar = this.isCustomAvatarUploaded ? 'pictures/' + this.currentUsername + '.jpg?' + Math.random() : this.updateProfileForm.value.avatar;
        this.accountSettingsService.updateAvatar(this.currentUsername, this.currentAvatar).subscribe({
            next: (res) => {
                console.log('avatarRes', res);
                PopupTextComponent.openDialog(this.dialogRef, {
                    message: `<h2> ${res} </h2>`,
                    preventClose: false,
                } as DialogData);
                console.log('avatar updated', this.currentAvatar);
                this.authService.setUser({ ...this.accountSettingsService.currentUser!, avatar: this.currentAvatar });
                this.authService.redirect('home');

            },
            error: (error) => {
                console.error('error', error);
            }
        });
    }

    async onFileSelected(event: Event) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        this.isCustomAvatarUploaded = true;
        try {
            const compressedImage = await this.uploadService.compressImage(file);
            this.uploadService.uploadImage(compressedImage, this.currentUsername).subscribe({
                next: () => {
                    this.updateAvatar();
                },
                error: (error) => console.error(error),
            });
        } catch (error) {
            console.error(error);
        }
    }

    uploadProfileByUpload(newUsername: string, avatarFile: File) {
        // Logique pour téléverser le nouvel avatar
        this.accountSettingsService.uploadAvatarAndUsername(newUsername, avatarFile).subscribe({
            next: (response) => {
                console.log('Avatar et nom d\'utilisateur mis à jour avec succès', response);
                // Traitez la réponse ici, par exemple, mettez à jour l'interface utilisateur
            },
            error: (error) => {
                console.error('Erreur lors de la mise à jour', error);
            }
        });
    }

    onAvatarSelected(avatar: string) {
        if (!this.isCustomAvatarUploaded) {
            this.updateProfileForm.get('avatar')!.setValue(avatar);
        }
    }

  onFileDeselected() {
    this.selectedFile = undefined;
    this.isCustomAvatarUploaded = false;
  }
}

