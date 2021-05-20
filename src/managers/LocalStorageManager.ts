/*
The purpose of this file is to
take care of default values and
to avoid storage key typo issues.
*/


import { Item, ItemsPack } from './ItemsManager';
import { JSONSafeMech } from './MechSavesManager';


interface LocalStorageSettings {
  arena_buffs: boolean;
  buffs_on_tooltip: boolean;
  clear_slot_button: boolean;
  control_opponent_mech: boolean
}

interface LocalStorageMechSaves {
  [pack_id: string]: {
    [mech_id: string]: JSONSafeMech;
  }
}

interface LastPackData {
  hash: string;
  config: ItemsPack['config'];
  items: Item[];
}


const defaultSettings: LocalStorageSettings = {
  arena_buffs: false,
  buffs_on_tooltip: true,
  clear_slot_button: true,
  control_opponent_mech: false
};


class LocalStorageManager {

  private PREFIX = 'workshop-unlimited.';
  private SETTINGS_KEY = this.PREFIX + 'settings';
  private MECH_SAVES_KEY = this.PREFIX + 'mechs';
  private LAST_MECH_ID_KEY = this.PREFIX + 'last-mech-id';
  private LAST_ITEMS_PACK_KEY = this.PREFIX + 'last-items-pack';



  private set (key: string, value: any): any {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  private get (key: string, optional?: any): any {
    const data = localStorage.getItem(key);
  
    if (!data) {
      if (typeof optional !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(optional));
      }
      return optional;
    }
  
    try {
      return JSON.parse(data);
    } catch (err) {
      return typeof optional !== 'undefined' ? optional : null;
    }
  }



  public setSettings (settings: LocalStorageSettings): void {
    this.set(this.SETTINGS_KEY, settings);
  }

  public getSettings (): LocalStorageSettings {
    return this.get(this.SETTINGS_KEY, defaultSettings);
  }



  public setMechSaves (mechs: LocalStorageMechSaves): void {
    this.set(this.MECH_SAVES_KEY, mechs);
  }

  public getMechSaves (): LocalStorageMechSaves {
    return this.get(this.MECH_SAVES_KEY, {});
  }



  public setLastMechID (id: string): void {
    this.set(this.LAST_MECH_ID_KEY, id);
  }

  public getLastMechID (): string {
    return this.get(this.LAST_MECH_ID_KEY);
  }



  public setLastItemsPack (data: LastPackData) {
    this.set(this.LAST_ITEMS_PACK_KEY, data);
  }

  public getLastItemsPack (): LastPackData | null {
    return this.get(this.LAST_ITEMS_PACK_KEY, null);
  }
}


export default new LocalStorageManager();
