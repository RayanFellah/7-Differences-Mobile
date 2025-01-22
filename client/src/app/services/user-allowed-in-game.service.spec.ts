import { TestBed } from '@angular/core/testing';

import { UserAllowedInGameService } from './user-allowed-in-game.service';

describe('UserAllowedInGameService', () => {
    let service: UserAllowedInGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserAllowedInGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
