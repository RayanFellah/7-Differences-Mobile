import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { Constants, GameEnded, NewTime } from '@common/game-classes';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    const baseId = '123456';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('uploadImage', () => {
        it('should return a valid id when an image is uploaded successfully', () => {
            const image = 'test';

            service.uploadImage(image).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_CREATED);
                expect(res.body).toEqual(baseId);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/image`);
            expect(req.request.method).toBe('POST');
            req.flush(baseId, { status: consts.HTTP_STATUS_CREATED, statusText: 'Created' });
        });

        it('should return an empty id when image uploading fails ', () => {
            const image = 'test';

            service.uploadImage(image).subscribe((res) => {
                expect(res.body).toEqual(consts.EMPTY_ID);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/image`);
            expect(req.request.method).toBe('POST');
            req.flush(consts.EMPTY_ID);
        });
    });

    describe('downloadImage', () => {
        const baseImage = 'test';
        it('should return a valid image and status ok when an id is provided', () => {
            service.downloadImage(baseId).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
                expect(res.body).toEqual(baseImage);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/image?id=${baseId}`);
            expect(req.request.method).toBe('GET');
            req.flush(baseImage);
        });
    });

    describe('uploadGameCard', () => {
        const gameCard = new GameCardTemplate();
        it('should return status created when a game card is uploaded successfully', () => {
            service.uploadGameCard(gameCard).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_CREATED);
            });
            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/gameCard`);
            expect(req.request.method).toBe('POST');
            req.flush('', { status: consts.HTTP_STATUS_CREATED, statusText: 'Created' });
        });
    });

    describe('downloadGameCards', () => {
        it('should return game cards list', () => {
            const gameCards = [new GameCardTemplate()];

            service.downloadGameCards().subscribe((res) => {
                expect(res.body).toEqual(gameCards);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/gameCards`);
            expect(req.request.method).toBe('GET');
            req.flush(gameCards);
        });
    });

    describe('deleteGameCard', () => {
        it('should return status ok when a game card is deleted successfully', () => {
            service.deleteGameCard(baseId).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/gameCard?id=${baseId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

    describe('addGameToHistory', () => {
        it('should return status ok when game is added to history successfully', () => {
            const gameEnded = new GameEnded();
            service.addGameToHistory(gameEnded).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/gameEnded`);
            expect(req.request.method).toBe('POST');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

    describe('getHistory', () => {
        it('should return history list', () => {
            const history = ['test'];

            service.getHistory().subscribe((res) => {
                expect(res.body).toEqual(history);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/history`);
            expect(req.request.method).toBe('GET');
            req.flush(history);
        });
    });

    describe('deleteHistory', () => {
        it('should return status ok when history is deleted successfully', () => {
            service.deleteHistory().subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/history`);
            expect(req.request.method).toBe('DELETE');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

    describe('setNewTime', () => {
        it('should return status ok when new time is set successfully', () => {
            const newTime = new NewTime();
            service.setNewTime(newTime).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/newTime`);
            expect(req.request.method).toBe('POST');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

    describe('getBestTimes', () => {
        it('should return best times list', () => {
            const bestTimes = ['test'];

            service.getBestTimes(baseId).subscribe((res) => {
                expect(res.body).toEqual(bestTimes);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/bestTimes?gameCardId=${baseId}`);
            expect(req.request.method).toBe('GET');
            req.flush(bestTimes);
        });
    });

    describe('resetBestTimes', () => {
        it('should return status ok when best times are reset successfully', () => {
            service.resetBestTimes(baseId).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/bestTimes?gameCardId=${baseId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

    describe('resetAllBestTimes', () => {
        it('should return status ok when all best times are reset successfully', () => {
            service.resetAllBestTimes().subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/bestTimes/all`);
            expect(req.request.method).toBe('DELETE');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

    describe('getConstants', () => {
        it('should return constants', () => {
            const constants = new Constants();

            service.getConstants().subscribe((res) => {
                expect(res.body).toEqual(constants);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/constants`);
            expect(req.request.method).toBe('GET');
            req.flush(constants);
        });
    });

    describe('setConstants', () => {
        it('should return status ok when constants are set successfully', () => {
            const constants = new Constants();
            service.setConstants(constants).subscribe((res) => {
                expect(res.status).toEqual(consts.HTTP_STATUS_OK);
            });

            const req = httpMock.expectOne(`${baseUrl}/${consts.FILE_SYSTEM}/constants`);
            expect(req.request.method).toBe('POST');
            req.flush('', { status: consts.HTTP_STATUS_OK, statusText: 'OK' });
        });
    });

});
