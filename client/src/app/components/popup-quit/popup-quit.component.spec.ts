import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatDialogMock } from '@app/services/create-page.service.spec';
import { PopupTextComponent } from '../popup-text/popup-text.component';
import { PopupQuitComponent } from './popup-quit.component';

describe('PopupQuitComponent', () => {
    let component: PopupQuitComponent;
    let fixture: ComponentFixture<PopupQuitComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        await TestBed.configureTestingModule({
            declarations: [PopupQuitComponent, CustomButtonComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialogRef, useValue: matDialogSpy },
                HttpClient,
                HttpHandler,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PopupQuitComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call closePopup() when button is clicked', () => {
        spyOn(component, 'closePopup');
        component.message = "Êtes-vous sûr de quitter la partie ?";
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelectorAll('app-custom-button')[1];
        button.click();
        expect(component.closePopup).toHaveBeenCalled();
    });

    it('should emit wantToQuitChange when popup is closed', () => {
        spyOn(component.wantToQuitChange, 'emit');
        component.closePopup(false);
        expect(component.wantToQuitChange.emit).toHaveBeenCalledWith({ quit: false, message: component.message });
    });

    it('should navigate when popup is closed if choice is true', () => {
        component.closePopup(true);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should not navigate when popup is closed if choice is false', () => {
        component.closePopup(false);
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalledWith('/home');
    });
});
