import { Injectable } from '@angular/core';
import { PageType } from '@app/components/avatar-selector/avatar-selector.component';
import { Item } from '@common/items';
import { IUser } from '@common/user';
import { of } from 'rxjs';
import { AccountSettingsService } from './account-settings.service';
import { AuthentificationService } from './authentification.service';
// import { HttpClient } from '@angular/common/http';
// import { Item } from '@common/items';
import { environment } from 'src/environments/environment';

// Implémenter la logique de recuperation des avatars achetés apres avoir implemanter la logique de la boutique
@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  avatarPath: string | undefined;
  currentUser: IUser | null;


  appAvatars: string[];
  defaultAvatars: string[] = Array.from({ length: 3 }, (v, i) => `avatar${i + 1}.png`);
  allAppAvatars: string[] = Array.from({ length: 6 }, (v, i) => `avatar${i + 4}.png`);
  boughtAvatars: string[] = [];
  constructor(public readonly authService: AuthentificationService, private accountSettingsService: AccountSettingsService) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  setAvatarPath(avatar: string) {
    this.avatarPath = environment.serverUrlAndPort + `/avatars/${avatar}`;

  }

  setUploadAvatarPath(username: string) {
    this.avatarPath = environment.serverUrlAndPort + `/avatars/pictures/${username}.jpg`;
  }

  getAvatarsList(pageType: PageType) {
    if (pageType === 'signUpPage') {
      this.appAvatars = this.defaultAvatars;
    }
    else if (pageType === 'accountSettingsPage') {
      this.appAvatars = [...this.defaultAvatars, ...this.boughtAvatars];
    }
    return this.appAvatars;
  }

  getAllAvatars() {
    return this.allAppAvatars;
  }

  getAvatarPath(avatar: string) {
    return environment.serverUrlAndPort + `/avatars/${avatar}`;
  }

  getBougtAvatars() {
    if (this.currentUser)
      return this.accountSettingsService.getBoughtAvatars(this.currentUser!.username);
    else return of(this.defaultAvatars);
  }

  setBoughtAvatars(boughtAvatars: Item[]) {
    this.boughtAvatars = boughtAvatars.map((avatar: Item) => avatar.name);
  }
}
