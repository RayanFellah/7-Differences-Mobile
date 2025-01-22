import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { LanguageService } from '@app/services/language.service';
import { SocketService } from '@app/services/socket.service';
import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-selecto-page',
    templateUrl: './selecto-page.component.html',
    styleUrls: ['./selecto-page.component.scss'],
})
export class SelectoPageComponent implements OnInit, OnDestroy {
    first: number;
    last: number;
    nGameCards: number;
    gameCards: GameCardTemplate[];
    isSelectoPage: boolean;
    destroy$: Subject<any>;
    isChatVisible: boolean = false;

    constructor(
        private readonly communication: CommunicationService,
        private readonly socketService: SocketService,
        private router: Router,
        protected ls: LanguageService,
    ) {}

    ngOnInit(): void {
        this.destroy$ = new Subject<any>();
        this.first = 0;
        this.last = consts.CARDS_BY_PAGE;

        this.downloadCards();

        this.configSockets();
        this.isSelectoPage = this.router.url === '/selecto';
    }

    configSockets(): void {
        this.socketService.listen('gameCardsModified').pipe(takeUntil(this.destroy$)).subscribe({
            next: () => { this.downloadCards(); }
        });
    }

    downloadCards(): void {
        this.communication.downloadGameCards().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            this.gameCards = res.body as GameCardTemplate[];
            this.nGameCards = this.gameCards.length;
        });
    }

    increment(): void {
        this.first = this.first + consts.CARDS_BY_PAGE;
        this.last = this.last + consts.CARDS_BY_PAGE;
    }

    decrement(): void {
        if (this.first === 0) return;
        this.first = this.first - consts.CARDS_BY_PAGE;
        this.last = this.last - consts.CARDS_BY_PAGE;
    }

    isNextPage(): boolean {
        return this.nGameCards / consts.CARDS_BY_PAGE > this.last / consts.CARDS_BY_PAGE;
    }

    ngOnDestroy(): void {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }

}