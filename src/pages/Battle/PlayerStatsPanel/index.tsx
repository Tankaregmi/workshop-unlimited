import React from 'react';
import ProgressBar from '../../../components/ProgressBar';
import BattlePlayerData from '../../../classes/BattlePlayerData';
import ds from '../../../utils/decimalSeparators';
import phyResShieldIcon from '../../../assets/images/icons/phyResShield.png';
import expResShieldIcon from '../../../assets/images/icons/expResShield.png';
import eleResShieldIcon from '../../../assets/images/icons/eleResShield.png';

import './styles.css';


interface PlayerStatsPanelParams extends React.HTMLProps<HTMLDivElement> {
  player: BattlePlayerData;
  side?: "left" | "right";
}

const PlayerStatsPanel: React.FC<PlayerStatsPanelParams> = props => {

  const { player, side = 'left' } = props;

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
        <div className="resistance-display">
          <img src={phyResShieldIcon} alt="Physical Resistance"/>
          <span>{phyRes}</span>
        </div>
        <div className="resistance-display">
          <img src={expResShieldIcon} alt="Explosive Resistance"/>
          <span>{expRes}</span>
        </div>
        <div className="resistance-display">
          <img src={eleResShieldIcon} alt="Electric Resistance"/>
          <span>{eleRes}</span>
        </div>
      </div>

    </div>
  );
};


export default PlayerStatsPanel;
