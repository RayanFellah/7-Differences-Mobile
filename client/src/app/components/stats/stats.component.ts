import { Component, OnInit } from '@angular/core';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { LanguageService } from '@app/services/language.service';
import { Statistics } from '@common/userStats';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
    userStats: Statistics = {
        numberGamesPlayed: 0,
        numberGamesWon: 0,
        averageDifferencePerGame: 0,
        averageTimePerGame: 0,
    };

    constructor(private accountSettingsService: AccountSettingsService, protected ls: LanguageService) {}

    ngOnInit(): void {
        this.accountSettingsService.getUserStats(this.accountSettingsService.currentUser!.username).subscribe((res: any) => {
            this.userStats = res.userStats;
            console.log('this.userStats', this.userStats);
        });
    }

}
