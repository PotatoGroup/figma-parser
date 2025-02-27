export type Constructor<T = any> = new (...args: any[]) => T;

export type InstanceType<T extends Constructor> = T extends new (...args: any[]) => infer R ? R : never;

export const singleton = <T extends Object>(
  className: Constructor<T>
): Constructor<T> => {
  let ins: T;
  return new Proxy(className, {
    construct(target, arg) {
      if (ins) {
        return ins;
      }
      return (ins = new target(...arg));
    },
  });
};
