export type Constructor<T = any, P = any> = new (options?: P) => T;

export type InstanceType<T extends Constructor<any>> = T extends new (
  ...args: any[]
) => infer R
  ? R
  : never;

export const singleton = <T extends Object>(
  ClassConstructor: Constructor<any, T>
): Constructor<any, T> => {
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
