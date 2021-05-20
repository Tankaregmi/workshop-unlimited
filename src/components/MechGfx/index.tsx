import React from 'react';
import { Item, TorsoAttachment } from '../../managers/ItemsManager';
import Vector2 from '../../utils/Vector2';

import './styles.css';


interface MechGfxParams extends React.HTMLProps<HTMLDivElement> {
  setup: (Item | null)[];
  droneActive?: boolean;
  scale?: number;
  outline?: boolean;
}

interface PartData {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  zIndex: number;
  item: Item;
}


const partNames = ['torso', 'leg1', 'leg2', 'side1', 'side2', 'side3', 'side4', 'top1', 'top2', 'drone'];
const preAttachedPartsNames = ['torso', 'leg1', 'drone'];
const zIndexes = [5, 6, 4, 8, 1, 9, 2, 7, 3, 0];


function getScale (width = window.innerWidth, height = window.innerHeight): number {
  const dif = Math.abs(width - height);
  return Math.sqrt(width + height - dif) / 50;
}


const MechGfx: React.FC<MechGfxParams> = props => {

  const {
    setup,
    droneActive = true,
    scale = 1,
    outline = false,
    style = {},
    ...rest
  } = props;

  const finalScale = getScale() * scale;


  // Just don't render anything if the setup doesn't have a torso
  if (setup[0] === null) {
    return null;
  }


  // We only need the first 9 items, disposing
  // of the items which are not visible in a mech
  const usableSetup = setup.slice(0, 9);

  if (!droneActive) {
    usableSetup.splice(8, 1, null);
  }

  usableSetup.splice(2, 0, setup[1]); // We also need two legs

  const partsData: (PartData | null)[] = usableSetup.map((item, i) => item && {
    x: 0,
    y: 0,
    width: item.image.width,
    height: item.image.height,
    name: partNames[i],
    zIndex: zIndexes[i],
    item
  });

  const leg1 = partsData[1];
  const torso = partsData[0] as PartData; // We definitely have data here
  const drone = partsData[9];

  const torsoAttachment = torso.item.attachment as TorsoAttachment;


  if (!leg1) {
    torso.x = -torso.width / 2;
    torso.y = -torso.height;

  } else {
    const legAttachment = leg1.item.attachment as Vector2;

    leg1.x = (-leg1.width - (torsoAttachment.leg2.x - torsoAttachment.leg1.x)) / 2;
    leg1.y = -leg1.height;

    torso.x = leg1.x + (legAttachment.x - torsoAttachment.leg1.x);
    torso.y = leg1.y + (legAttachment.y - torsoAttachment.leg1.y);
  }


  // If has drone, set drone position. We
  // don't use attachment points for that
  if (drone) {
    drone.x = torso.x - drone.width - 50;
    drone.y = torso.y - drone.height / 2;
  }


  // Now we set the position of every other part
  for (let i = 2; i < partsData.length; i++) {

    const data = partsData[i];

    if (data === null) {
      continue; // No item equipped
    }

    if (preAttachedPartsNames.includes(data.name)) {
      continue; // Already attached
    }

    const partAttachment = data.item.attachment as Vector2;
    const partName = data.name as keyof TorsoAttachment;

    data.x = torso.x + (torsoAttachment[partName].x - partAttachment.x);
    data.y = torso.y + (torsoAttachment[partName].y - partAttachment.y);
  }


  const notNullPartsData = partsData.filter(data => data !== null) as PartData[];


  return (
    <div
      { ...rest }
      className="mech-gfx"
      style={{
        transform: `scale(${ finalScale })`,
        ...style
      }}>

      {notNullPartsData.map((data, i) =>
        <div
          key={ data.item.name + i }
          style={{
            left:   data.x + 'px',
            top:    data.y + 'px',
            zIndex: data.zIndex,
            filter: outline ? 'undefined' : 'none'
          }}>
          <img
            src={ data.item.image.url }
            alt={ data.item.name }
            style={{
              width: data.width,
              height: data.height
            }}
          />
        </div>
      )}

    </div>
  );
};


export default MechGfx;
