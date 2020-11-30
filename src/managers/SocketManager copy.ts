// import Socket from 'socket.io-client';
// import Battle from '../classes/Battle';
// import DataManager from './DataManager';
// import BattleManager from './BattleManager';
// import ItemsManager from './ItemsManager';
// import MechSavesManager from './MechSavesManager';
// import SocketRegisterModules from './socket-modules/SocketRegisterModule';


// interface SocketResponse {
//   error?: boolean;
//   message?: string;
// }


// class SocketManager
// {
//   serverURL = (
//     window.location.hostname === 'localhost'
//     ? 'http://localhost:3600/'
//     : 'https://workshop-unlimited-server.herokuapp.com/'
//   );
  
//   socket: SocketIOClient.Socket;
//   goTo: GoToFunction = () => {
//     throw new Error(`SocketManager has not been initialized`);
//   };


//   constructor () {
//     this.socket = Socket(this.serverURL);
//   }


//   log (...args: any[]): void {
//     console.log(`[SocketManager]`, ...args);
//   }


//   init (goTo: GoToFunction) {

//     // this.goTo = goTo;

//     const socket = this.socket;

    

//     // socket.on('connect_error', () => {
//     //   this.log('Could not connect to server');
//     //   socket.disconnect();
//     // });

//     // socket.on('connect', () => {
//     //   this.log('Connected as', socket.id);
//     // });

//     // socket.on('battle_match', this.battle_match.bind(this));
//     // socket.on('battle_action_success', this.battle_action_success.bind(this));
//     // socket.on('battle_quit_success', this.battle_quit_success.bind(this));

//     // socket.on('disconnect', () => {
//     //   this.log('Disconnected');
//     //   if (DataManager.battle && DataManager.battle.multiplayer) {
//     //     this.battle_quit_success({ victory: false });
//     //   }
//     // });

//     // this.heartbeating();
//   }


//   // Tries to prevent socket.io from disconnecting due to idle
//   heartbeating () {
//     const seconds = 15;
//     setInterval(() => {
//       if (!document.hasFocus() && this.socket.connect) {
//         this.socket.emit('heartbeat');
//       }
//     }, seconds * 1000);
//   }


//   connect () {

//     this.log('Trying to connect');

//     let _resolve: () => any;
//     let _reject: () => any;

//     const promise = new Promise((resolve, reject) => {
//       this.socket.on('connect', _resolve = resolve);
//       this.socket.on('connect_error', _reject = reject);
//       this.socket.on('reconnect_error', _reject = reject);
//     });

//     promise.finally(() => {
//       this.socket.off('connect', _resolve);
//       this.socket.off('connect_error', _reject);
//       this.socket.off('reconnect_error', _reject);
//     });

//     this.socket.connect();

//     return promise;
//   }


//   // Send

//   register () {
//     const data = {
//       items_pack_hash: ItemsManager.hash
//     };
//     this.emit('register');
//   }

//   arena_pool_join (setup_ids: number[]) {
//     return this.emit('arena_pool_join', { setup_ids });
//   }

//   // arena_pool_quit () {
//   //   return this.emit('arena_pool_quit');
//   // }

//   // battle_quit () {
//   //   return this.emit('battle_quit');
//   // }


//   // Get

//   battle_match (data: any): void {

//     // @ts-ignore
//     const { name, item_ids, turn_owner, positions } = data;

//     console.log('battle_match', data);

//     const mech1 = MechSavesManager.getLastMech();
//     const mech2: Mech = {
//       id: '?',
//       name,
//       pack_key: '?',
//       pack_name: '?',
//       setup: ItemsManager.ids2items(item_ids)
//     }

//     DataManager.battle = new Battle({
//       mechs: [mech1, mech2],
//       multiplayer: true,
//       turnOwnerIndex: turn_owner,
//       positions
//     });

//     this.goTo('battle');
//   }

//   battle_action_success (data: any): void {
//     BattleManager.executeAction(
//       DataManager.getBattle(),
//       data.action,
//       data.args
//     );
//   }

//   battle_quit_success (data: any): void {
//     if (DataManager.battle !== null) {
//       DataManager.battle.over = true;
//       DataManager.battle.victory = data.victory;
//       DataManager.battle.quit = true;
//       DataManager.battle.onUpdate();
//     }
//   }

//   emit (event: string, ...tail: any[]) {
//     return new Promise<any>((resolve, reject) => {
//       if (this.socket === null) {
//         reject(`socket has not been initialized yet`);
//         return
//       }
//       this.socket.emit(event, ...tail, (res: SocketResponse) => {
//         if (res.error) {
//           reject(res.message);
//         } else {
//           resolve(res);
//         }
//       });
//     });
//   }
// }


// export default new SocketManager();


export default 1;