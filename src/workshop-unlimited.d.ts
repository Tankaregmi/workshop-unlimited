// Types here should match the
// server-side types if present



// Util types


// Unwraps Promises and .then()-able objects
type Await<T> = T extends PromiseLike<infer U> ? U : T;

// Tuple<string, 3> translates into [string, string, string]
type Tuple <Item, Len extends number, Arr extends Item[] = []> = (
  Arr['length'] extends Len
  ? Arr
  : Tuple<Item, Len, [Item, ...Arr]>
);
