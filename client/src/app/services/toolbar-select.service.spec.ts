import { TestBed } from '@angular/core/testing';

import { ToolbarSelectService } from './toolbar-select.service';

describe('ToolbarSelectService', () => {
  let service: ToolbarSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolbarSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
