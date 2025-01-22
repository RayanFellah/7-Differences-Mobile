import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomButtonComponent } from '@app/components/custom-button/custom-button.component';
import { GameCardListComponent } from '@app/components/game-card-list/game-card-list.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { CommunicationService } from '@app/services/communication.service';
import { SocketService } from '@app/services/socket.service';
import { GameCardTemplate } from '@common/game-card-template';
import { Observable, of } from 'rxjs';
import { MatDialogMock } from '../../services/create-page.service.spec';

import { SelectoPageComponent } from './selecto-page.component';

describe('SelectoPageComponent', () => {
    let component: SelectoPageComponent;
    let fixture: ComponentFixture<SelectoPageComponent>;
    let communicationService: CommunicationService;
    let socketService: SocketService;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        await TestBed.configureTestingModule({
            declarations: [SelectoPageComponent, CustomButtonComponent, GameCardListComponent],
            imports: [HttpClientModule, RouterTestingModule],
            providers: [CommunicationService, SocketService,
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectoPageComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketService);
        socketService.listen = jasmine.createSpy('listen').and.returnValue(
            new Observable((observer) => {
                observer.next({});
            }),
        );
        communicationService = TestBed.inject(CommunicationService);
        const gameCard = new GameCardTemplate();
        const gameCards = [gameCard];
        communicationService.downloadGameCards = jasmine.createSpy().and.returnValue(
            new Observable<HttpResponse<object>>((observer) => {
                observer.next(new HttpResponse<object>({ body: gameCards }));
                observer.complete();
            }),
        );
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call downloadGames', () => {
        expect(communicationService.downloadGameCards).toHaveBeenCalled();
    });

    it('should call configSockets', () => {
        const spy = spyOn(component, 'configSockets');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should subscrive to socketService.listen', () => {
        component.configSockets();
        expect(socketService.listen).toHaveBeenCalled();
    });

    it('should not download the gameCards if the server is down', () => {
        communicationService.downloadGameCards = jasmine.createSpy().and.returnValue(of({ body: '' }));
        component.ngOnInit();
        expect(component.gameCards.length).toBe(0);
    });

    it('should set the first and last variables', () => {
        const first = 0;
        const last = 4;
        expect(component.first).toBe(first);
        expect(component.last).toBe(last);
    });

    it('should increment the first and last variables', () => {
        const first = 4;
        const last = 8;
        component.increment();
        expect(component.first).toBe(first);
        expect(component.last).toBe(last);
    });

    it('should decrement the first and last variables', () => {
        const first = 0;
        const last = 4;
        component.first = 4;
        component.last = 8;
        component.decrement();
        expect(component.first).toBe(first);
        expect(component.last).toBe(last);
    });

    it('should not decrement if first === 0', () => {
        const first = 0;
        const last = 4;
        component.first = 0;
        component.decrement();
        expect(component.first).toBe(first);
        expect(component.last).toBe(last);
    });

    it('isNextPage() should return false if there are no more gameCards to show', () => {
        component.gameCards = [new GameCardTemplate(), new GameCardTemplate()];
        fixture.detectChanges();
        expect(component.isNextPage()).toBe(false);
    });

    it('should have a button "Précedent"', () => {
        const previous = fixture.nativeElement.querySelector('app-custom-button.precedent');
        expect(previous).toBeTruthy();
    });

    it('should have a button "Suivant"', () => {
        const next = fixture.nativeElement.querySelector('app-custom-button.suivant');
        expect(next).toBeTruthy();
    });

    it('should call decrement when the button "Précedent" is clicked', () => {
        spyOn(component, 'decrement');
        const previous = fixture.nativeElement.querySelectorAll('app-custom-button')[0];
        previous.click();
        expect(component.decrement).toHaveBeenCalled();
    });

    it('should call increment when the button "Suivant" is clicked', () => {
        spyOn(component, 'increment');
        const next = fixture.nativeElement.querySelectorAll('app-custom-button')[1];
        next.click();
        expect(component.increment).toHaveBeenCalled();
    });

    it('should have app-game-card-list component', () => {
        const gameCardList = fixture.nativeElement.querySelector('app-game-card-list');
        expect(gameCardList).toBeTruthy();
    });
});
