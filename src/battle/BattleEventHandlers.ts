import Item from "../classes/Item";
import Battle from "./Battle";
import { BattleEvent } from "./BattleManager";
import BattleUtils from "./BattleUtils";



// Utils

function deal_damages (battle: Battle, itemIndex: number, damage?: number): number {


	if (typeof damage === 'undefined') {
		damage = BattleUtils.getDamageToDeal(battle, itemIndex);
	}


	// Returns the total damage dealt

	const { attacker, defender } = BattleUtils.getAttackerAndDefender(battle);
	const item = attacker.items[itemIndex] as Item;

	const statElement = item.element.substring(0, 3).toLowerCase();
	
	const resStatKey = statElement + 'Res' as 'phyRes' | 'expRes' | 'eleRes';
	const resStatDmgKey = resStatKey + 'Dmg' as 'phyResDmg' | 'expResDmg' | 'eleResDmg';


	/// Effects on attacker
	attacker.stats.health -= item.stats.backfire || 0;
	attacker.stats.heat += item.stats.heaCost || 0;
	attacker.stats.energy -= item.stats.eneCost || 0;


	/// Effects on defender

	defender.stats.health -= damage;
	defender.stats.heat += item.stats.heaDmg || 0;
	defender.stats[resStatKey] -= item.stats[resStatDmgKey] || 0;

	// Heat capacity damage
	if (item.stats.heaCapDmg) {
		defender.stats.heaCap = Math.max(1, defender.stats.heaCap - item.stats.heaCapDmg);
	}

	// Heat cooling damage
	if (item.stats.heaColDmg) {
		defender.stats.heaCol = Math.max(1, defender.stats.heaCol - item.stats.heaColDmg);
	}

	// energy damage
	if (item.stats.eneDmg) {
		defender.stats.energy = Math.max(0, defender.stats.energy - item.stats.eneDmg || 0);
	}

	// energy capacity damage
	if (item.stats.eneCapDmg) {
		defender.stats.eneCap = Math.max(1, defender.stats.eneCap - item.stats.eneCapDmg);
		defender.stats.energy = Math.min(defender.stats.eneCap, defender.stats.energy);
	}

	// energy regeneration damage
	if (item.stats.eneRegDmg) {
		defender.stats.eneReg = Math.max(1, defender.stats.eneReg - item.stats.eneRegDmg);
	}


	update_positions(battle, itemIndex);


	return damage;
}


function count_item_usage (battle: Battle, itemIndex: number): void {

	const { attacker } = BattleUtils.getAttackerAndDefender(battle);

	attacker.uses[itemIndex]--;
	attacker.usedInTurn.push(itemIndex);

}


function update_positions (battle: Battle, itemIndex: number): void {

	const { attacker, defender } = BattleUtils.getAttackerAndDefender(battle);
	const item = attacker.items[itemIndex] as Item;
	const dir = attacker.position < defender.position ? 1 : -1;

	// Movements on attacker

	if (item.stats.recoil) {
		attacker.position = Math.max(0, Math.min(9, attacker.position - item.stats.recoil * dir));
	}

	if (item.stats.retreat) {
		attacker.position -= item.stats.retreat * dir;
	}

	if (item.stats.advance) {
		attacker.position = (
			attacker.position * dir + item.stats.advance < defender.position * dir
			? attacker.position + item.stats.advance * dir
			: defender.position - dir
		);
	}

	// Movements on defender

	if (item.stats.push) {
		defender.position = Math.max(0, Math.min(9, defender.position + item.stats.push * dir));
	}

	if (item.stats.pull) {
		defender.position = (
			defender.position * dir - item.stats.pull > attacker.position * dir
			? defender.position - item.stats.pull * dir
			: attacker.position + dir
		);
	}
}



// Functions

function drone_toggle (battle: Battle): void {
	
	const { attacker } = BattleUtils.getAttackerAndDefender(battle);
	const droneIndex = 8;
	const drone = attacker.items[droneIndex];

	if (!drone) {
		throw new TypeError(`${attacker.name} tried to toggle drone but doesn't have one.`);
	}

	attacker.droneActive = !attacker.droneActive;
	
	// Refill uses
	if (attacker.droneActive && drone.stats.uses) {
		attacker.uses[droneIndex] = drone.stats.uses;
	}

}


