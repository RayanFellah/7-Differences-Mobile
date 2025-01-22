import { IStack } from '@app/interfaces/i-stack';

export class Stack implements IStack {
  storage: any[] = [];

  push(item: any): void {
    this.storage.push(item);
  }

  pop(): any | undefined {
    return this.storage.pop();
  }

  peek(): any {
    return this.storage[this.size() - 1];
  }

  size(): any {
    return this.storage.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }
}
// code from https://dev.to/glebirovich/typescript-data-structures-stack-and-queue-hld
