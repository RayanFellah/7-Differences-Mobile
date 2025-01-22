import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, it } from 'node:test';
import { ChannelWidgetComponent } from './channel-widget.component';

describe('ChannelWidgetComponent', () => {
  let component: ChannelWidgetComponent;
  let fixture: ComponentFixture<ChannelWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChannelWidgetComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChannelWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
