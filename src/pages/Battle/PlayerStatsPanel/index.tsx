import React, { useState } from 'react';
import ProgressBar from '../../../components/ProgressBar';
import BattlePlayerData from '../../../classes/BattlePlayerData';
import TooltipM from '../../../managers/TooltipManager';
import ds from '../../../utils/decimalSeparators';
import phyResShieldIcon from '../../../assets/images/icons/phyResShield.png';
import expResShieldIcon from '../../../assets/images/icons/expResShield.png';
import eleResShieldIcon from '../../../assets/images/icons/eleResShield.png';

import './styles.css';
import { Item } from '../../../managers/ItemsManager';


interface PlayerStatsPanelParams extends React.HTMLProps<HTMLDivElement> {
  player: BattlePlayerData;
  side?: "left" | "right";
}

const PlayerStatsPanel: React.FC<PlayerStatsPanelParams> = props => {

  const [viewPlayerWeapons, setViewPlayerWeapons] = useState(false);

  const { player, side = 'left' } = props;
  const legs: [Item, number] = [player.items[1] as Item, 1]; // Assumes one never goes to battle without legs

  const {
    healthCap,
    health,
    eneCap,
    energy,
    eneReg,
    heaCap,
    heat,
    heaCol,
    phyRes,
    expRes,
    eleRes
  } = player.stats;

  if (energy > eneCap) debugger;

  return (
    <div className={`player-stats-panel ${player.admin ? 'admin' : ''} ${side}`} {...props}>

      <img
        src={player.items[0]?.image.url}
        alt=""
        className="pfp"
      />

      <div className="player-name">{player.mech.name}</div>

      <ProgressBar 
        label={`${ds(health)}/${ds(healthCap)}`}
        progress={health / healthCap * 100}
        color="#ddaa22"
        tip="Health"
        style={{ gridArea: 'health' }}
      />

      <ProgressBar 
        label={`${ds(energy)}/${ds(eneCap)}`}
        progress={energy / eneCap * 100}
        color="#22aadd"
        tip={`Energy (${ds(eneReg)} regeneration)`}
        style={{ gridArea: 'energy' }}
      />

      <ProgressBar 
        label={`${ds(heat)}/${ds(heaCap)}`}
        progress={heat / heaCap * 100}
        color="#dd2222"
        tip={`Heat (${ds(heaCol)} cooling)`}
        style={{ gridArea: 'heat' }}
      />

      <div className="resistances-container">
        <div className="resistance-display" ref={e => TooltipM.listen(e, phyRes + ' Physical Damage Resistance')}>
          <img src={phyResShieldIcon} alt="Physical Resistance"/>
          <span>{phyRes}</span>
        </div>
        <div className="resistance-display" ref={e => TooltipM.listen(e, expRes + ' Explosive Damage Resistance')}>
          <img src={expResShieldIcon} alt="Explosive Resistance"/>
          <span>{expRes}</span>
        </div>
        <div className="resistance-display" ref={e => TooltipM.listen(e, eleRes + ' Electric Damage Resistance')}>
          <img src={eleResShieldIcon} alt="Electric Resistance"/>
          <span>{eleRes}</span>
        </div>
      </div>

      <div className="buttons">
        <button className="classic-button" onClick={() => setViewPlayerWeapons(!viewPlayerWeapons)}>?</button>
      </div>

      {viewPlayerWeapons &&
        <div className="player-weapons">
          {[...player.weapons, legs].map(([item, itemIndex]) => 
            <button
              key={itemIndex}
              ref={e => TooltipM.listen(e, { item })}
              className="classic-button">
              <img src={item.image.url} alt={item.name} />
              {item.stats.uses &&
                <span>
                  <span style={{ width: player.uses[itemIndex] / item.stats.uses * 100 + '%' }}></span>
                </span>
              }
            </button>
          )}
        </div>
      }

    </div>
  );
};


export default PlayerStatsPanel;
