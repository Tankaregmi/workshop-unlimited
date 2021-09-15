import BattleUtils from "./BattleUtils";
import Battle from "./Battle";
import BattleEventHandlers from "./BattleEventHandlers";
import { cloneDeep } from "lodash";



// Types

export interface BattleEvent {
	name: keyof typeof BattleEventHandlers;
	weaponIndex?: number;
	damageDealt?: number;
	movingPosition?: number;
	doubleCooldown?: boolean;
}



// Data

let onUpdate: null | ((battle: Battle) => void);

const eventsWhichCostTurns: BattleEvent['name'][] = [
  'drone_toggle', 'stomp', 'cooldown', 'use_weapon',
  'charge_engine', 'grappling_hook', 'teleport', 'walk',
];



// Private Functions


function log (
  battle: Battle,
  type: Battle['logs'][number]['type'],
  message: string
): void {

  const playerID = battle.turnOwnerID;

  battle.logs.push({ playerID, type, message });

}


function switchTurnOwner (battle: Battle): void {

  const { attacker } = BattleUtils.getAttackerAndDefender(battle);
  const { eneCap, energy, eneReg } = attacker.stats;

	attacker.usedInTurn = [];
	attacker.stats.energy = Math.min(eneCap, energy + eneReg);


	battle.turns = 2;

	battle.turnOwnerID = (
    battle.turnOwnerID === battle.p1.id
    ? battle.p2.id
    : battle.p1.id
  );

}


function spendTurn (battle: Battle): void {

  battle.turns--;

  if (battle.turns === 0) {
    switchTurnOwner(battle);
  }

}


function logEvent (battle: Battle, oldBattle: Battle, event: BattleEvent): void {

  const {
    attacker,
    defender
  } = BattleUtils.getAttackerAndDefender(battle);

  const {
    attacker: oldAttacker,
    defender: oldDefender
  } = BattleUtils.getAttackerAndDefender(oldBattle);

  switch (event.name) {

    case 'cooldown': {
      const heat = attacker.stats.heat - oldAttacker.stats.heat;
      const double = heat > attacker.stats.heaCol ? 'double ' : '';
      log(battle, 'action', `${attacker.name} ${double}cooled down! (${heat} heat)`);
      break;
    }

    case 'walk': {
      const legs = attacker.items[1];
      log(battle, 'action', `${attacker.name} moved from position ${oldAttacker.position} to ${attacker.position} using ${legs!.name}!`);
      break;
    }

    case 'stomp': {
      const damage = oldDefender.stats.health - defender.stats.health;
      log(battle, 'action', `${attacker.name} stomped! (${damage} damage)`);
      break;
    }

    case 'use_weapon': {
      const weapon = attacker.items[event.weaponIndex!];
      const damage = oldDefender.stats.health - defender.stats.health;
      log(battle, 'action', `${attacker.name} used ${weapon!.name}! (${damage} damage)`);
      break;
    }

    case 'drone_toggle': {
      const state = attacker.droneActive ? 'enabled' : 'disabled';
      log(battle, 'action', `${attacker.name} ${state} drone!`);
      break;
    }

    case 'drone_fire': {
      const drone = attacker.items[8];
      const damage = oldDefender.stats.health - defender.stats.health;
      log(battle, 'info', `${attacker.name}'s drone ${drone!.name} fired! (${damage} damage)`);
      break;
    }

    case 'charge_engine': {
      const charge = attacker.items[9];
      const damage = oldDefender.stats.health - defender.stats.health;
      log(battle, 'action', `${attacker.name} charged with ${charge!.name}! (${damage} damage)`);
      break;
    }

    case 'teleport': {
      const tele = attacker.items[10];
      const damage = oldDefender.stats.health - defender.stats.health;
      log(battle, 'action', `${attacker.name} teleported from position ${oldAttacker.position} to ${attacker.position} using ${tele!.name}! (${damage} damage)`);
      break;
    }

    case 'grappling_hook': {
      const hook = attacker.items[11];
      const damage = oldDefender.stats.health - defender.stats.health;
      log(battle, 'action', `${attacker.name} hooked ${defender.name} from position ${oldDefender.position} to ${defender.position} using ${hook!.name}! (${damage} damage)`);
      break;
    }

  }
}


function updateBattle (battle: Battle): void {
  if (onUpdate) {
    onUpdate(battle);
  }
}



// Public Functions

function handleEvent (battle: Battle, event: BattleEvent): void {

  console.log(event.name);

  if (battle.turns < 1) {
    return;
  }


  // Execute action

  const oldBattle = cloneDeep(battle);

  try {
    // checkEvent(battle, event); TODO: Implement this to check if the event is valid
    BattleEventHandlers[event.name](battle, event);
  } catch (err) {
    log(battle, 'error', err.message);
    return;
  }


  // Log event

  logEvent(battle, oldBattle, event);


  // Take care of spending turns

  if (eventsWhichCostTurns.includes(event.name)) {
    spendTurn(battle);
  }


  // Check if battle completed

	if (battle.p1.stats.health <= 0 || battle.p2.stats.health <= 0) {

    const winnerID = battle.p1.stats.health <= 0 ? battle.p2.id : battle.p1.id;

    setBattleComplete(battle, winnerID);
    log(battle, 'info', 'Battle complete!');
    updateBattle(battle);

    return;

	}


  // Check if new turn owner has to cooldown

  const { attacker } = BattleUtils.getAttackerAndDefender(battle);
  const { heat, heaCap, heaCol } = attacker.stats;

  if (heat > heaCap) {

    const doubleCooldown = heaCol < heat - heaCap;

    handleEvent(battle, { name: 'cooldown', doubleCooldown });

    if (doubleCooldown) {
      switchTurnOwner(battle);
    } else {
      spendTurn(battle);
    }

  }


  updateBattle(battle);

}


function setBattleComplete (battle: Battle, winnerID: string, quit: boolean = false): void {
	battle.complete = { winnerID, quit };
  updateBattle(battle);
}


function setOnUpdate (fn: typeof onUpdate): void {
  onUpdate = fn;
}



// Exports

const BattleManager = {
	setBattleComplete,
	handleEvent,
  setOnUpdate,
};

export default BattleManager;
