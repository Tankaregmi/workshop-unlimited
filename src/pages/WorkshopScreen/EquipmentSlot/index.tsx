import React from 'react';
import LocalStorageM from '../../../managers/LocalStorageManager';
import TooltipM from '../../../managers/TooltipManager';
import { ReactComponent as CrossImg } from '../../../assets/images/icons/cross.svg';
import { Item } from '../../../managers/ItemsManager';


interface EquipmentSlotParams {
  config: [string, React.FC<React.SVGProps<SVGSVGElement>>];
  style?: React.CSSProperties;
  item: Item | null;
  onClick?: () => any;
  onClear?: () => any;
}


const EquipmentSlot: React.FC<EquipmentSlotParams> = ({ config, style, item, onClick, onClear }) => {

  const SlotImg = config[1];
  const { clear_slot_button } = LocalStorageM.getSettings();

  return (
    <div className="equipment-slot" style={style}>
      
      {clear_slot_button && item && (
        <button
          onClick={onClear}
          className="clear"
          ref={e => TooltipM.listen(e, { text: 'Clear Slot' })}>
          <CrossImg />
        </button>
      )}
      
      <button onClick={onClick} className="click-area">
        {item ? (
          <img
            ref={e => TooltipM.listen(e, { item })}
            src={item.image.url}
            alt={item.name} />
        ) : (
          <SlotImg />
        )}
      </button>

    </div>
  );
};


export default EquipmentSlot;
