import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomButtonComponent } from '@app/components/custom-button/custom-button.component';
import { DrawingZoneComponent } from '@app/components/drawing-zone/drawing-zone.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { ToolBarComponent } from '@app/components/tool-bar/tool-bar.component';
import { ToolbarColorsComponent } from '@app/components/toolbar-colors/toolbar-colors.component';
import { ToolbarToolsComponent } from '@app/components/toolbar-tools/toolbar-tools.component';
import { MatDialogMock } from '../../services/create-page.service.spec';
import { CreatePageComponent } from './create-page.component';
describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<PopupTextComponent>>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['notifyObserver']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [CreatePageComponent, DrawingZoneComponent, ToolBarComponent, CustomButtonComponent, ToolbarToolsComponent, ToolbarColorsComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: Router, useValue: routerSpy },
                HttpClient,
                HttpHandler,
            ]
        });
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('undo should call undo from createPageService', () => {
        spyOn(component.createPageService, 'undo');
        component.undo();
        expect(component.createPageService.undo).toHaveBeenCalled();
    });
    it('redo should call redo from createPageService', () => {
        spyOn(component.createPageService, 'redo');
        component.redo();
        expect(component.createPageService.redo).toHaveBeenCalled();
    });
});