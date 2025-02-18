export type Constructor<T> = new (...args: any[]) => T;

export const singleton = <T extends Object>(
  className: Constructor<T>
): Constructor<T> => {
  let ins: any;
  return new Proxy(className, {
    construct(target, arg) {
      if (ins) {
        return ins;
      }
      return (ins = new target(...arg));
    },
  });
};
