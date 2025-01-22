import { Injectable } from '@angular/core';
import { AuthentificationService } from './authentification.service';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    isLanguageFrench: boolean = true;
    constructor(private authenticationService: AuthentificationService) {}

    // changes current session display
    setLanguage(isFrench: boolean): void {
        this.isLanguageFrench = isFrench;
    }

    // Saves current value in DB
    saveLanguage(): void {
        this.authenticationService.saveUserLanguage(this.isLanguageFrench);
    }

    // For use in user settings
    selectLanguage(isFrench: boolean): void {
        this.setLanguage(isFrench);
        this.saveLanguage();
    }

    translate(frenchString: string, englishString: string): string {
        return this.isLanguageFrench ? frenchString : englishString;
    }
}
