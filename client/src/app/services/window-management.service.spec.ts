import { TestBed } from '@angular/core/testing';

import { WindowManagementService } from './window-management.service';

describe('WindowManagementService', () => {
  let service: WindowManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
