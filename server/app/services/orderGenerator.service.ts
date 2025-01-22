import { Service } from 'typedi';

@Service()
export class OrderGeneratorService {
    generateOrder(length: number) {
        const order: number[] = [...Array(length).keys()];
        return order.sort(() => Math.random() - 0.5)
    }
}
