import Socket from 'socket.io-client';
import Procket from '../utils/procket.io';
import ItemsM from './ItemsManager';
import { Mech, MechSetup } from './MechSavesManager';
// import * as rt from 'runtypes';
// import Item_runtype from '../runtypes/item';
import BattleManager from './BattleManager';
import DataManager from './DataManager';


type GoToFunction = (screen: string) => any;


class SocketManager
{
  procket: Procket;

  serverURL = (
    window.location.hostname === 'localhost'
    ? 'http://localhost:3600/'
    : 'https://workshop-unlimited-server.herokuapp.com/'
  );
  
  goTo: GoToFunction = () => {
    throw new Error(`SocketManager has not been initialized`);
  };


  constructor () {
    const socket = Socket(this.serverURL);
    this.procket = new Procket(socket);
  }

  init (goTo: GoToFunction) {
    this.goTo = goTo;
    this.setListeners(this.procket);
  }

  setListeners (procket: Procket) {

    procket.socket.on('connect', () => {
      this.log('Connected as', procket.socket.id);
    });

    procket.socket.on('disconnect', () => {
      if (DataManager.battle) {
        DataManager.battle.over = true;
        DataManager.battle.quit = true;
        DataManager.battle.victory = true;
        DataManager.updateBattle();
      }
    });

    procket.socket.on('connect_error', () => {
      this.log('Could not connect to server');
      procket.socket.disconnect();
    });

    procket.on('ip', (resolve, _reject, data) => {
      this.log(data);
      resolve();
    });

    procket.on('arena_pool_validate_opponent', (resolve, reject, data) => {

      // const data_runtype = rt.Record({
      //   setup: rt.Array(Item_runtype.Or(rt.Null)).withConstraint(s => s.length === 20)
      // });

      try {

        // const { setup } = data_runtype.check(data);
        const { setup } = data;

        for (const item2 of setup) {
          if (item2 !== null) {

            const item1 = ItemsM.getItem(x => x.id === item2.id);

            // Check if the item exists in client's pack
            if (item1 === null) {
              return reject({ message: `${item2.name} does not exist` });
            }

            const hashableItem1Dummy = JSON.parse(JSON.stringify(item1));
            const hashableItem2Dummy = JSON.parse(JSON.stringify(item2));

            // @ts-ignore
            delete hashableItem1Dummy.image.url;
            delete hashableItem2Dummy.image.url;

            // Check if the item is the same as in client's pack
            const hash1 = JSON.stringify(hashableItem1Dummy);
            const hash2 = JSON.stringify(hashableItem2Dummy);
            if (hash1 !== hash2) {
              return reject({ message: `${item2.name} is invalid.` });
            }
          }
        }

        const { can, reason } = BattleManager.canSetupBattle(setup as MechSetup);

        if (!can) {
          return reject({ message: reason });
        }

        resolve();

      } catch (error) {
        reject(error);
        console.warn(error);
      }
    });

    procket.on('battle_start', (resolve, _reject, { battle, turnOwnerID }) => {

      for (const player of battle.players) {
        player.battle = battle;
        player.uses = player.uses.map((x: any) => typeof x === 'number' ? x : Infinity);
      }

      DataManager.battle = battle;
      DataManager.turnOwnerID = turnOwnerID;

      resolve();
      this.goTo('battle');
    });

    procket.on('battle_update', (resolve, _reject, { battle, turnOwnerID }) => {

      resolve();

      for (const player of battle.players) {
        player.battle = battle;
        player.uses = player.uses.map((x: any) => typeof x === 'number' ? x : Infinity);
      }

      DataManager.battle = battle;

      if (battle.over) {
        // Lazy to check data comming from server now
        // @ts-ignore
        const loser = battle.players.find(player => player.stats.health < 1);
        // @ts-ignore
        DataManager.battle.victory = loser.id !== this.procket.socket.id;
      } else {
        DataManager.turnOwnerID = turnOwnerID;
      }

      DataManager.updateBattle();
    });

    procket.on('battle_opponent_quit', (resolve) => {

      resolve();

      try {
        const battle = DataManager.getBattle();
        battle.over = true;
        battle.quit = true;
        battle.victory = true;
      } catch (error) {
        console.warn(`This warning probably means your opponent has quit but you doesn't seem to be in a battle.`, error);
        return;
      }

      DataManager.updateBattle();
    });
  }

  async emit (event: string, data?: any) {

    if (!this.isConnected()) {
      try {
        await this.connect();
      } catch (error) {
        throw error;
      }
    }

    return this.procket.emit(event, data);
  }


  log (...args: any[]): void {
    console.log(`[SocketManager]`, ...args);
  }

  isConnected () {
    return this.procket.socket.connected;
  }

  connect () {

    this.log('Trying to connect');

    let _resolve: () => any;
    let _reject: () => any;

    const { socket } = this.procket;

    const promise = new Promise((resolve, reject) => {
      socket.on('connect', _resolve = resolve);
      socket.on('connect_error', _reject = reject);
      socket.on('reconnect_error', _reject = reject);
    });

    promise.finally(() => {
      socket.off('connect', _resolve);
      socket.off('connect_error', _reject);
      socket.off('reconnect_error', _reject);
    });

    socket.connect();

    return promise;
  }


  arena_pool_join (mech: Mech): Promise<any> {
    return this.emit('arena_pool_join', {
      name: mech.name,
      setup: mech.setup,
      items_pack_hash: ItemsM.hash
    });
  }

  arena_pool_quit (): Promise<any> {
    return this.emit('arena_pool_quit');
  }

  battle_action (action: any): Promise<any> {
    return this.emit('battle_action', action);
  }

  battle_quit (): Promise<any> {

    const battle = DataManager.getBattle();

    battle.over = true;
    battle.victory = false;
    battle.quit = true;

    return this.emit('battle_quit');
  }
}


export default new SocketManager();
