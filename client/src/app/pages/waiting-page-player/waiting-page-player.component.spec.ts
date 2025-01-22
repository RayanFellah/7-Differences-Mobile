import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingPagePlayerComponent } from './waiting-page-player.component';

describe('WaitingPagePlayerComponent', () => {
  let component: WaitingPagePlayerComponent;
  let fixture: ComponentFixture<WaitingPagePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitingPagePlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitingPagePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
