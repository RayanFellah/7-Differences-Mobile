import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AvatarService } from '@app/services/avatar.service';
import { environment } from 'src/environments/environment';

export type PageType = 'signUpPage' | 'accountSettingsPage';
@Component({
  selector: 'app-avatar-selector',
  templateUrl: './avatar-selector.component.html',
  styleUrls: ['./avatar-selector.component.scss']
})
export class AvatarSelectorComponent implements OnInit {

  @Input() selectedAvatar: string;
  @Output() avatarSelect = new EventEmitter<string>();
  appAvatars: string[];
  @Input() disabled: boolean = false;
  @Input() pageType: PageType; // signuppage -> defaluts avatars, shoppage -> all avatars (sauf defaults), accountsettingspage -boughtAvatars, 
  constructor(private readonly avatarService: AvatarService) {}

  ngOnInit() {
    this.avatarService.getBougtAvatars().subscribe((res: any) => {
      if (res.boughtAvatars) this.avatarService.setBoughtAvatars(res.boughtAvatars);
      this.appAvatars = this.avatarService.getAvatarsList(this.pageType);
      this.selectedAvatar = this.appAvatars[0];
      this.onSelect(this.selectedAvatar);
      console.log('avatr', this.selectedAvatar);
    //   console.log(this)
    });
    console.log('appAvatars', this.appAvatars);
  }

  onSelect(avatar: string): void {
    this.avatarSelect.emit(avatar);
  }

  getAvatarUrl(avatar: string): string {
    console.log('avatar', avatar);
    return `${environment.serverUrlAndPort}/avatars/${avatar}`;
  }
}
