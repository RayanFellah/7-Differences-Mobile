import { TestBed } from '@angular/core/testing';

import { ImageTransferService } from './image-transfer.service';

describe('ImageTransferService', () => {
    let service: ImageTransferService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImageTransferService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
