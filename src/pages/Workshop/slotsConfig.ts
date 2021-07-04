import { ReactComponent as torsoImg  } from '../../assets/images/slots/torso.svg';
import { ReactComponent as legsImg   } from '../../assets/images/slots/legs.svg';
import { ReactComponent as sideLImg  } from '../../assets/images/slots/side-l.svg';
import { ReactComponent as sideRImg  } from '../../assets/images/slots/side-r.svg';
import { ReactComponent as topLImg   } from '../../assets/images/slots/top-l.svg';
import { ReactComponent as topRImg   } from '../../assets/images/slots/top-r.svg';
import { ReactComponent as droneImg  } from '../../assets/images/slots/drone.svg';
import { ReactComponent as chargeImg } from '../../assets/images/slots/charge.svg';
import { ReactComponent as teleImg   } from '../../assets/images/slots/tele.svg';
import { ReactComponent as hookImg   } from '../../assets/images/slots/hook.svg';
import { ReactComponent as modImg    } from '../../assets/images/slots/mod.svg';


type SlotConfig = [string, React.FC<React.SVGProps<SVGSVGElement>>];


const parts: SlotConfig[] = [
  // Parts of the mech which are visible
  ['TORSO',       torsoImg],
  ['LEGS',        legsImg],
  ['SIDE_WEAPON', sideLImg],
  ['SIDE_WEAPON', sideRImg],
  ['SIDE_WEAPON', sideLImg],
  ['SIDE_WEAPON', sideRImg],
  ['TOP_WEAPON',  topLImg],
  ['TOP_WEAPON',  topRImg],
  ['DRONE',       droneImg]
];

const specials: SlotConfig[] = [
  ['CHARGE_ENGINE',  chargeImg],
  ['TELEPORTER',     teleImg],
  ['GRAPPLING_HOOK', hookImg],
];

const modules: SlotConfig[] = [
  ['MODULE', modImg],
  ['MODULE', modImg],
  ['MODULE', modImg],
  ['MODULE', modImg],
  ['MODULE', modImg],
  ['MODULE', modImg],
  ['MODULE', modImg],
  ['MODULE', modImg]
];


const slotsConfig = { parts, specials, modules };


export default slotsConfig;
