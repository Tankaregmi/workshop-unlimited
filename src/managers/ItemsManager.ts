import getImgBlob, { WUImageData } from '../utils/getImgBlob';
import sha256 from 'simple-js-sha2-256';
import { ItemStats } from './StatsManager';
import { MechSetup } from './MechSavesManager';
import Vector2 from '../utils/Vector2';
import LocalStorageM from './LocalStorageManager';


export interface TorsoAttachment {
  leg1: Vector2;
  leg2: Vector2;
  side1: Vector2;
  side2: Vector2;
  side3: Vector2;
  side4: Vector2;
  top1: Vector2;
  top2: Vector2;
}

type ItemElement = 'PHYSICAL' | 'EXPLOSIVE' | 'ELECTRIC' | 'COMBINED';
type ItemType = (
  'TORSO' | 'LEGS' | 'SIDE_WEAPON' | 'TOP_WEAPON' | 'DRONE'
  | 'CHARGE_ENGINE' | 'TELEPORTER' | 'GRAPPLING_HOOK' | 'MODULE'
);


interface RawItem {
  name: string;
  id: number;
  image: string;
  width?: number;
  height?: number;
  type: ItemType;
  element: ItemElement;
	unlock_level?: number;
	gold_price?: number;
	tokens_price?: number;
  transform_range: string;
  attachment?: TorsoAttachment | Vector2;
  stats: ItemStats;
  tags?: string[];
}

export interface ItemsPack {
  config: {
    name: string;
    description: string;
    key: string;
    base_url: string;
    pack_url: string;
  };
  items: RawItem[];
}


export type Item = Await<ReturnType<ItemsManager['createItemFromRaw']>>;


class ItemsManager {

  hash: string = '';
  items: Item[] = [];
  itemsFailed: RawItem[] = [];
  loading = false;
  loaded = false;
  error = false; // btw i think this is an unused prop
  packConfig?: ItemsPack['config'] | null = null;
  itemElements = ['PHYSICAL', 'EXPLOSIVE', 'ELECTRIC', 'COMBINED'];


  private maxItemImageSize = 800;
  private oldItemImagesBaseURL = 'https://raw.githubusercontent.com/ctrl-raul/workshop-unlimited/master/items/';
  private newItemImagesBaseURL = 'https://raw.githubusercontent.com/ctrl-raul/supermechs-item-images/master/png/';


  public async import (itemsPack: ItemsPack, callback: (total: number, loaded: number) => any, interval: number) {

    let baseURL = itemsPack.config.base_url || '';
    const itemsLoaded: Item[] = [];


    // Oui, we changed where we host the item images, it's
    // not in the WU repo anymore, so we do this here.
    if (baseURL === this.oldItemImagesBaseURL) {
      baseURL = this.newItemImagesBaseURL;
    }


    this.hash = sha256(JSON.stringify(itemsPack));
    this.loading = true;
    this.loaded = false;
    this.items = [];
    this.packConfig = itemsPack.config;


    console.log('Items Pack HASH:', this.hash);


    const updateInterval = setInterval(() => {

      if (itemsLoaded.length === itemsPack.items.length) {

        clearInterval(updateInterval);

        this.loaded = true;
        this.loading = false;

        // Sort items by element
        this.items = itemsLoaded.sort((a, b) =>
            this.itemElements.indexOf(a.element)
          - this.itemElements.indexOf(b.element)
        );

        this.saveLastPack();
      }

      // Updates loading progress
      callback(itemsPack.items.length, itemsLoaded.length);
    }, interval);


    for (const rawItem of itemsPack.items) {

      const src = rawItem.image.replace('%url%', baseURL);
      
      getImgBlob(src, [this.maxItemImageSize])
        .then(results => {

          const [imageData] = results;

          // Items can have hardcoded image size, for those
          // we don't have the official image yet haha
          if (rawItem.width)  imageData.width  = rawItem.width;
          if (rawItem.height) imageData.height = rawItem.height;

          const item = this.createItemFromRaw(rawItem, imageData);

          // Successfuly imported this item, yay!
          itemsLoaded.push(item);

        }).catch(_error => {
          // Failed to load item image

          // Should probably tell the user what
          // kind of error this is, right? ...

          this.itemsFailed.push(rawItem);
        });
    }
  }


