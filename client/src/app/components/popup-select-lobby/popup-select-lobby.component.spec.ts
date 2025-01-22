import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSelectLobbyComponent } from './popup-select-lobby.component';

describe('PopupSelectLobbyComponent', () => {
  let component: PopupSelectLobbyComponent;
  let fixture: ComponentFixture<PopupSelectLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupSelectLobbyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupSelectLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
