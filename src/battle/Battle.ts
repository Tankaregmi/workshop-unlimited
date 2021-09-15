import BattlePlayerData, { BattleStartPlayerData } from './BattlePlayerData';


export interface BattleStartData {
  online: boolean;
  // playerID: string;
  starterID: string;
  p1: BattleStartPlayerData;
  p2: BattleStartPlayerData;
}


export default class Battle {

  logs = [] as {
    playerID: string;
    message: string;
    type: 'action' | 'info' | 'error';
  }[];

  readonly online: boolean;
  turnOwnerID: string;
  // readonly playerID: string;
  readonly p1: BattlePlayerData;
  readonly p2: BattlePlayerData;
  droneFired: boolean = false;
  turns = 1;
  complete: {
    winnerID: string;
    quit: boolean;
  } | null = null;


  constructor (data: BattleStartData) {

    this.online = data.online;
    this.turnOwnerID = data.starterID;
    // this.playerID = data.playerID;
    this.p1 = new BattlePlayerData(data.p1);
    this.p2 = new BattlePlayerData(data.p2);

  }

}
