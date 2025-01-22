import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedWaitingPageComponent } from './limited-waiting-page.component';

describe('LimitedWaitingPageComponent', () => {
  let component: LimitedWaitingPageComponent;
  let fixture: ComponentFixture<LimitedWaitingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitedWaitingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitedWaitingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
