import { TestBed } from '@angular/core/testing';

import { GameInfoService } from './game-info.service';

describe('GameInfoService', () => {
    let service: GameInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change username', () => {
        service.username = 'test';
        expect(service.username).toEqual('test');
    });

    it('should change gameName', () => {
        service.gameName = 'test';
        expect(service.gameName).toEqual('test');
    });

    it('should change difficulty', () => {
        service.difficulty = 'Facile';
        expect(service.difficulty).toEqual('Facile');
    });

    it('should change nDiff', () => {
        service.nDiff = 1;
        expect(service.nDiff).toEqual(1);
    });

    it('should change isSolo', () => {
        service.isSolo = false;
        expect(service.isSolo).toEqual(false);
    });
});
