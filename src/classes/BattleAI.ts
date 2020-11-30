import Battle from '../classes/Battle';
import { ItemAndIndex } from '../classes/BattlePlayerData';
import BattleM from '../managers/BattleManager';
import { arrayRandomItem } from '../utils/arrayRandom';

class BattleAI
{
  static think (battle: Battle): void {

    const { attacker } = BattleM.getPlayers(battle);

    const usableWeapons = attacker.weapons.filter(([_, i]) => BattleM.canPlayerUse(battle, i).can);

    if (usableWeapons.length) {
      const itemIndex = arrayRandomItem<ItemAndIndex>(usableWeapons)[1];
      BattleM.executeAction(battle, 'fire', { itemIndex });
    } else {
      BattleM.executeAction(battle, 'stomp');
    }

  }
}

export default BattleAI;
