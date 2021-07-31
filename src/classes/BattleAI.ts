import BattleUtils from '../battle/BattleUtils';
import Battle from '../classes/Battle';
import { BattleEvent } from '../managers/BattleManager';
import _ from 'lodash';



// Functions

function think (battle: Battle): BattleEvent {

  const { attacker, defender } = BattleUtils.getAttackerAndDefender(battle);

  // Drone
  if (attacker.items[8] && !attacker.droneActive) {
    return { name: 'drone_toggle' };
  }

  { // Weapons
    const usableWeapons = BattleUtils.getUsableWeapons(battle);
    const pick = _.sample(usableWeapons);

    if (pick) {
      return { name: 'use_weapon', weaponIndex: pick[1] };
    }
  }

  { // Stomp

    const legsIndex = 1;

    if (BattleUtils.canPlayerUseItem(battle, legsIndex).can) {
      return { name: 'use_weapon', weaponIndex: legsIndex };
    }

  }

  // Can't stomp or use any weapon, time to
  // check if it can use any weapon by moving

  if (battle.turns > 1) {

    const weapons = BattleUtils.getUsableWeapons(battle, ['range']);

    if (weapons.length) {

      const plot = weapons.reduce((plotSum, b) => {

        const index = b[1];
        const plot = BattleUtils.getItemRangePlot(battle, index);

        return plot.map((x, i) => plotSum[i] || x);

      }, [] as boolean[]);


      const posFromRangePlot = (plot: boolean[]) => {
        return plot.reduce((positions, inRange, position) => {
          return inRange ? [...positions, position] : positions;
        }, [] as number[]);
      }


      const positionsInRange = posFromRangePlot(plot);
      const positionsReachable = posFromRangePlot(BattleUtils.getWalkablePositions(battle));

      const positionsThatPutOpponentInRange = positionsInRange.map(position => {
        return attacker.position - (position - defender.position);
      }).filter(position => position <= 10 && position >= 0);

      const positionsReachableThatPutOpponentInRange = positionsReachable.filter(position => {
        return positionsThatPutOpponentInRange.includes(position);
      });


      // Try to walk to put opponent in range
      if (positionsReachableThatPutOpponentInRange.length) {
        return { name: 'walk', movingPosition: _.sample(positionsReachableThatPutOpponentInRange) };
      }


      // Can't walk anywhere that would put some weapon
      // in range, we see if using specials would help

      const hasRange1Weapon = (
        positionsInRange.includes(attacker.position - 1) ||
        positionsInRange.includes(attacker.position + 1)
      );

      // Try charge engine
      if (BattleUtils.canPlayerUseItem(battle, 9).can) { // 9 is the Charge Engine index

        const opponentOnCorner = [0, 9].includes(defender.position);
        const hasRange2Weapon = (
          positionsInRange.includes(attacker.position - 2) ||
          positionsInRange.includes(attacker.position + 2)
        );

        if ((opponentOnCorner && hasRange1Weapon)
         || (!opponentOnCorner && hasRange2Weapon)) {
          return { name: 'charge_engine' };
        }
      }

      // Try grappling hook
      if (BattleUtils.canPlayerUseItem(battle, 11).can) { // 11 is the Grapplinh Hook index
        if (hasRange1Weapon) {
          return { name: 'grappling_hook' };
        }
      }

      // Try teleporter
      if (BattleUtils.canPlayerUseItem(battle, 10).can) { // 10 is the Teleporter index
        return {
          movingPosition: _.sample(positionsThatPutOpponentInRange),
          name: 'teleport',
        };
      }

    }
  }


  return { name: 'cooldown', doubleCooldown: false };

}



// Exports

const BattleAI = { think };

export default BattleAI;
