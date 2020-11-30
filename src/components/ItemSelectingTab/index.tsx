import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import ItemsM, { Item } from '../../managers/ItemsManager';
import StatsM from '../../managers/StatsManager';
import ItemInfo from '../ItemInfo';

import './styles.css';


interface ItemSelectingTabParams {
  type: string;
  currentItem: Item | null;
  selectItem: (item: Item | null) => void;
}


const ItemSelectingTab: React.FC<ItemSelectingTabParams> = ({ type, currentItem, selectItem }) => {

  const items = ItemsM.items.filter(item => item.type === type);

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
    <div className="item-selecting-tab" data-select-null onClick={onOffClick}>
      <div className="content" data-select-null>

        {itemToDisplay !== null && (
          <img
            data-select-null
            src={itemToDisplay.image.url}
            alt={itemToDisplay.name}
            className="item-image"/>
        )}

        {itemToDisplay !== null && (
          <ItemInfo item={itemToDisplay} />
        )}

        <div className="items-list" data-select-null>
          {itemsFiltered.map((item, i) =>
            <button
              onMouseOver={() => setInspectedItem(item)}
              onMouseOut={() => setInspectedItem(null)}
              onClick={() => onSelectItem(item)}
              className={activeItem && item.id === activeItem.id ? 'active' : undefined}
              key={item.id}>

              <div
                className="item-img"
                style={{
                  backgroundImage: `url(${ item.image.url })`
                }}>
              </div>

            </button>
          )}
        </div>

        <div className="item-filters">
          <button
            className={elementFilters.includes('PHYSICAL') ? 'active' : undefined}
            onClick={e => addElementFilter(e, 'PHYSICAL')}>
            <img src={StatsM.getStatTemplate('phyDmg').imageURL} alt="Physical"/>
          </button>
          <button
            className={elementFilters.includes('EXPLOSIVE') ? 'active' : undefined}
            onClick={e => addElementFilter(e, 'EXPLOSIVE')}>
            <img src={StatsM.getStatTemplate('expDmg').imageURL} alt="Explosive"/>
          </button>
          <button
            className={elementFilters.includes('ELECTRIC') ? 'active' : undefined}
            onClick={e => addElementFilter(e, 'ELECTRIC')}>
            <img src={StatsM.getStatTemplate('eleDmg').imageURL} alt="Electric"/>
          </button>
        </div>

      </div>
    </div>
  );
};


export default ItemSelectingTab;
