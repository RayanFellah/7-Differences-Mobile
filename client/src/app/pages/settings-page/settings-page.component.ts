import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@app/services/language.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {
  panelOpenState = false;
  isChatVisible : boolean = false;
  constructor(public themeService: ThemeService, public languageService: LanguageService) { }

  ngOnInit(): void {
  }

  toggleTheme() {
    this.themeService.selectTheme(!this.themeService.isThemeDark);
  }

  toggleLanguage() {
    this.languageService.selectLanguage(!this.languageService.isLanguageFrench);
  }


  
  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
  }

}
