import { TestBed } from '@angular/core/testing';

import { PersistentMessengerService } from './persistent-messenger.service';

describe('PersistentMessengerService', () => {
  let service: PersistentMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistentMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
