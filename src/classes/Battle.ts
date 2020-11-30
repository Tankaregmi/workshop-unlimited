import LocalStorageM from '../managers/LocalStorageManager';
import BattlePlayerData from './BattlePlayerData';
import { arrayRandomItem } from '../utils/arrayRandom';
import { Mech } from '../managers/MechSavesManager';


interface BattleArguments {
  mechs: [Mech, Mech];
  positions?: [number, number];
  turnOwnerIndex: 0 | 1;
  multiplayer: boolean;
  onUpdate?: () => any;
}


export default class Battle
{
  logs: [string, string][] = [];  
  turns = 1;
  turnOwnerIndex = 0;
  activeAI = !LocalStorageM.getSettings().control_opponent_mech;
  multiplayer: boolean;
  over = false;
  victory = false;
  quit = false;
  players: [BattlePlayerData, BattlePlayerData];
  onUpdate: () => any;

  constructor (args: BattleArguments) {

    const presetPositions = [[4, 5], [3, 6], [2, 7]];

    const {
      mechs,
      positions = arrayRandomItem(presetPositions),
      multiplayer,
      turnOwnerIndex = 0,
      onUpdate = () => {},
    } = args;

    this.players = [
      new BattlePlayerData(mechs[0], this, positions[0]),
      new BattlePlayerData(mechs[1], this, positions[1])
    ];

    this.multiplayer = multiplayer;
    this.turnOwnerIndex = turnOwnerIndex;
    this.onUpdate = onUpdate;
  }
}
