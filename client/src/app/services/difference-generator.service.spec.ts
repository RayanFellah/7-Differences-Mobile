import { TestBed } from '@angular/core/testing';

import { DifferenceGeneratorService } from './difference-generator.service';

describe('DifferenceGeneratorService', () => {
  let service: DifferenceGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DifferenceGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
