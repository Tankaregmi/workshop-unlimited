import BattlePlayerData, { BattleStartPlayerData } from './BattlePlayerData';


export interface BattleStartData {
  online: boolean;
  starterID: string;
  player: BattleStartPlayerData;
  opponent: BattleStartPlayerData;
}


export default class Battle {

  public logs: { color: string, message: string }[] = [];
  public readonly online: boolean;
  public turnOwnerID: string;
  public readonly player: BattlePlayerData;
  public readonly opponent: BattlePlayerData;
  public turns = 1;
  public complete: {
    victory: boolean;
    quit: boolean;
  } | null = null;


  constructor (data: BattleStartData) {

    this.online = data.online;
    this.turnOwnerID = data.starterID;
    this.player = new BattlePlayerData(data.player);
    this.opponent = new BattlePlayerData(data.opponent);

  }

}
