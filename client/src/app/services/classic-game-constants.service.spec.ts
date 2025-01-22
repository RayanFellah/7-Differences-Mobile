import { TestBed } from '@angular/core/testing';

import { ClassicGameConstantsService } from './classic-game-constants.service';

describe('ClassicGameConstantsService', () => {
  let service: ClassicGameConstantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassicGameConstantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
