import { Stack } from './stack';

describe('Stack', () => {
    const stack = new Stack();

    it('push should correctly push item', () => {
        stack.push(1);
        expect(stack.peek()).toBe(1);
    });
    it('pop should correctly pop item', () => {
        stack.push(1);
        stack.push(2);
        expect(stack.pop()).toBe(2);
    });
    it('peek should correctly peek item', () => {
        stack.push(1);
        stack.push(2);
        expect(stack.peek()).toBe(2);
    });
    it('isEmpty should correctly check if stack is empty', () => {
        stack.push(1);
        expect(stack.isEmpty()).toBe(false);
    });
    it('size should correctly return size of stack', () => {
        stack.push(1);
        stack.push(2);
        expect(stack.size()).toBe(2);
    });

    afterEach(() => {
        while (!stack.isEmpty()) {
            stack.pop();
        }
    });
});
