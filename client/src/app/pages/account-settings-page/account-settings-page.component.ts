import { Component, OnInit } from '@angular/core';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { LanguageService } from '@app/services/language.service';
import { ThemeService } from '@app/services/theme.service';
import { Item } from '@common/items';
import { IUser } from '@common/user';

@Component({
    selector: 'app-account-settings-page',
    templateUrl: './account-settings-page.component.html',
    styleUrls: ['./account-settings-page.component.scss'],
})
export class AccountSettingsPageComponent implements OnInit {

  user: IUser | null;
  medals: Item[] = [];
  avatars: Item[];
  userStats: any = {};
  isChatVisible: boolean = false;

  constructor(private readonly accountSettingsService: AccountSettingsService, protected languageService: LanguageService, protected themeService: ThemeService) {
    this.user = this.accountSettingsService.currentUser;
    console.log('this.user', this.user);
  }

  ngOnInit() {
    this.accountSettingsService.getBoughtMedals(this.user!.username).subscribe((res: any) => {
      this.medals = res.body.boughtMedals;
    });

    this.accountSettingsService.getBoughtAvatars(this.user!.username).subscribe((res: any) => {
      this.avatars = res.body.boughtAvatars;
    });

    this.accountSettingsService.getUserStats(this.user!.username).subscribe((res: any) => {
      this.userStats = res.userStats;
      console.log('this.userStats', this.userStats);
    });
  }

  toggleTheme() {
    this.themeService.selectTheme(!this.themeService.isThemeDark);
  }

  toggleLanguage() {
    this.languageService.selectLanguage(!this.languageService.isLanguageFrench);
  }

  onSubmitUsername() {
  }

  
  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
}
}
