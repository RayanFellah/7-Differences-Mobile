import { TestBed } from '@angular/core/testing';

import { WidgetStateService } from './widget-state.service';

describe('WidgetStateService', () => {
  let service: WidgetStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
