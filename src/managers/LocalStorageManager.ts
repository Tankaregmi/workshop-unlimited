/*
The purpose of this file is to
take care of default values and
to avoid storage key typo issues.
*/


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


const defaultSettings: LocalStorageSettings = {
  arena_buffs: false,
  buffs_on_tooltip: true,
  clear_slot_button: true,
  control_opponent_mech: false
};


class LocalStorageManager
{
  PREFIX = 'workshop-unlimited.';
  SETTINGS_KEY = this.PREFIX + 'settings';
  MECH_SAVES_KEY = this.PREFIX + 'mechs';
  LAST_MECH_ID_KEY = this.PREFIX + 'last-mech-id';

  set (key: string, value: any): any {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  get (key: string, optional?: any): any {
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


  setSettings (settings: LocalStorageSettings): void {
    this.set(this.SETTINGS_KEY, settings);
  }

  getSettings (): LocalStorageSettings {
    return this.get(this.SETTINGS_KEY, defaultSettings);
  }


  setMechSaves (mechs: LocalStorageMechSaves): void {
    this.set(this.MECH_SAVES_KEY, mechs);
  }

  getMechSaves (): LocalStorageMechSaves {
    return this.get(this.MECH_SAVES_KEY, {});
  }


  setLastMechID (id: string): void {
    this.set(this.LAST_MECH_ID_KEY, id);
  }

  getLastMechID (): string {
    return this.get(this.LAST_MECH_ID_KEY);
  }
}


export default new LocalStorageManager();
