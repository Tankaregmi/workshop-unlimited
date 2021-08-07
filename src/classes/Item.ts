import { ItemStats } from "../managers/StatsManager";
import textureMissing from '../assets/images/texture-missing.png';
import Vector2 from "../utils/Vector2";
import GetImageData from "../utils/GetImageData";


// Types

type ItemElement = 'PHYSICAL' | 'EXPLOSIVE' | 'ELECTRIC' | 'COMBINED';
type ItemType = (
  'TORSO' | 'LEGS' | 'SIDE_WEAPON' | 'TOP_WEAPON' | 'DRONE'
  | 'CHARGE_ENGINE' | 'TELEPORTER' | 'GRAPPLING_HOOK' | 'MODULE'
);

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

export interface RawItem {
  id: number;
  name: string;
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



// Constructor

export default class Item {

	private static maxImageSize = 600;
	private static defaultImage = {
    url: textureMissing,
    width: 200,
    height: 200,
  };


	raw: RawItem;

  id: number;
  type: ItemType;
	element: ItemElement;
	stats: ItemStats;
	tags: string[] = [];

	// Graphic
  name: string;
	transform_range: string;
	attachment: TorsoAttachment | Vector2 | null = null;
	kind: string;
	private image: typeof Item['defaultImage'] | null = null;


	constructor (raw: RawItem) {

		this.raw = raw;

		this.id = raw.id;
		this.type = raw.type;
		this.element = raw.element;
		this.stats = raw.stats;
		
		this.name = raw.name;
		this.transform_range = raw.transform_range;
		this.kind = (raw.element + '_' + raw.type).toLowerCase();

		this.setTags();
		this.setAttachment();
	}


	public async loadImage (baseURL: string): Promise<void> {

		const src = this.raw.image.replace('%url%', baseURL);

		this.image = await GetImageData.base64(src, Item.maxImageSize);

		if (this.raw.width) {
			this.image.width = this.raw.width;
		}

		if (this.raw.height) {
			this.image.height = this.raw.height;
		}

		this.setAttachment();

	}


	public getImage (): typeof Item['defaultImage'] {
		return this.image ? this.image : Item.defaultImage;
	}


	private setTags (): void {

		const { raw } = this;
		const tags = raw.tags ? [...raw.tags] : [];

		if (tags.includes('legacy')) {
			// Is legacy premium?
			if (raw.transform_range[0] === 'M') {
				tags.push('premium');
			}
		} else {
			// Is reloaded premium?
			if ('LM'.includes(raw.transform_range[0])) {
				tags.push('premium');
			}
		}

		if (!tags.includes('melee')) {
			// Is jumping weapon?
			if (raw.stats.advance || raw.stats.retreat) {
				tags.push('require_jump');
			}
		}

		this.tags = tags;

	}


	private setAttachment (): void {

		if (this.raw.attachment) {
			this.attachment = this.raw.attachment;
			return;
		}

		const { width, height } = this.getImage();
	
		switch (this.type) {
	
			case 'TORSO':
				this.attachment = {
					leg1:  new Vector2(width * 0.3,  height * 0.9),
					leg2:  new Vector2(width * 0.7,  height * 0.9),
					side1: new Vector2(width * 0.25, height * 0.65),
					side2: new Vector2(width * 0.75, height * 0.65),
					side3: new Vector2(width * 0.20, height * 0.4),
					side4: new Vector2(width * 0.80, height * 0.4),
					top1:  new Vector2(width * 0.25, height * 0.1),
					top2:  new Vector2(width * 0.75, height * 0.1),
				};
				break;
	
			case 'LEGS':
				this.attachment = new Vector2(width * 0.5, height * 0.1);
				break;
	
			case 'SIDE_WEAPON':
				this.attachment = new Vector2(width * 0.4, height * 0.5);
				break;
	
			case 'TOP_WEAPON':
				this.attachment = new Vector2(width * 0.3, height * 0.8);
				break;
	
			default:
				this.attachment = null;
				break;
	
		}
	}

}