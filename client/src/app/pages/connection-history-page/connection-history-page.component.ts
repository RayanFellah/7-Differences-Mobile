import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { Action } from '@common/connectionHistory';
interface ConnectionHistory {
    dateHeure: Date;
    action: Action;
    // adresseIP: string;
}

@Component({
    selector: 'app-connection-history-page',
    templateUrl: './connection-history-page.component.html',
    styleUrls: ['./connection-history-page.component.scss'],
})
export class ConnectionHistoryPageComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['dateHeure', 'action'];
  connectionHistory = new MatTableDataSource<ConnectionHistory>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isChatVisible: boolean = false;


    constructor(private userService: AccountSettingsService) {}
    ngOnInit(): void {
        this.loadUserConnectionHistory(this.userService.currentUser!.username);
    }

    ngAfterViewInit(): void {
        this.connectionHistory.paginator = this.paginator;
    }

  loadUserConnectionHistory(username: string) {
    this.userService.getUserConnectionHistory(username).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.connectionHistory.data = res.connectionHistory;
        console.log('User connection history:', this.connectionHistory);
      },
      error: (error) => {
        console.error('Error fetching user connection history:', error);
      }
    });
  }

  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
}
}
