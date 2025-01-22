import { expect } from "chai";
import { OrderGeneratorService } from "./orderGenerator.service";

describe('OrderGeneratorService', () => {
    let orderGeneratorService: OrderGeneratorService = new OrderGeneratorService();

    describe('generateOrder', () => {
        it('should return an array of the correct length', () => {
            const length = 5;
            const order = orderGeneratorService.generateOrder(length);
            expect(order.length).to.equal(length);
        });

        it('should return an array of numbers', () => {
            const length = 5;
            const order = orderGeneratorService.generateOrder(length);
            expect(order.every((number) => typeof number === 'number')).to.be.true;
        });

        it('should return an array of numbers between 0 and length - 1', () => {
            const length = 5;
            const order = orderGeneratorService.generateOrder(length);
            expect(order.every((number) => number >= 0 && number < length)).to.be.true;
        });
    });
});