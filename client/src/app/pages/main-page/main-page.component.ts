import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { AuthentificationService } from '@app/services/authentification.service';
import { AvatarService } from '@app/services/avatar.service';
import { LanguageService } from '@app/services/language.service';
import { WindowManagementService } from '@app/services/window-management.service';
import { Item } from '@common/items';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    isChatVisible: boolean = false;
    readonly title: string = 'Jeu de différences';

    boughtMedals: Item[] | undefined;

    constructor(
        protected readonly authService: AuthentificationService,
        protected avatarService: AvatarService,
        protected readonly languageService: LanguageService,
        private changeDetectorRef: ChangeDetectorRef,
        private windowManagementService: WindowManagementService,
        private accountSettingsService: AccountSettingsService
    ) { }

    ngOnInit() {
        this.getBoughtMedals();
        if ((window as any).require) {
            let electron = (window as any).require('electron');
            electron.ipcRenderer.on('chat-window-closed', () => {
                this.isChatVisible = true;
                this.changeDetectorRef.detectChanges();
            });
        }
    }

    logout() {
        this.authService.logout();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }

    openChannelWidget(): void {
        this.windowManagementService.detachChat();
        this.isChatVisible = false;
    }
    private getBoughtMedals(): void {
        if (this.authService.currentUser) {
            this.accountSettingsService.getBoughtMedals(this.authService.currentUser.username).subscribe((res: any) => {
                console.log(res, 'res medals');
                this.boughtMedals = res.boughtMedals;
            });
        }
    }
}
