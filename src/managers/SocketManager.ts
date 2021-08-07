import Socket from 'socket.io-client';
import Psocket, { PsocketListener } from '../utils/promise-socket.io';



// Init

// const serverURL = (
//   window.location.hostname === 'localhost'
//   ? 'http://localhost:3600/'
//   : 'https://workshop-unlimited-server.thearchives.repl.co'
// );

const serverURL = window.location.hostname + ':3600';

const __socket = Socket(serverURL);
const psocket = new Psocket(__socket);

const connectErrorStreakCountMax = 3;
let connectErrorStreakCount = 0;

const attachments: Record<number, Record<string, PsocketListener>> = {};
let currentAttachmentID = 0;



__socket.on('connect', () => {
  console.log('[SocketManager] Connected as', __socket.id);
  connectErrorStreakCount = 0;
});

__socket.on('connect_error', () => {
  connectErrorStreakCount++;
  if (connectErrorStreakCount >= connectErrorStreakCountMax) {
    __socket.disconnect();
    console.log('[SocketManager] Gave up on connecting.');
  }
});



// Exports

const SocketManager = {
  psocket,
  attach,
  detach,
  emit,
};

export default SocketManager;



// Functions

function attach (listeners: Record<string, PsocketListener>): number {
  
  const id = currentAttachmentID;

  currentAttachmentID++;

  attachments[id] = listeners;

  const entries = Object.entries(listeners);

  for (const [name, listener] of entries) {
    psocket.on(name, listener as PsocketListener);
  }

  return id;

}


function detach (id: number): void {
  
  const listeners = attachments[id];

  for (const name in listeners) {
    psocket.off(name);
  }

  delete attachments[id];

}


async function emit (
  event: string,
  data: any,
  responseTimeout?: number,
): Promise<any> {

  if (connectErrorStreakCount >= connectErrorStreakCountMax) {
    throw new Error(`Unavailable! Try again later.`);
  }
  
  return await psocket.emit(event, data, responseTimeout);

}



// class _SocketManager {

    // procket.on('arena_pool_validate_opponent', (resolve, reject, data) => {

    //   // const data_runtype = rt.Record({
    //   //   setup: rt.Array(Item_runtype.Or(rt.Null)).withConstraint(s => s.length === 20)
    //   // });

    //   try {

    //     // const { setup } = data_runtype.check(data);
    //     const { setup } = data;

    //     for (const item2 of setup) {
    //       if (item2 !== null) {

    //         const item1 = ItemsM.getItem(x => x.id === item2.id);

    //         // Check if the item exists in client's pack
    //         if (item1 === null) {
    //           return reject({ message: `${item2.name} does not exist` });
    //         }

    //         const hashableItem1Dummy = JSON.parse(JSON.stringify(item1));
    //         const hashableItem2Dummy = JSON.parse(JSON.stringify(item2));

    //         // @ts-ignore
    //         delete hashableItem1Dummy.image.url;
    //         delete hashableItem2Dummy.image.url;

    //         // Check if the item is the same as in client's pack
    //         const hash1 = JSON.stringify(hashableItem1Dummy);
    //         const hash2 = JSON.stringify(hashableItem2Dummy);
    //         if (hash1 !== hash2) {
    //           return reject({ message: `${item2.name} is invalid.` });
    //         }
    //       }
    //     }

    //     const { can, reason } = BattleManager.canSetupBattle(setup as MechSetup);

    //     if (!can) {
    //       return reject({ message: reason });
    //     }

    //     resolve();

    //   } catch (error) {
    //     reject(error);
    //     console.warn(error);
    //   }
    // });
