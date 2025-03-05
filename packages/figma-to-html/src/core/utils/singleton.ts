export type Constructor<P = any, T = any> = new (options?: P) => T;

export type InstanceType<T extends Constructor<any>> = T extends new (
  ...args: any[]
) => infer R
  ? R
  : never;

export const singleton = <P, T extends Object>(
  ClassConstructor: Constructor<P, T>
): Constructor<P, T> => {
  let ins: InstanceType<typeof ClassConstructor>;
  return new Proxy(ClassConstructor, {
    construct(target, arg) {
      if (ins) {
        return ins;
      }
      return (ins = new target(...arg));
    },
  });
};
