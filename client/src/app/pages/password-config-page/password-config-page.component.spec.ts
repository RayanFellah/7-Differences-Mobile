import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordConfigPageComponent } from './password-config-page.component';

describe('PasswordConfigPageComponent', () => {
  let component: PasswordConfigPageComponent;
  let fixture: ComponentFixture<PasswordConfigPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordConfigPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordConfigPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
