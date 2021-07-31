import StatsM from '../managers/StatsManager';
import ItemsManager from '../managers/ItemsManager';
import Item from './Item';


export interface BattleStartPlayerData {
  id: string;
  name: string;
  setup: number[];
  position: number;
}


export default class BattlePlayerData {

  public readonly name: string;
  public readonly id: string;

  public readonly weapons: [Item, number][];
  public readonly specials: [Item, number][];

  public readonly items: (Item | null)[];
  public position: number;
  public uses: number[];
  public usedInTurn: number[] = [];
  public droneActive = false;

  public stats: {
    health: number,
    healthCap: number,
    energy: number,
    eneCap: number,
    eneReg: number,
    heat: number,
    heaCap: number,
    heaCol: number,
    phyRes: number,
    expRes: number,
    eleRes: number
  };

  constructor (data: BattleStartPlayerData) {

    const items = ItemsManager.ids2items(data.setup);
    const statsMap = StatsM.getStats(items, true);

    const {
      health = 1, eneCap = 1, eneReg = 1, heaCap = 1,
      heaCol = 1, phyRes = 0, expRes = 0, eleRes = 0,
    } = statsMap;

    const itemsAndIndexes = items.map((item, i) => item ? [item, i] as const : null);

    this.name = data.name;
    this.id = data.id;

    // @ts-ignore
    this.weapons = itemsAndIndexes.slice(2, 8).filter(x => x !== null);
    // @ts-ignore
    this.specials = itemsAndIndexes.slice(8, 12).filter(x => x !== null);

    this.position = data.position;
    this.items = items;
    this.uses = this.items.map(item => item && item.stats.uses ? item.stats.uses : Infinity);

    this.stats = {
      healthCap: health,
      health: health,
      eneCap: eneCap,
      energy: eneCap,
      eneReg: eneReg,
      heaCap: heaCap,
      heat: 0,
      heaCol: heaCol,
      phyRes: phyRes,
      expRes: expRes,
      eleRes: eleRes
    };
  }
}
