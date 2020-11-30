import getImgBlob from '../utils/getImgBlob';
import forge_SHA256 from '../utils/forge-sha256';
import { ItemStats } from './StatsManager';
import { MechSetup } from './MechSavesManager';


export interface Item {
  name: string;
  id: number;
  image: ItemImg;
  type: string;
  element: string;
  kind: string;
  transform_range: string;
  attachment: any;
  stats: ItemStats;
  error: Error;
  __typeof: string;
  tags: string[];
}


interface ItemImg {
	readonly width: number;
	readonly height: number;
	readonly url: string;
}

interface RawItem {
  name: string;
  id: number;
  image: string;
  width?: number;
  height?: number;
  type: string;
  element: string;
  transform_range: string;
  attachment: any;
  stats: ItemStats;
  tags?: string[];
}



interface ItemsPackConfig {
  name: string;
  description: string;
  key: string;
  base_url: string;
}

export interface ItemsPack {
  config: ItemsPackConfig;
  items: RawItem[];
}


async function createItemFromRaw (raw: RawItem, baseURL: string): Promise<Item> {

  const image: ItemImg = { width: 0, height: 0, url: '' };
  const src = raw.image.replace(/%url%/gi, baseURL);
  const tags = raw.tags ? Array.from(raw.tags) : [];
  
  let error = null;

  try {
    const [data] = await getImgBlob(src, [800]);
    Object.assign(image, {
      url: data.url,
      width: raw.width || data.width,
      height: raw.height || data.height
    });
  }
  catch (err) {
    error = err;
  }

  if (raw.transform_range.startsWith('L') || raw.transform_range.startsWith('M')) {
    tags.push('premium');
  }

  if ((raw.stats.advance || raw.stats.retreat) && !tags.includes('melee')) {
    tags.push('require_jump');
  }

  const item: Item = {
    name: raw.name,
    id: raw.id,
    image: image,
    type: raw.type,
    element: raw.element,
    kind: (raw.element + '_' + raw.type).toLowerCase(),
    transform_range: raw.transform_range,
    attachment: raw.attachment,
    stats: raw.stats,
    __typeof: 'item',
    tags,
    error
  };

  return item;
}


class ItemsManager
{
  hash: string = '';
  items: Item[] = [];
  itemsFailed: RawItem[] = [];
  loading = false;
  loaded = false;
  error = false;
  packConfig?: ItemsPackConfig | null = null;
  itemElements = ['PHYSICAL', 'EXPLOSIVE', 'ELECTRIC', 'COMBINED'];

  async import (itemsPack: ItemsPack, callback: (total: number, loaded: number) => any, interval: number) {
      
    const baseURL = itemsPack.config.base_url || '';
    const itemsLoaded: Item[] = [];

    this.hash = forge_SHA256(JSON.stringify(itemsPack));
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
      }

      // Updates loading progress
      callback(itemsPack.items.length, itemsLoaded.length);
    }, interval);

    for (const rawItem of itemsPack.items) {
      createItemFromRaw(rawItem, baseURL)
        .then(item => {
          itemsLoaded.push(item);
          if (item.error) {
            console.error(`Failed to load '${ rawItem.name }'\n`, item.error);
            this.itemsFailed.push(rawItem);
          }
        });
    }
  }


  getItem (finder: (item: Item) => any): Item | null {
    return this.items.find(finder) || null;
  }


  items2ids (setup: MechSetup): number[] {
    return setup.map(item => item ? item.id : 0);
  }

  ids2items (ids: number[]): MechSetup {
    return ids.map(id => this.getItem(item => item.id === id));
  }
}


export default new ItemsManager();
