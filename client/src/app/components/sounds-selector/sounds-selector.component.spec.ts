import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundsSelectorComponent } from './sounds-selector.component';

describe('SoundsSelectorComponent', () => {
  let component: SoundsSelectorComponent;
  let fixture: ComponentFixture<SoundsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoundsSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoundsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
