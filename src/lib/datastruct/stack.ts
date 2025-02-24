
export class Stack<T> {
  arr: T[];
  constructor() {
    this.arr = [];
  }
  push(val: T) {
    return this.arr.push(val);
  }
  pop(): T | undefined {
    return this.arr.pop();
  }
  peek(n = 0): T | undefined {
    return this.arr[this.len() - (n + 1)];
  }
  len(): number {
    return this.arr.length;
  }
  clear() {
    this.arr.length = 0;
  }
}
