import React, { useState } from 'react';
import ProgressBar from '../../../components/ProgressBar';
import BattlePlayerData from '../../../classes/BattlePlayerData';
import TooltipM from '../../../managers/TooltipManager';
import ds from '../../../utils/decimalSeparators';
import phyResShieldIcon from '../../../assets/images/icons/phyResShield.png';
import expResShieldIcon from '../../../assets/images/icons/expResShield.png';
import eleResShieldIcon from '../../../assets/images/icons/eleResShield.png';
import { ReactComponent as UsesIcon } from '../../../assets/images/stats/uses.svg';
import Battle from '../../../classes/Battle';

import './styles.css';
import Item from '../../../classes/Item';


interface PlayerStatsPanelParams extends React.HTMLProps<HTMLDivElement> {
  player: BattlePlayerData;
  battle: Battle;
  side?: "left" | "right";
}

const PlayerStatsPanel: React.FC<PlayerStatsPanelParams> = props => {

  const [viewPlayerWeapons, setViewPlayerWeapons] = useState(false);

  const { player, side = 'left', battle } = props;
  const legs: [Item, number] = [player.items[1] as Item, 1]; // Assumes one never goes to battle without legs
  const ownsTurn = battle.turnOwnerID === player.id;
  const turns = ownsTurn ? battle.turns : 0;

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


  if (energy > eneCap) debugger; // lol idk what i was doing here but won't remove



  return (
    <div className={`player-stats-panel ${side}`} {...props}>

      <div className="profile-picture-container classic-box">
        <img
          src={player.items[0]?.getImage().url}
          alt=""
          className="pfp"
        />
      </div>

      <div className="player-name">{player.name}</div>

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
              <img src={item.getImage().url} alt={item.name} />
              {item.stats.uses &&
                <span>
                  <span style={{ width: player.uses[itemIndex] / item.stats.uses * 100 + '%' }}></span>
                </span>
              }
            </button>
          )}
        </div>
      }

      <div className="turns classic-box">
        <UsesIcon style={{ filter: turns     ? '' : 'brightness(0.4)' }} />
        <UsesIcon style={{ filter: turns > 1 ? '' : 'brightness(0.4)' }} />
      </div>

    </div>
  );
};


export default PlayerStatsPanel;
