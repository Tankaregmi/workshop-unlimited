import React, { CSSProperties, useState } from 'react';
import { useHistory } from 'react-router-dom';
import MechGfx from '../../components/MechGfx';
import EquipmentSlot from './EquipmentSlot';
import StatBlocks from '../../components/StatBlocks';
import ItemSelectingTab from '../../components/ItemSelectingTab';
import Popup, { PopupParams } from '../../components/Popup';
import pagePaths from '../pagePaths';
import Item from '../../classes/Item';

import MechSavesM, { Mech } from '../../managers/MechSavesManager';
import TooltipM from '../../managers/TooltipManager';
import BattleUtils from '../../battle/BattleUtils';

import { ReactComponent as CrossedSwordsIcon } from '../../assets/images/icons/crossed-swords.svg';
import { ReactComponent as MechIcon } from '../../assets/images/icons/mech.svg';
import { ReactComponent as TrashBinIcon } from '../../assets/images/icons/trash-bin.svg';
import { ReactComponent as PlusIcon } from '../../assets/images/icons/plus.svg';
import { ReactComponent as CogIcon } from '../../assets/images/icons/cog.svg';

import slotsConfig from './slotsConfig';

import './styles.css';


const Workshop: React.FC = () => {

  const history = useHistory();

  const [mech, setMech] = useState<Mech>(MechSavesM.getLastMech());
  const [focusedSlotInfo, setFocusedSlotInfo] = useState({ index: -1, type: '', });
  const [showExtras, setShowExtras] = useState(false);
  const [popup, setPopup] = useState<PopupParams | null>(null);

  const getNextIndex = ((i = 0) => () => i++)();
  const blurChildren = showExtras || !!popup || !!focusedSlotInfo.type;


  function onSelectItem (item: Item | null): void {
    const newMech = Object.assign({}, mech);
    newMech.setup[focusedSlotInfo.index] = item;
    MechSavesM.saveMech(newMech);

    setMech(newMech);
    setFocusedSlotInfo({ index: -1, type: '', });
  }

  function onClickSlot (index: number, type: string): void {
    setFocusedSlotInfo({ index, type });
  }

  function onClearSlot (index: number): void {
    const newMech = Object.assign({}, mech);
    newMech.setup[index] = null;
    MechSavesM.saveMech(newMech);

    setFocusedSlotInfo({ index: -1, type: '', });
    setMech(newMech);
  }

  function createSlotsGroup (groupName: 'parts' | 'specials' | 'modules') {
    const gridAreas = 'abcdefghi';
    return (
      <div className={groupName + '-slots'}>
        {slotsConfig[groupName].map((config, i) => {
          const itemIndex = getNextIndex();
          return <EquipmentSlot
            key={i}
            config={config}
            style={groupName === 'parts' ? { gridArea: gridAreas[i] } : undefined}
            item={mech.setup[itemIndex] || null}
            onClick={() => onClickSlot(itemIndex, config[0])}
            onClear={() => onClearSlot(itemIndex)}
          />
        })}
      </div>
    );
  }

  function dismountMech (): void {
    const newMech = Object.assign({}, mech);
    newMech.setup = Array(20).fill(null);
    MechSavesM.saveMech(newMech);
    setMech(newMech);
  }

  function onClickBattle () {

    const { can, reason } = BattleUtils.canBattleWithSetup(mech.setup);
    const Ok = () => setPopup(null);

    if (can) {
      history.push(pagePaths.lobby);
    } else {
      setPopup({
        title: 'Wait!',
        info: reason,
        onOffClick: Ok,
        options: { Ok }
      });
    }
  }

  return (
    <div id="screen-workshop" className={blurChildren ? 'blur-children' : undefined}>

      <MechGfx setup={mech.setup} outline />

      {createSlotsGroup('parts')}
      {createSlotsGroup('specials')}
      {createSlotsGroup('modules')}

      <div className="mech-summary classic-box">
        <StatBlocks source={mech.setup} />
      </div>

      <button
        className="extras classic-box"
        onClick={() => setShowExtras(!showExtras)}
        ref={e => TooltipM.listen(e, { text: 'Extras' })}>
        <PlusIcon />
      </button>

      <button
        className="settings classic-box"
        onClick={() => history.push(pagePaths.settings)}
        ref={e => TooltipM.listen(e, { text: 'Settings' })}>
        <CogIcon />
      </button>

      {showExtras && (
        <div className="tab extras-tab" onClick={() => setShowExtras(false)}>

          <button
            ref={e => TooltipM.listen(e, { text: 'Work in progress!' })}
            className="classic-button"
            onClick={onClickBattle}
            style={{ '--color': 'var(--color-on)' } as CSSProperties}>
            <CrossedSwordsIcon fill="var(--color-on)" />
            <span>Battle</span>
          </button>

          <button
            className="classic-button"
            onClick={() => history.push(pagePaths.mechs)}>
            <MechIcon />
            <span>Manage Mechs</span>
          </button>

          <button
            className="classic-button"
            onClick={ dismountMech }
            style={{ '--color': 'var(--color-off)' } as CSSProperties}>
            <TrashBinIcon fill="var(--color-off)" />
            <span>Dismount Mech</span>
          </button>

        </div>
      )}

      {focusedSlotInfo.type && (
        <ItemSelectingTab
          type={focusedSlotInfo.type}
          currentItem={mech.setup[focusedSlotInfo.index]}
          selectItem={onSelectItem}
        />
      )}

      {popup && <Popup {...popup} />}

    </div>
  );
};


export default Workshop;
