import LocalStorageManager from './LocalStorageManager';
import ItemsManager from './ItemsManager';
import randomStringFactory from '../utils/randomStringFactory';
import downloadJSON from '../utils/downloadJSON';
import Item from '../classes/Item';


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
  [ItemsPackKey: string]: {
    name: string;
    setup: string;
  }[];
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

    const itemsPackConfig = ItemsManager.getItemsPack().config;
    const mechsPacks = LocalStorageManager.getMechSaves();

    // If has saved mechs created with this pack
    if (itemsPackConfig.key in mechsPacks) {

      const mechs: MechsMap = {};
      const JSONSafeMechs = Object.values(mechsPacks[itemsPackConfig.key]);

      for (const mech of JSONSafeMechs) {
        mechs[mech.id] = this.JSONSafeMechToMech(mech);
      }

      return mechs;
    }

    return {};
  }

  setMechs (mechs: MechsMap): void {

    const itemsPackConfig = ItemsManager.getItemsPack().config;
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
      mechsPacks[itemsPackConfig.key] = JSONSafeMechsMap;
    }
    else {
      delete mechsPacks[itemsPackConfig.key];
    }

    LocalStorageManager.setMechSaves(mechsPacks);
  }


  createMech (base: Partial<Mech> = {}): Mech {

    const itemsPackConfig = ItemsManager.getItemsPack().config;

    const mech = {
      id: base.id || this._genMechID(),
      name: base.name || 'Mech ' + this.genRandomStringShort(),
      setup: base.setup || Array(20).fill(null),
      pack_key: base.pack_key || itemsPackConfig.key,
      pack_name: base.pack_name || itemsPackConfig.name
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


  public exportAllMechs () {

    const mechSaves = LocalStorageManager.getMechSaves();
    const data: MechsExportJSON = {};

    for (const packKey in mechSaves) {

      data[packKey] = [];

      for (const mechID in mechSaves[packKey]) {

        const mech = mechSaves[packKey][mechID];

        data[packKey].push({
          name: mech.name,
          setup: mech.setup.join(' '),
        });

      }
    }

    downloadJSON(data, 'mechs');

  }

  public exportMechs (ids: Mech['id'][]) {

    const mechSaves = LocalStorageManager.getMechSaves();
    const data: MechsExportJSON = {};

    for (const packKey in mechSaves) {

      data[packKey] = [];

      for (const mechID in mechSaves[packKey]) {
        if (ids.includes(mechID)) {

          const mech = mechSaves[packKey][mechID];

          data[packKey].push({
            name: mech.name,
            setup: mech.setup.join(' '),
          });
        }
      }

      if (data[packKey].length === 0) {
        delete data[packKey];
      }
    }

    downloadJSON(data, 'mechs');

  }

  public importMechs (data: MechsExportJSON): void {
    try {

      const mechSaves = LocalStorageManager.getMechSaves();

      for (const packKey in data) {

        if (!mechSaves.hasOwnProperty(packKey)) {
          mechSaves[packKey] = {};
        }

        for (const mechExport of data[packKey]) {

          const mech: Mech = {
            id: this._genMechID(),
            name: mechExport.name,
            setup: ItemsManager.ids2items(mechExport.setup.split(' ').map(Number)),
            pack_key: packKey,
          }

          mechSaves[packKey][mech.id] = this.mechToJSONSafeMech(mech);
        }
      }

      LocalStorageManager.setMechSaves(mechSaves);

    } catch (error) {
      throw new Error(`Invalid mechs data.`);
    }
  }
}


export default new MechSavesManager();
