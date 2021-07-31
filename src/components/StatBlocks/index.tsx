import React from 'react';
import Item from '../../classes/Item';
import { MechSetup } from '../../managers/MechSavesManager';
import StatsM, { ItemStatKey } from '../../managers/StatsManager';
import decimalSeparators from '../../utils/decimalSeparators';

import './styles.css';


interface StatBlocksParams {
  source: Item | MechSetup;
}


function getColorForWeight (weight: number): string {
  return (
    weight > 1015 ? 'var(--color-off)'  :
    weight > 1000 ? 'var(--color-bad)'  :
    weight > 999  ? 'var(--color-good)' :
    weight > 995  ? 'var(--color-on)'   :
    'inherit'
  );
}


const StatBlocks: React.FC<StatBlocksParams> = ({ source }) => {

  const stats = StatsM.getStats(source);
  const entries = Object.entries(stats) as [ItemStatKey, number | number[]][];

  return (
    <>
      {entries.map(([key, value]) => 
        <div key={key} className="stat-block">

          <img src={StatsM.getStatInstruction(key).imageURL} alt={key} />

          <output style={{
            color: key === 'weight' ? getColorForWeight(value as number) : undefined
          }}>
            {Array.isArray(value) ? (
              value.map(decimalSeparators).join('-')
            ) : (
              decimalSeparators(value)
            )}
          </output>

        </div>
      )}
    </>
  )
};


export default StatBlocks;
