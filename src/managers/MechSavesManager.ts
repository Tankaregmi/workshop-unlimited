import LocalStorageManager from './LocalStorageManager';
import ItemsManager, { Item } from './ItemsManager';
import randomStringFactory from '../utils/randomStringFactory';
import downloadJSON from '../utils/downloadJSON';


export interface Mech {
  id: string;
  name: string;
  pack_key: string;
  pack_name?: string;
  setup: MechSetup;
}

export type MechSetup = (Item | null)[];

export interface JSONSafeMech {
  id: string;
  name: string;
  pack_key: string;
  pack_name?: string;
  setup: number[];
}

interface MechsMap {
  [mech_id: string]: Mech;
}

interface MechsExportJSON {
  items_pack_key: string;
  mechs: {
    name: string;
    setup: string;
  }[];
}


class MechSavesManager
{
  genRandomString = randomStringFactory(16);
  genRandomStringShort = randomStringFactory(4);

  _mechsExportItemIDsSeparator = ' ';


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


  createMech (base: Partial<Mech> = {}): Mech {

    if (!ItemsManager.packConfig) {
      throw new Error(`Can not create mech: ItemsManager.packConfig is ${ ItemsManager.packConfig }`);
    }

    const mech = {
      id: base.id || this._genMechID(),
      name: base.name || 'Mech ' + this.genRandomStringShort(),
      setup: base.setup || Array(20).fill(null),
      pack_key: base.pack_key || ItemsManager.packConfig.key,
      pack_name: base.pack_name || ItemsManager.packConfig.name
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


  _genMechID (): string {
    return Date.now() + '.' + this.genRandomString();
  }


  _generateExportData (ids: Mech['id'][]): MechsExportJSON {

    console.log('_generateExportData', arguments);

    const getNameAndRawSetup = (mech: Mech) => ({
      name: mech.name,
      setup: ItemsManager.items2ids(mech.setup).join(this._mechsExportItemIDsSeparator)
    });

    const items_pack_key = ItemsManager.getItemsPackConfig().key;

    const mechs = Object.values(this.getMechsForCurrentPack())
      .filter(mech => ids.length ? ids.includes(mech.id) : true)
      .map(getNameAndRawSetup);

    return { items_pack_key, mechs };
  }

  exportMechs (ids: Mech['id'][] = []): void {
    const data = this._generateExportData(ids);
    downloadJSON(data, 'mechs');
  }

  importMechs (data: MechsExportJSON): void {
    const mechs = this.getMechsForCurrentPack();
    for (const { name, setup } of data.mechs) {
      const mech: Mech = {
        id: this._genMechID(),
        name,
        setup: ItemsManager.ids2items(setup.split(this._mechsExportItemIDsSeparator).map(Number)),
        pack_key: data.items_pack_key
      };
      mechs[mech.id] = mech;
    }
    this.setMechs(mechs);
  }
}


export default new MechSavesManager();
