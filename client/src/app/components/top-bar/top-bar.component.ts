import { Component, Input } from '@angular/core';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
    @Input() title: string;
    @Input() backArrow: boolean = true;
    @Input() returnTo: string = '/home';
    constructor(public languageService: LanguageService) {}
}
