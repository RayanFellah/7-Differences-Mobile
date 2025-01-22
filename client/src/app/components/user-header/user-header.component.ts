import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { AuthentificationService } from '@app/services/authentification.service';
import { Item } from '@common/items';
import { IUser } from '@common/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit, OnDestroy {

  constructor(private readonly authService: AuthentificationService, private accountSettingsService: AccountSettingsService) {}
  user: IUser | null;
  userSubscription: Subscription;
  avatarPath: string | undefined;
  boughtMedals: Item[] | undefined;

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      this.avatarPath = this.authService.avatarPath;
    });
    this.getBoughtMedals();
    console.log(this.boughtMedals, 'boughtMedals');
    console.log(this.authService.avatarPath);
  }

  private getBoughtMedals(): void {
    if (this.user) {
      this.accountSettingsService.getBoughtMedals(this.user.username).subscribe((res: any) => {
        console.log(res, 'res medals');
        this.boughtMedals = res.boughtMedals;
      });
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