  // Functions

  private createItemFromRaw (data: RawItem, image: WUImageData) {

    // Get item attachment
    const attachment = data.attachment || this.createAttachment(data.type, image);
  
  
    // Define kind
    const kind = [data.element, data.type].join('_').toLowerCase();
  
  
    // Get item tags
    const tags = data.tags || [];
  
    if (tags.includes('legacy')) {
      // Is legacy premium?
      if (data.transform_range[0] === 'M') {
        tags.push('premium');
      }
    } else {
      // Is reloaded premium?
      if ('LM'.includes(data.transform_range[0])) {
        tags.push('premium');
      }
    }
  
    if (!tags.includes('melee')) {
      // Is jumping weapon?
      if (data.stats.advance || data.stats.retreat) {
        tags.push('require_jump');
      }
    }
  
  
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      element: data.element,
      transform_range: data.transform_range,
      stats: data.stats,
  
      attachment,
      image,
      kind,
      tags,
    };
  
  }

  private createAttachment (itemType: ItemType, { width, height }: WUImageData) {
    switch (itemType) {
  
      case 'TORSO':
        const attachment: TorsoAttachment = {
          leg1:  new Vector2(width * 0.3,  height * 0.9),
          leg2:  new Vector2(width * 0.7,  height * 0.9),
          side1: new Vector2(width * 0.25, height * 0.65),
          side2: new Vector2(width * 0.75, height * 0.65),
          side3: new Vector2(width * 0.20, height * 0.4),
          side4: new Vector2(width * 0.80, height * 0.4),
          top1:  new Vector2(width * 0.25, height * 0.1),
          top2:  new Vector2(width * 0.75, height * 0.1),
        };
        return attachment;
  
      case 'LEGS':
        return new Vector2(width * 0.5, height * 0.1);
  
      case 'SIDE_WEAPON':
        return new Vector2(width * 0.4, height * 0.5);
  
      case 'TOP_WEAPON':
        return new Vector2(width * 0.3, height * 0.8);
  
      default:
        return null;
  
    }
  }

  private saveLastPack () {
    try {
      LocalStorageM.setLastItemsPack({
        config: this.getItemsPackConfig(),
        hash: this.hash,
        items: this.items
      });
    } catch (error) {
      console.warn(`Failed to save last pack:`, error.message);
    }
  }

  public loadLastPack (lastPackData = LocalStorageM.getLastItemsPack()) {

    if (lastPackData === null) {
      throw new Error(`No last pack!`);
    }

    this.loaded = true;
    this.items = lastPackData.items;
    this.packConfig = lastPackData.config;

  }


  // Methods

  public checkItemsPack (itemsPack: ItemsPack) {

    // First we should check if the pack format is valid
    // at all, but we don't do that at the moment because
    // Runtypes decided to not give useful error messages.

    // Then we check for items with the same ID

    const idsMap: Record<string | number, RawItem[]> = {};
    let messageLines: string[] = [];

    for (const item of itemsPack.items) {
      if (idsMap[item.id]) {
        idsMap[item.id].push(item);
      } else {
        idsMap[item.id] = [item];
      }
    }

    for (const [id, items] of Object.entries(idsMap)) {
      if (items.length > 1) {
        messageLines.push(`Found ${items.length} items with id ${id}`);
      }
    }

    if (messageLines.length) {
      throw new Error(messageLines.join('\n'));
    }

  }

  public getItemsPackConfig (): ItemsPack['config'] {
    if (this.packConfig) {
      return this.packConfig;
    }
    throw new Error(`No items pack loaded`);
  }

  public getItem (finder: (item: Item) => any): Item | null {
    return this.items.find(finder) || null;
  }


  // Utils

  public items2ids (setup: MechSetup): number[] {
    return setup.map(item => item ? item.id : 0);
  }

  public ids2items (ids: number[]): MechSetup {
    return ids.map(id => this.getItem(item => item.id === id));
  }
}


export default new ItemsManager();
