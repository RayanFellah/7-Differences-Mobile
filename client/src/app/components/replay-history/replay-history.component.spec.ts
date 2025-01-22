import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayHistoryComponent } from './replay-history.component';

describe('ReplayHistoryComponent', () => {
  let component: ReplayHistoryComponent;
  let fixture: ComponentFixture<ReplayHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplayHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplayHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