function stomp (battle: Battle, event: BattleEvent): void {

	const legsIndex = 1;

	deal_damages(battle, legsIndex, event.damageDealt);
	count_item_usage(battle, legsIndex);

}


function cooldown (battle: Battle, event: BattleEvent): void {

	const { doubleCooldown } = event;

	if (typeof doubleCooldown !== 'boolean') {
		throw new TypeError(`Invalid or missing 'doubleCooldown' argument missing to execute action '${event.name}'`);
	}

	const { attacker } = BattleUtils.getAttackerAndDefender(battle);
	const cooldown = Math.min(attacker.stats.heaCol * (doubleCooldown ? 2 : 1), attacker.stats.heat);

	attacker.stats.heat -= cooldown;
	
}


function use_weapon (battle: Battle, event: BattleEvent): void {

	const { weaponIndex, damageDealt } = event;

	if (typeof weaponIndex !== 'number') {
		throw new TypeError(`Invalid or missing 'weaponIndex' argument to execute action '${event.name}'`);
	}

	deal_damages(battle, weaponIndex, damageDealt);
	count_item_usage(battle, weaponIndex);

}


function charge_engine (battle: Battle, event: BattleEvent): void {

	const { attacker, defender } = BattleUtils.getAttackerAndDefender(battle);
	const chargeIndex = 9;
	const dir = attacker.position < defender.position ? 1 : -1;

	attacker.position = defender.position - dir;
	defender.position = Math.max(0, Math.min(9, defender.position + dir));

	deal_damages(battle, chargeIndex, event.damageDealt);
	count_item_usage(battle, chargeIndex);

}


function grappling_hook (battle: Battle, event: BattleEvent): void {

	const { attacker, defender } = BattleUtils.getAttackerAndDefender(battle);
	const hookIndex = 11;
	const dir = attacker.position < defender.position ? 1 : -1;

	defender.position = attacker.position + dir;

	deal_damages(battle, hookIndex, event.damageDealt);
	count_item_usage(battle, hookIndex);

}


function teleport (battle: Battle, event: BattleEvent): void {

	if (typeof event.movingPosition !== 'number') {
		throw new TypeError(`Invalid or missing 'movingPosition' argument to execute action '${event.name}'`);
	}

	const { attacker, defender } = BattleUtils.getAttackerAndDefender(battle);
	const teleporterIndex = 10;
	
	// Only deals damage if teleported to opponent's side
	const damage = (
		Math.abs(event.movingPosition - defender.position) === 1
		? event.damageDealt || 0
		: 0
	);

	attacker.position = event.movingPosition;

	deal_damages(battle, teleporterIndex, damage);
	count_item_usage(battle, teleporterIndex);

}


function walk (battle: Battle, args: BattleEvent): void {

	const { movingPosition } = args;

	if (typeof movingPosition === 'undefined') {
		throw new TypeError(`'position' argument missing to execute action 'walk'`);
	}

	const { attacker } = BattleUtils.getAttackerAndDefender(battle);
	
	attacker.position = movingPosition;

}


function drone_fire (battle: Battle, event: BattleEvent): void {

	const { attacker } = BattleUtils.getAttackerAndDefender(battle);
	const droneIndex = 8;

	deal_damages(battle, droneIndex, event.damageDealt);
	count_item_usage(battle, droneIndex);

	if (attacker.uses[droneIndex] < 1) {

		const drone = attacker.items[droneIndex];

		attacker.uses[droneIndex] = drone!.stats.uses!;
		attacker.droneActive = false;

	}

}



// Exports

const BattleEventHandlers = {
	drone_toggle,
	stomp,
	cooldown,
	use_weapon,
	charge_engine,
	grappling_hook,
	teleport,
	walk,
	drone_fire,
};

export default BattleEventHandlers;
