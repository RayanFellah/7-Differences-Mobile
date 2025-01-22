import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { LanguageService } from '@app/services/language.service';
import { GameHistory } from '@common/gameHistory';

@Component({
    selector: 'app-game-history-page',
    templateUrl: './game-history-page.component.html',
    styleUrls: ['./game-history-page.component.scss'],
})
export class GameHistoryPageComponent implements AfterViewInit, OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    displayedColumns: string[] = ['dateHeure', 'result'];
    userGameHistory = new MatTableDataSource<GameHistory>([]);

    constructor(private accountSettingsService: AccountSettingsService, protected languageService: LanguageService) {}
    ngOnInit(): void {
        this.loadUserConnectionHistory(this.accountSettingsService.currentUser!.username);
    }

    ngAfterViewInit(): void {
        this.userGameHistory.paginator = this.paginator;
    }

    loadUserConnectionHistory(username: string) {
        this.accountSettingsService.getUserGameHistory(username).subscribe({
            next: (res: any) => {
                this.userGameHistory.data = res.gameHistory;
            },
            error: (error) => {
                console.error('Error fetching user connection history:', error);
            },
        });
    }
}
