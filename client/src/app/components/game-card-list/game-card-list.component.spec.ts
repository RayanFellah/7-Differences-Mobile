import { HttpClient, HttpHandler } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { SelectoPageComponent } from '@app/pages/selecto-page/selecto-page.component';
import { Difficulty } from '@common/game-card-template';
import { MatDialogMock } from '../../services/create-page.service.spec';
import { GameCardComponent } from '../game-card/game-card.component';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { GameCardListComponent } from './game-card-list.component';

describe('GameCardListComponent', () => {
    let component: GameCardListComponent;
    let fixture: ComponentFixture<GameCardListComponent>;
    let debugElement: DebugElement;
    let router: Router;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    const routes = [
        { path: 'selecto', component: SelectoPageComponent },
        { path: 'config', component: ConfigPageComponent },
    ] as Routes;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        await TestBed.configureTestingModule({
            declarations: [GameCardListComponent, GameCardComponent],
            imports: [RouterTestingModule.withRoutes(routes)],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
                HttpClient,
                HttpHandler
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardListComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        router = TestBed.inject(Router);
        component.first = 0;
        component.last = 4;
        component.gameCards = [
            {
                id: '1',
                name: 'Test',
                difficulty: Difficulty.Easy,
                img1ID: '1',
                img2ID: '1',
                differences: [],
                initDefault(): void {
                    this.difficulty = Difficulty.Easy;
                    this.differences = [];
                },
                isComplete(): boolean {
                    return true;
                },
            },
            {
                id: '2',
                name: 'Test',
                difficulty: Difficulty.Easy,
                img1ID: '2',
                img2ID: '2',
                differences: [],
                initDefault(): void {
                    this.difficulty = Difficulty.Easy;
                    this.differences = [];
                },
                isComplete(): boolean {
                    return true;
                },
            },
            {
                id: '3',
                name: 'Test',
                difficulty: Difficulty.Easy,
                img1ID: '3',
                img2ID: '3',
                differences: [],
                initDefault(): void {
                    this.difficulty = Difficulty.Easy;
                    this.differences = [];
                },
                isComplete(): boolean {
                    return true;
                },
            },
            {
                id: '4',
                name: 'Test',
                difficulty: Difficulty.Easy,
                img1ID: '4',
                img2ID: '4',
                differences: [],
                initDefault(): void {
                    this.difficulty = Difficulty.Easy;
                    this.differences = [];
                },
                isComplete(): boolean {
                    return true;
                },
            },
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the correct first attribute', () => {
        expect(component.first).toEqual(0);
    });

    it('should have the correct last attribute', () => {
        const LAST = 4;
        expect(component.last).toEqual(LAST);
    });

    it('should have a gameCards attribute', () => {
        expect(component.gameCards).toBeTruthy();
    });

    it('should have a gameCardsSlice attribute', () => {
        expect(component.gameCardsSlice).toBeTruthy();
    });

    it('should have a page of "Jeu" when router.url is "/selecto"', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue('/selecto');
        component.ngOnInit();
        expect(component.page).toBe('Selecto');
    });

    it('should have a page of "Config" when router.url is "/config"', () => {
        spyOnProperty(router, 'url', 'get').and.returnValue('/config');
        component.ngOnInit();
        expect(component.page).toBe('Config');
    });

    it('should display 4 gameCards', () => {
        const LAST = 4;
        const gameCards = debugElement.queryAll(By.css('app-game-card'));
        expect(gameCards.length).toEqual(LAST);
    });

    it('should change gameCardsSlice to correct value when changeGameCards is called', () => {
        component.first = 0;
        component.last = 2;
        fixture.detectChanges();
        component.changeGameCards();
        expect(component.gameCardsSlice).toEqual(component.gameCards.slice(0, 2));
    });

    it('ngOnChanges should call changeGameCards', () => {
        spyOn(component, 'changeGameCards');
        component.ngOnChanges();
        expect(component.changeGameCards).toHaveBeenCalled();
    });
});
