export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Keys extends any
  ? Omit<Partial<T>, Keys> & Required<Pick<T, Keys>>
  : never;
