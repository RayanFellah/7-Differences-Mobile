import { Injectable } from '@angular/core';
import { AuthentificationService } from './authentification.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    themeChange: Subject<boolean> = new Subject<boolean>();
    isThemeDark: boolean = true;
    constructor(private authenticationService: AuthentificationService) {}

    // changes current session display language
    setTheme(isDark: boolean): void {
        this.isThemeDark = isDark;
        document.body.setAttribute('theme', isDark ? 'dark' : 'light');
    }

    // Saves current value in DB
    saveTheme(): void {
        this.authenticationService.saveUserTheme(this.isThemeDark);
    }

    // For use in user settings
    selectTheme(isThemeDark: boolean): void {
        this.setTheme(isThemeDark);
        this.themeChange.next(isThemeDark);
        this.saveTheme();
    }
}
