import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistoryPageComponent } from './game-history-page.component';

describe('GameHistoryPageComponent', () => {
  let component: GameHistoryPageComponent;
  let fixture: ComponentFixture<GameHistoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameHistoryPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameHistoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
