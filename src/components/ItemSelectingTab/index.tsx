import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import Item from '../../classes/Item';
import ItemsManager from '../../managers/ItemsManager';
import StatsManager from '../../managers/StatsManager';
import ItemInfo from '../ItemInfo';

import './styles.css';


interface ItemSelectingTabParams {
  type: string;
  currentItem: Item | null;
  selectItem: (item: Item | null) => void;
}


const ItemSelectingTab: React.FC<ItemSelectingTabParams> = ({ type, currentItem, selectItem }) => {

  const items = ItemsManager.getItems(item => item.type === type);

  const [elementFilters, setElementFilters] = useState(['PHYSICAL', 'EXPLOSIVE', 'ELECTRIC', 'COMBINED']);
  const [activeItem, setActiveItem] = useState(currentItem);
  const [inspectedItem, setInspectedItem] = useState<Item | null>();

  const itemsFiltered = items.filter(item => elementFilters.includes(item.element) || item.element === 'COMBINED');
  const itemToDisplay = inspectedItem || activeItem;


  function onOffClick (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {

    // Responsible for clearing the slot if you don't click on an item

    try {
      // @ts-ignore
      const selectNull = e.nativeEvent.target.getAttribute('data-select-null');
      if (selectNull) {
        selectItem(null);
      }
    } catch (error) {
      // cope
    }

  }

  function onSelectItem (item: Item): void {
    if (isMobile) {
      if (activeItem === null || item.id !== activeItem.id) {
        setActiveItem(item);
      } else {
        selectItem(item);
      }
    } else {
      selectItem(item);
    }
  }

  function addElementFilter (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, element: string): void {
    if (event.shiftKey) {
      if (elementFilters.includes(element)) {
        if (elementFilters.length > 1) {
          setElementFilters(elementFilters.filter(x => x !== element));
        }
      }
      else {
        setElementFilters([...elementFilters, element]);
      }
    }
    else {
      setElementFilters([element]);
    }
  }


  return (
    <div className="item-selecting-tab tab" data-select-null onClick={onOffClick}>
      <div className="content" data-select-null>

        {itemToDisplay !== null && (
          <img
            data-select-null
            src={itemToDisplay.getImage().url}
            alt={itemToDisplay.name}
            className="item-image"
          />
        )}

        {itemToDisplay !== null && (
          <ItemInfo item={itemToDisplay} />
        )}

        <div className="items-list" data-select-null>
          {itemsFiltered.map(item =>
            <button
              key={item.id}
              className={`classic-button ${activeItem && item.id === activeItem.id ? 'active' : ''}`}
              onMouseOver={() => setInspectedItem(item)}
              onMouseOut={() => setInspectedItem(null)}
              onClick={() => onSelectItem(item)}>
              <img src={item.getImage().url} alt={item.name} />
            </button>
          )}
        </div>

        <div className="item-filters">
          <button
            className={`classic-button ${elementFilters.includes('PHYSICAL') ? 'active' : ''}`}
            onClick={e => addElementFilter(e, 'PHYSICAL')}>
            <img src={StatsManager.getStatInstruction('phyDmg').imageURL} alt="Physical"/>
          </button>
          <button
            className={`classic-button ${elementFilters.includes('EXPLOSIVE') ? 'active' : ''}`}
            onClick={e => addElementFilter(e, 'EXPLOSIVE')}>
            <img src={StatsManager.getStatInstruction('expDmg').imageURL} alt="Explosive"/>
          </button>
          <button
            className={`classic-button ${elementFilters.includes('ELECTRIC') ? 'active' : ''}`}
            onClick={e => addElementFilter(e, 'ELECTRIC')}>
            <img src={StatsManager.getStatInstruction('eleDmg').imageURL} alt="Electric"/>
          </button>
        </div>

      </div>
    </div>
  );
};


export default ItemSelectingTab;
