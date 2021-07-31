import GetImageData from '../utils/GetImageData';
import LocalStorageManager from './LocalStorageManager';
import { MechSetup } from './MechSavesManager';
import rawStatsData, { StatInstruction } from '../data/stats';
import Item from '../classes/Item';



// Types

type StatInstructionWithImage = StatInstruction & {
  imageURL: string;
}

type MechStatKey =
  'weight' | 'health' | 'eneCap' | 'eneReg' | 'heaCap' | 'heaCol'
  | 'phyRes' | 'expRes' | 'eleRes' | 'bulletsCap' | 'rocketsCap';

// Stats which are number
type ItemNumberStatKey =
  MechStatKey |
  'phyResDmg' | 'expResDmg' | 'heaDmg'  | 'heaCapDmg' |
  'heaColDmg' | 'eleResDmg' | 'eneDmg'  | 'eneCapDmg' |
  'eneRegDmg' | 'walk'      | 'jump'    | 'push'      |
  'pull'      | 'recoil'    | 'advance' | 'retreat'   |
  'uses'      | 'backfire'  | 'heaCost' | 'eneCost'   |
  'bulletsCost' | 'rocketsCost';

// Stats which are [number, number]
type ItemTupleStatKey = 'phyDmg' | 'expDmg' | 'eleDmg' | 'range';

// General stats
export type ItemStatKey = MechStatKey | ItemNumberStatKey | ItemTupleStatKey;

export type ItemStats = {
  [K in ItemNumberStatKey | ItemTupleStatKey]?: K extends ItemNumberStatKey ? number : [number, number];
};

type MechStats = {
  [key in MechStatKey]?: number;
};


// Data

const stats = {} as Record<ItemStatKey, StatInstructionWithImage>;

const mechStatsKeys: MechStatKey[] = [
  'weight', 'health', 'eneCap',
  'eneReg', 'heaCap', 'heaCol',
  'phyRes', 'expRes', 'eleRes'
];



// Functions

function loadStatImages (): Promise<void> {
  return new Promise(resolve => {

    let loadedStatsCount = 0;
    const baseURL = 'https://raw.githubusercontent.com/ctrl-raul/workshop-unlimited/master/src/assets/images/stats/';


    const loadStat = (instruction: StatInstruction) => {
      GetImageData.base64(baseURL + instruction.key + '.svg', 70)
        .then(imageData => {
          stats[instruction.key] = { ...instruction, imageURL: imageData.url };
        })
        .catch(() => {
          // TODO: Make the app actually care
          // if some stat image fail to load
        })
        .finally(() => {
          loadedStatsCount++;
          if (loadedStatsCount === rawStatsData.length) {
            resolve();
          }
        });
    }


    for (const instruction of rawStatsData) {
      loadStat(instruction);
    }

  });
}


function getMechSummary (items: MechSetup): MechStats {

  const sum: MechStats = {};

  for (const item of items) {

    if (item === null) {
      continue;
    }

    for (const key of mechStatsKeys) {

      const value = item.stats[key] || 0;
      const current = sum[key];

      sum[key] = typeof current === 'undefined' ? value : current + value;

    }

  }


  // Do health penalty due to overweight
  if (sum.weight) {

    const maxWeight = 1000;
    const healthPenaltyForWeight = 15;

    if (sum.weight > maxWeight) {
      const penalty = (sum.weight - maxWeight) * healthPenaltyForWeight;
      sum.health = (sum.health || 0) - penalty;
    }
  }


  return sum;
}


function getStats (source: Item | MechSetup, forceBuffs = false): ItemStats | MechStats {

  let shouldBuffHealth = false;

  const stats: ItemStats = (
    Array.isArray(source)
    ? (shouldBuffHealth = true) && getMechSummary(source)
    : Object.assign({}, source.stats)
  );

  const { arena_buffs } = LocalStorageManager.getSettings();

  if (arena_buffs || forceBuffs) {
    
    const buffFunctions = {
      add: (x: number, amount: number) => x + amount,
      mul: (x: number, amount: number) => x * amount
    };

    const keys = Object.keys(stats) as ItemStatKey[];

    for (const key of keys) {

      const value = stats[key];

      if (!value || (key === 'health' && !shouldBuffHealth)) {
        continue;
      }

      const statTemplate = rawStatsData.find(data => data.key === key);

      if (!statTemplate) {
        console.error(`Unknown stat '${key}'`);
        continue;
      }

      if (statTemplate.buff) {

        const { buff } = statTemplate;
        const buffFunction = buffFunctions[buff.mode];

        if (Array.isArray(value)) {
          // @ts-ignore
          stats[key] = value.map(x => Math.round(
            buffFunction(x, buff.amount)
          ));
        } else {
          // @ts-ignore
          stats[key] = Math.round(
            buffFunction(value, buff.amount)
          );
        }
      }
    }
  }

  return stats;
}


function getStatInstruction (key: ItemStatKey): StatInstructionWithImage {
  if (stats[key]) {
    return stats[key];
  }
  throw new Error(`Stat '${key}' did not load or doesn't exist.`);
}


// Exports

const StatsManager = {
  loadStatImages,
  getMechSummary,
  getStats,
  getStatInstruction,
};

export default StatsManager;
