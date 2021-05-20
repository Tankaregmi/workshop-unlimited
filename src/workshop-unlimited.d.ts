// Unwraps Promises and .then()-able objects
type Await<T> = T extends PromiseLike<infer U> ? U : T;