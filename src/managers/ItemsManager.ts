import sha256 from 'simple-js-sha2-256';
import Item, { RawItem } from '../classes/Item';



// Types

export interface ItemsPack {
  config: {
    name: string;
    description: string;
    key: string;
    base_url: string;
  };
  items: RawItem[];
}

interface EssentialItemData {
  id: number;
  name: string;
  type: string;
  stats: Item['stats'];
  tags: string[];
}

type MechSetup = (Item | null)[];



// Data

const itemElements = ['PHYSICAL', 'EXPLOSIVE', 'ELECTRIC', 'COMBINED'];
let state = createState();



// Functions

async function importItemsPack (itemsPack: ItemsPack, callback: (progress: number) => void): Promise<void> {

  if (state.loading) {
    console.log('[ItemsManager.importItemsPack] Already importing a pack.');
    return;
  }


  checkItemsPack(itemsPack);


  state = createState();
  state.loading = true;


  const baseURL = getImagesBaseURL(itemsPack);
  const itemsDone: Item[] = [];
  const itemsFailed: Item[] = [];


  const progressInterval = setInterval(() => {

    if (itemsDone.length === itemsPack.items.length) {
      onImportComplete();
    }

    // Update loading progress
    callback(itemsDone.length / itemsPack.items.length);

  }, 100);


  const onImportComplete = () => {
    clearInterval(progressInterval);

    state.loaded = true;
    state.loading = false;
    state.hash = sha256(JSON.stringify(itemsPack));
    state.itemsPack = itemsPack;

    // Sort items by element
    state.items = itemsDone.sort((a, b) =>
        itemElements.indexOf(a.element)
      - itemElements.indexOf(b.element)
    );

    // saveLastPack();
  }


  for (const rawItem of itemsPack.items) {

    const item = new Item(rawItem);

    item.loadImage(baseURL)
      .catch(() => itemsFailed.push(item))
      .finally(() => itemsDone.push(item));

  }

}


function createState () {
  return {
    hash: '',
    items: [] as Item[],
    itemsFailed: [] as RawItem[],
    loading: false,
    loaded: false,
    itemsPack: null as ItemsPack | null,
  };
}


function getImagesBaseURL (itemsPack: ItemsPack): string {

  const oldItemImagesBaseURL = 'https://raw.githubusercontent.com/ctrl-raul/workshop-unlimited/master/items/';
  const newItemImagesBaseURL = 'https://raw.githubusercontent.com/ctrl-raul/supermechs-item-images/master/png/';

  // Oui, we changed where we host the item images, it's
  // not in the WU repo anymore, so we do this here.
  if (itemsPack.config.base_url === oldItemImagesBaseURL) {
    return newItemImagesBaseURL;
  }

  return itemsPack.config.base_url;

}


function checkItemsPack (itemsPack: ItemsPack): void {

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


function getItemsPack (): ItemsPack {
  if (state.itemsPack) {
    return state.itemsPack;
  }
  throw new Error(`No items pack loaded`);
}


function getItemByID (id: Item['id']): Item | null {
  return state.items.find(item => item.id === id) || null;
}

function getItems (filter?: (item: Item) => boolean): Item[] {
  return filter ? state.items.filter(filter) : state.items;
}


function items2ids (items: MechSetup): number[] {
  return items.map(item => item ? item.id : 0);
}

function ids2items (ids: Item['id'][]): MechSetup {
  return ids.map(id => getItemByID(id));
}


function getEssentialItemDataByID (id: Item['id']): EssentialItemData | null {
  const item = getItemByID(id);
  return item ? getEssentialItemData(item) : null;
}

function getEssentialItemData (item: Item): EssentialItemData {
  return {
    id: item.id,
    name: item.name,
    stats: item.stats,
    tags: item.tags,
    type: item.type,
  };
}


function loaded (): boolean {
  return state.loaded;
}


// function saveLastPack (): void {

//   // First we remove the previous last
//   // pack, yes, regardless if it
//   // succeeds to set the new one.
//   LocalStorageM.setLastItemsPack(null);

//   try {
//     LocalStorageM.setLastItemsPack({
//       config: this.getItemsPackConfig(),
//       hash: this.hash,
//       items: this.items
//     });
//   } catch (error) {
//     // Most likely that the json is too long
//     console.warn(`Failed to save last pack:`, error.message);
//   }

// }


// Exports

const ItemsManager = {
  importItemsPack,
  getItemsPack,
  getItemByID,
  getItems,
  items2ids,
  ids2items,
  getEssentialItemDataByID,
  getEssentialItemData,
  loaded,
};

export default ItemsManager;
