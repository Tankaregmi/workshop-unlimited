import React from 'react';
import Item from '../../classes/Item';
import StatBlocks from '../StatBlocks';
import './styles.css';



const ItemInfo: React.FC<{ item: Item }> = ({ item }) => {

  const tag = (text: string, color: string) => {
    return <span className="tag" style={{ color }}>{ text }</span>;
  };

  return (
    <div className="component-item-info">
      { item.name }
      { tag(item.kind, 'var(--color-text-inactive)') }

      { item.tags.includes('custom')       && tag('custom',       '#44eebb') }
      { item.tags.includes('unreleased')   && tag('unreleased',   '#ee44dd') }
      { item.tags.includes('premium')      && tag('premium',      '#eeaa44') }
      { item.tags.includes('require_jump') && tag('require_jump', '#ee5511') }

      <div className="separator"></div>
      <div className="item-stat-blocks">
        <StatBlocks source={item}/>
      </div>
    </div>
  );
};


export default ItemInfo;
