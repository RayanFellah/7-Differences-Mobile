export interface IStack {
    push(item: number): void;
    pop(): number | undefined;
    peek(): number;
    size(): number;
}
// code from https://dev.to/glebirovich/typescript-data-structures-stack-and-queue-hld
