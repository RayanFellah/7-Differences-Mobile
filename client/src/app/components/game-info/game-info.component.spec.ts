import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoService } from '@app/services/game-info.service';

import { GameInfoComponent } from './game-info.component';

describe('GameInfoComponent', () => {
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;
    let service: GameInfoService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInfoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameInfoComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(GameInfoService);
        service.gameName = 'test';
        service.difficulty = 'Facile';
        service.nDiff = 1;
        service.isSolo = false;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change gameName', () => {
        expect(component.gameName).toEqual('test');
    });

    it('should change difficulty', () => {
        expect(component.difficulty).toEqual('Facile');
    });

    it('should change nDiff', () => {
        expect(component.nDiff).toEqual(1);
    });

    it('should show Solo p element if isSolo is true', () => {
        service.isSolo = true;
        component.ngOnInit();
        fixture.detectChanges();
        const pPos = 3;
        const thirdP = fixture.nativeElement.querySelectorAll('p')[pPos];
        expect(thirdP).toBeTruthy();
    });

    it('should show Duo p element if isLimitedTime is true', () => {
        component.ngOnInit();
        fixture.detectChanges();
        const pPos = 3;
        const thirdP = fixture.nativeElement.querySelectorAll('p')[pPos];
        expect(thirdP).toBeTruthy();
    });
});
