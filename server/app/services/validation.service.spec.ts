import { expect } from 'chai';
import { ValidationService } from './validation.service';

describe('Validation service', () => {
    const validationService = new ValidationService();

    it('should validate if a correct difference is found', () => {
        const ioObj = {
            pos: { x: 100, y: 100 },
            diff: [{ points: [256400] }],
        };
        const response = validationService.validate(ioObj);
        expect(response.validation).to.true;
    });

    it('should not validate if an incorrect difference is found', () => {
        const ioObj = {
            pos: { x: 100, y: 100 },
            diff: [{ points: [123456, 654321] }],
        };

        const response = validationService.validate(ioObj);
        expect(response.validation).to.false;
    });

    it('should return the group of correct points if difference is found', () => {
        const ioObj = {
            pos: { x: 100, y: 100 },
            diff: [{ points: [256400] }],
        };

        const response = validationService.validate(ioObj);
        expect(response.diffFound).to.eql([{ points: [256400] }]);
    });

    it('should not return a group of points found if difference is incorrect', () => {
        const ioObj = {
            pos: { x: 100, y: 100 },
            diff: [{ points: [123456, 654321] }],
        };

        const response = validationService.validate(ioObj);
        expect(response.diffFound).to.eql(null);
    });

    it('should update the differences remaining if difference is found', (done: Mocha.Done) => {
        const ioObj = {
            pos: { x: 100, y: 100 },
            diff: [{ points: [256400, 123456] }, { points: [654321, 123456] }],
        };

        const response = validationService.validate(ioObj);
        done();
        expect(response.diff).to.eql([{ points: [654321, 123456] }]);
    });

    it('should return the same differences remaining if difference is incorrect', (done: Mocha.Done) => {
        const ioObj = {
            pos: { x: 100, y: 100 },
            diff: [{ points: [256400, 123456] }, { points: [100001, 111111] }],
        };

        const response = validationService.validate(ioObj);
        done();
        expect(response.diff).to.eql([{ points: [256400, 123456] }, { points: [100001, 111111] }]);
    });

    it('validate should return a validation object with validation set to false if no differences are found', () => {
        const ioObj = {
            pos: { x: 100, y: 100 },
        };
        const response = validationService.validate(ioObj);
        expect(response.validation).to.false;
    });

});
