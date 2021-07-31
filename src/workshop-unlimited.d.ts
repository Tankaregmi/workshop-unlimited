// Types here should match the
// server-side types if present




// Types related to Workshop Unlimited


interface EssentialItemData {
  id: number;
  name: string;
  type: string;
  stats: { [string]: number | [number, number] };
  tags: string[];
}




// Util types


// Unwraps Promises and .then()-able objects
type Await<T> = T extends PromiseLike<infer U> ? U : T;

// Tuple<string, 3> translates into [string, string, string]
type Tuple <Item, Len extends number, Arr extends Item[] = []> = (
  Arr['length'] extends Len
  ? Arr
  : Tuple<Item, Len, [Item, ...Arr]>
);
