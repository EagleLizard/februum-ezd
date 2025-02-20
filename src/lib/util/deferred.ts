
export class Deferred<T = void> {
  private constructor(
    public promise: Promise<T>,
    public resolve: (val: T | PromiseLike<T>) => void,
    public reject: (reason?: unknown) => void,
  ) {}

  static init<K = void>(): Deferred<K> {
    let resolver: (val: K | PromiseLike<K>) => void;
    let rejecter: (reason?: unknown) => void;
    resolver = () => {
      return; //noop
    };
    rejecter = () => {
      return; //noop
    };
    let promise = new Promise<K>((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
    return new Deferred(
      promise,
      resolver,
      rejecter,
    );
  }
}
