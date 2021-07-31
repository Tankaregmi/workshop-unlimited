import Battle from '../classes/Battle';
import { Mech } from './MechSavesManager';

class DataManager
{
  battle: Battle | null = null;
  opponent: Mech | null = null;
  turnOwnerID = '';

  getBattle (): Battle {
    if (this.battle) {
      return this.battle;
    }
    throw new TypeError(`No battle`);
  }
}

export default new DataManager();
