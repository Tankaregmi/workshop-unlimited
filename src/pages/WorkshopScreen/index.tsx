import React, { useContext, useState } from 'react';
import MechGfx from '../../components/MechGfx';
import EquipmentSlot from './EquipmentSlot';
import StatBlocks from '../../components/StatBlocks';
import ItemSelectingTab from '../../components/ItemSelectingTab';
import Popup, { PopupParams } from '../../components/Popup';
import MechSavesManager, { Mech } from '../../managers/MechSavesManager';
import { Item } from '../../managers/ItemsManager';
import TooltipManager from '../../managers/TooltipManager';
import slotsConfig from './slotsConfig';
import BattleManager from '../../managers/BattleManager';
import PageContext from '../../contexts/PageContext';
import { ReactComponent as CrossedSwordsIcon } from '../../assets/images/icons/crossed-swords.svg';
import { ReactComponent as MechIcon } from '../../assets/images/icons/mech.svg';
import { ReactComponent as TrashBinIcon } from '../../assets/images/icons/trash-bin.svg';
import { ReactComponent as PlusIcon } from '../../assets/images/icons/plus.svg';
import { ReactComponent as CogIcon } from '../../assets/images/icons/cog.svg';
import { ReactComponent as DiscordLogo } from '../../assets/images/discord-logo.svg';
import './styles.css';


const Workshop: React.FC = () => {

  const [mech, setMech] = useState<Mech>(MechSavesManager.getLastMech());
  const [focusedSlotInfo, setFocusedSlotInfo] = useState({ index: -1, type: '', });
  const [showExtras, setShowExtras] = useState(false);
  const [showDiscord, setShowDiscord] = useState(false);
  const [popup, setPopup] = useState<PopupParams | null>(null);
  const { setPage } = useContext(PageContext);

  const getNextIndex = ((i = 0) => () => i++)();
  const blurChildren = showExtras || showDiscord || !!popup || !!focusedSlotInfo.type;


  function onSelectItem (item: Item | null): void {
    const newMech = Object.assign({}, mech);
    newMech.setup[focusedSlotInfo.index] = item;
    MechSavesManager.saveMech(newMech);

    setMech(newMech);
    setFocusedSlotInfo({ index: -1, type: '', });
  }

  function onClickSlot (index: number, type: string): void {
    setFocusedSlotInfo({ index, type });
  }

  function onClearSlot (index: number): void {
    const newMech = Object.assign({}, mech);
    newMech.setup[index] = null;
    MechSavesManager.saveMech(newMech);

    setFocusedSlotInfo({ index: -1, type: '', });
    setMech(newMech);
  }

  function createSlotsGroup (groupName: 'parts' | 'specials' | 'modules') {
    const gridAreas = 'abcdefghi';
    return (
      <div className={groupName + '-slots'}>
        {
          slotsConfig[groupName].map((config, i) => {
            const itemIndex = getNextIndex();
            const item = mech.setup[itemIndex] || null;
            const style = groupName === 'parts' ? { gridArea: gridAreas[i] } : undefined;
            return <EquipmentSlot
              key={i}
              config={config}
              style={style}
              item={item}
              onClick={() => onClickSlot(itemIndex, config[0])}
              onClear={() => onClearSlot(itemIndex)}
            />
          })
        }
      </div>
    );
  }

  function dismountMech (): void {
    const newMech = Object.assign({}, mech);
    newMech.setup = Array(20).fill(null);
    MechSavesManager.saveMech(newMech);
    setMech(newMech);
  }

  function onClickBattle () {

    const { can, reason } = BattleManager.canSetupBattle(mech.setup);
    const Ok = () => setPopup(null);

    if (can) {
      setPage('lobby');
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
        ref={e => TooltipManager.listen(e, { text: 'Extras' })}>
        <PlusIcon />
      </button>

      <button
        className="settings classic-box"
        onClick={() => setPage('settings')}
        ref={e => TooltipManager.listen(e, { text: 'Settings' })}>
        <CogIcon />
      </button>

      {showExtras && (
        <div className="tab extras-tab" onClick={() => setShowExtras(false)}>

          <button
            ref={e => TooltipManager.listen(e, { text: 'Work in progress!' })}
            className="classic-button"
            onClick={onClickBattle}
            style={{ '--color': 'var(--color-on)' }}>
            <CrossedSwordsIcon fill="var(--color-on)" />
            <span>Battle</span>
          </button>

          <button
            className="classic-button"
            onClick={() => setPage('mechs')}>
            <MechIcon />
            <span>Manage Mechs</span>
          </button>

          <button
            className="classic-button"
            onClick={ dismountMech }
            style={{ '--color': 'var(--color-off)' }}>
            <TrashBinIcon fill="var(--color-off)" />
            <span>Dismount Mech</span>
          </button>

          <button
            ref={e => TooltipManager.listen(e, { text: 'Wanna share some cool idea? Report a bug?' })}
            className="classic-button"
            onClick={() => setShowDiscord(true)}
            style={{ '--color': 'var(--color-discord)' }}>
            <DiscordLogo fill="var(--color-discord)" />
            <span>Join Our Discord</span>
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

      {showDiscord && (
        <div className="tab classic-box" onClick={() => setShowDiscord(false)}>
          <iframe
            title="Workshop Unlimited"
            src="https://discordapp.com/widget?id=527596699988918282&theme=dark"
            width="350"
            height="400"
            frameBorder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts">
          </iframe>
        </div>
      )}

      {popup && <Popup {...popup} />}

    </div>
  );
};


export default Workshop;
