import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '@app/services/language.service';

@Component({
  selector: 'app-password-config-page',
  templateUrl: './password-config-page.component.html',
  styleUrls: ['./password-config-page.component.scss']
})
export class PasswordConfigPageComponent implements OnInit {

  protected password: string = '';
  private correctPassword: string = '123abc';
  isChatVisible: boolean = false;
  constructor(private router: Router, protected languageService: LanguageService) {}

  ngOnInit(): void {
  }

  public validatePassword(): void {
    if (this.password) {


      if (this.password === this.correctPassword) {
        this.router.navigate(['/config']);
      } else {
        alert('Password is incorrect');
      }
    }
  }

  @HostListener('window:keydown.enter', ['$event'])
  public onEnter(event: KeyboardEvent): void {
    event.preventDefault();
    this.validatePassword();
  }

  @ViewChild("textArea") myInputField: ElementRef;
  ngAfterViewInit() {
    this.myInputField.nativeElement.focus();
  }


  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
  } 

}
