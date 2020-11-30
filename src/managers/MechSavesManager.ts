import LocalStorageManager from './LocalStorageManager';
import ItemsManager, { Item } from './ItemsManager';
import randomStringFactory from '../utils/randomStringFactory';


export interface Mech {
  id: string;
  name: string;
  pack_key: string;
  pack_name: string;
  setup: MechSetup;
}

export type MechSetup = (Item | null)[];

export interface JSONSafeMech {
  id: string;
  name: string;
  pack_key: string;
  pack_name: string;
  setup: number[];
}

interface MechsMap {
  [mech_id: string]: Mech;
}


class MechSavesManager
{
  genRandomString = randomStringFactory(16);
  genRandomStringShort = randomStringFactory(4);


  mechToJSONSafeMech (mech: Mech): JSONSafeMech {
    return {
      name: mech.name,
      id: mech.id,
      setup: ItemsManager.items2ids(mech.setup),
      pack_name: mech.pack_name,
      pack_key: mech.pack_key
    }
  }

  JSONSafeMechToMech (mech: JSONSafeMech): Mech {
    return {
      name: mech.name,
      id: mech.id,
      setup: ItemsManager.ids2items(mech.setup),
      pack_name: mech.pack_name,
      pack_key: mech.pack_key
    }
  }


  setLastMech (mech: Mech | JSONSafeMech): void {
    LocalStorageManager.setLastMechID(mech.id);
  }

  getLastMech (): Mech {

    const mechs = this.getMechsForCurrentPack();
    const lastMechID = LocalStorageManager.getLastMechID();
    
    if (lastMechID in mechs) {
      return mechs[lastMechID];
    }
    
    // Uses first mech of the map or create a new mech
    return Object.values(mechs)[0] || this.createMech();
  }


  getMechsForCurrentPack (): MechsMap {

    if (!ItemsManager.packConfig) {
      throw new Error(`Can not get mechs: ItemsManager.packConfig is ${ ItemsManager.packConfig }`);
    }

    const mechsPacks = LocalStorageManager.getMechSaves();

    // If has saved mechs created with this pack
    if (ItemsManager.packConfig.key in mechsPacks) {

      const mechs: MechsMap = {};
      const JSONSafeMechs = Object.values(mechsPacks[ItemsManager.packConfig.key]);

      for (const mech of JSONSafeMechs) {
        mechs[mech.id] = this.JSONSafeMechToMech(mech);
      }

      return mechs;
    }
    
    return {};
  }

  setMechs (mechs: MechsMap): void {

    if (!ItemsManager.packConfig) {
      throw new Error(`Can not set (save) mechs: ItemsManager.packConfig is ${ ItemsManager.packConfig }`);
    }

    const mechsPacks = LocalStorageManager.getMechSaves();
    const JSONSafeMechsMap: { [mech_id: string]: JSONSafeMech } = {};

    for (const mech of Object.values(mechs)) {

      // Delete mechs with empty setup
      if (!mech.setup.some(Boolean)) {
        delete mechs[mech.id];
        continue;
      }

      JSONSafeMechsMap[mech.id] = this.mechToJSONSafeMech(mech);
    }

    // No I will not use ternary here.
    if (Object.keys(JSONSafeMechsMap).length) {
      mechsPacks[ItemsManager.packConfig.key] = JSONSafeMechsMap;
    }
    else {
      delete mechsPacks[ItemsManager.packConfig.key];
    }

    LocalStorageManager.setMechSaves(mechsPacks);
  }


  createMech (setup?: Mech['setup']): Mech {

    if (!ItemsManager.packConfig) {
      throw new Error(`Can not create mech: ItemsManager.packConfig is ${ ItemsManager.packConfig }`);
    }

    const mech = {
      id: this.genMechID(),
      name: 'Mech ' + this.genRandomStringShort(),
      setup: setup || Array(20).fill(null),
      pack_key: ItemsManager.packConfig.key,
      pack_name: ItemsManager.packConfig.name
    };

    this.saveMech(mech);
    
    return mech;
  }

  saveMech (mech: Mech): void {
    const mechs = this.getMechsForCurrentPack();
    mechs[mech.id] = mech;
    // this.setLastMech(mech);
    this.setMechs(mechs);
  }

  deleteMech (id: string) {
    const mechs = this.getMechsForCurrentPack();
    if (id in mechs) {
      delete mechs[id];
    }
    this.setMechs(mechs);
  }


  genMechID (): string {
    return Date.now() + '.' + this.genRandomString();
  }
}


export default new MechSavesManager();
