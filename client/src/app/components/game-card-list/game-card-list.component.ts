import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardTemplate } from '@common/game-card-template';

@Component({
    selector: 'app-game-card-list',
    templateUrl: './game-card-list.component.html',
    styleUrls: ['./game-card-list.component.scss'],
})
export class GameCardListComponent implements OnInit, OnChanges {
    @Input() first: number;
    @Input() last: number;
    @Input() gameCards: GameCardTemplate[] = [];
    page: string;

    gameCardsSlice: GameCardTemplate[] = [];

    constructor(private router: Router) {}

    ngOnInit(): void {
        if (this.gameCards) this.gameCardsSlice = this.gameCards.slice(this.first, this.last);
        this.page = this.router.url === '/selecto' ? 'Selecto' : 'Config';
    }

    changeGameCards() {
        if (this.gameCards) this.gameCardsSlice = this.gameCards.slice(this.first, this.last);
    }

    ngOnChanges() {
        this.changeGameCards();
    }
}
