import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ClickHistoryService } from '@app/services/click-history.service';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-popup-quit',
    templateUrl: './popup-quit.component.html',
    styleUrls: ['./popup-quit.component.scss'],
})
export class PopupQuitComponent {
    @Input() gameEnded: boolean;
    @Input() buttonTitle: string;
    @Input() message: string;
    @Input() isSolo: boolean;
    @Output() wantToQuitChange = new EventEmitter<{ quit: boolean, message: string }>();
    constructor(public router: Router, private clickHistoryService: ClickHistoryService, protected ls: LanguageService) {}

    closePopup(choice: boolean) {
        this.wantToQuitChange.emit({ quit: choice, message: this.message });
        if (choice) {
            this.clickHistoryService.clickHistory = [];
            this.router.navigateByUrl('/home');
        }
    }
}
