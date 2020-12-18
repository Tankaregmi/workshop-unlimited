import { Item } from "./ItemsManager";
import { MechSetup } from "./MechSavesManager";


export type TooltipData = null | {
  text?: string;
  item?: Item;
  jsx?: JSX.Element;
  setup?: MechSetup;
}


class TooltipManager
{
  data: TooltipData = null;

  onChange: ((data: any) => any) | null = null;

  setData (data: TooltipData): void {
    this.data = data;
    this.onChange && this.onChange(data);
  }

  getData (): TooltipData {
    return this.data;
  }

  clear (): void {
    this.data = null;
    this.onChange && this.onChange(null);
  }

  listen (element: HTMLElement | null, data: TooltipData | string): void {
    if (element) {

      const setData = () => this.setData(
        typeof data === 'string'
        ? { text: data }
        : data
      );

      const clear = () => this.clear();
  
      element.addEventListener('pointerenter', setData);
      element.addEventListener('pointerleave', clear);
      element.addEventListener('click', clear);
    }
  }
}


export default new TooltipManager();
