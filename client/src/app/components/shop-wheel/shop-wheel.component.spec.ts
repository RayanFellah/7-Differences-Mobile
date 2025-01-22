import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopWheelComponent } from './shop-wheel.component';

describe('ShopWheelComponent', () => {
  let component: ShopWheelComponent;
  let fixture: ComponentFixture<ShopWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopWheelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
