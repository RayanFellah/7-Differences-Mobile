import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedConfigDialogComponent } from './limited-config-dialog.component';

describe('LimitedConfigDialogComponent', () => {
  let component: LimitedConfigDialogComponent;
  let fixture: ComponentFixture<LimitedConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitedConfigDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitedConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
