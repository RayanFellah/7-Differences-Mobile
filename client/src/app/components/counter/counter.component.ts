import { Component, Input } from '@angular/core';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent {
    @Input() name: string = 'player';
    count: number = 0;
    constructor(protected ls: LanguageService) {}

    reset() {
        this.count = 0;
    }

    increase(){
        this.count++;
    };
}
