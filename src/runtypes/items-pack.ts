import { Record, String, Partial, Array } from 'runtypes';
import Item_runtype from './item';

export default Record({

  config: Record({
    key: String,
    name: String,
    description: String
  }).And(Partial({
    base_url: String
  })),

  items: Array(Item_runtype)

});
