import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomButtonComponent } from '@app/components/custom-button/custom-button.component';
import { LogoComponent } from '@app/components/logo/logo.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent, CustomButtonComponent, LogoComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'Jeu de différences'", () => {
        expect(component.title).toEqual('Jeu de différences');
    });

    it('should have a button "Mode Classique"', () => {
        const classic: HTMLButtonElement = fixture.nativeElement.querySelectorAll('app-custom-button')[0];
        expect(classic.getAttribute('routerLink')).toBe('/selecto');
    });

    it('should have a button "Mode Temps Limité"', () => {
        const limited: HTMLButtonElement = fixture.nativeElement.querySelectorAll('app-custom-button')[1];
        expect(limited.getAttribute('routerLink')).toBe('/limited-selecto');
    });

    it('should have a button "Configuration"', () => {
        const config: HTMLButtonElement = fixture.nativeElement.querySelectorAll('app-custom-button')[2];
        expect(config.getAttribute('routerLink')).toBe('/config');
    });

    it('should have a logo"', () => {
        const logo: LogoComponent = fixture.nativeElement.querySelector('app-logo');
        expect(logo).toBeTruthy();
    });

    it('should have a team name', () => {
        const h4: HTMLElement = fixture.nativeElement.querySelector('h4');
        expect(h4.textContent).toEqual('Équipe 108');
    });

    it('should have the team members names', () => {
        const teamMembers: HTMLParagraphElement = fixture.nativeElement.querySelector('p');
        const numberOfMembers = 6;
        for (let i = 0; i < numberOfMembers; i++) {
            const member: HTMLSpanElement = teamMembers.querySelectorAll('span')[i];
            expect(member.textContent).toBeTruthy();
        }
    });
});
