import { Record, Number, String, Union, Array, Literal, Optional } from 'runtypes';
import ItemStats_runtype from './item-stats';


const ItemTypes_runtype = Union(
  Literal('TORSO'),
  Literal('LEGS'),
  Literal('SIDE_WEAPON'),
  Literal('TOP_WEAPON'),
  Literal('DRONE'),
  Literal('CHARGE_ENGINE'),
  Literal('TELEPORTER'),
  Literal('GRAPPLING_HOOK'),
  Literal('MODULE')
);

const ItemElements_runtype = Union(
  Literal('PHYSICAL'),
  Literal('EXPLOSIVE'),
  Literal('ELECTRIC'),
  Literal('COMBINED')
);

const Vector_runtype = Record({
  x: Number,
  y: Number
});


export default Record({

  id: Number,
  name: String,
  image: String,
  type: ItemTypes_runtype,
  element: ItemElements_runtype,
  stats: ItemStats_runtype,
  transform_range: String,

  attachment: Optional(
    Union(
      Vector_runtype,
      Record({
        leg1: Vector_runtype,
        leg2: Vector_runtype,
        side1: Vector_runtype,
        side2: Vector_runtype,
        side3: Vector_runtype,
        side4: Vector_runtype,
        top1: Vector_runtype,
        top2: Vector_runtype,
      })
    )
  ),

  tags: Optional(
    Array(Union(
      Literal('unreleased'),
      Literal('custom'),
      Literal('melee')
    ))
  ),

});
