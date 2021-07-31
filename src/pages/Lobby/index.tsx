import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import sha256 from 'simple-js-sha2-256';

import Header from '../../components/Header';
import MechGfx from '../../components/MechGfx';
import Popup, { PopupParams } from '../../components/Popup';
import HalvedButton from '../../components/HalvedButton';

import MechSavesM, { Mech } from '../../managers/MechSavesManager';
import SocketManager from '../../managers/SocketManager';
import ItemsManager from '../../managers/ItemsManager';
import pagePaths from '../pagePaths';
import BattleUtils from '../../battle/BattleUtils';
import { BattleStartData } from '../../classes/Battle';
import { arrayRandomItem } from '../../utils/arrayRandom';

import './styles.css';


function isValidSetupHash (setupIDs: number[], hash: string): boolean {
  const setup = setupIDs.map(ItemsManager.getEssentialItemDataByID);
  return hash === sha256(JSON.stringify(setup));
}


const Lobby: React.FC = () => {

  const history = useHistory();

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [inPool, setInPool] = useState(false);
  const [mech] = useState(MechSavesM.getLastMech());


  useEffect(() => {

    const id = SocketManager.attach({

      'match_maker.is_valid_setup' (resolve, reject, data): void {

        const isSetupHashValid = isValidSetupHash(data.setupIDs, data.setupHash);

        if (isSetupHashValid) {

          const setup = ItemsManager.ids2items(data.setupIDs);
          const { can, reason } = BattleUtils.canBattleWithSetup(setup);

          if (can) {
            resolve();
          } else {
            reject({ message: reason });
          }

        } else {
          reject({ message: `Invalid setup hash:\nsetup: [${data.setupIDs.join(', ')}]\nhash: ${data.setupHash}` });
        }

      },

      'battle.start' (resolve, _reject, data: BattleStartData): void {

        const battle = data;

        resolve();
        history.push({
          pathname: pagePaths.battle,
          state: {
            battle,
            mirror: battle.player.position > battle.opponent.position,
          },
        });
      },

    });

    return () => SocketManager.detach(id);

  });


  async function arenaPoolJoin (): Promise<void> {

    setPopup({
      title: 'Please wait',
      info: 'Joining match maker...'
    });

    try {

      const setupForServer = mech.setup.map(item => item && ItemsManager.getEssentialItemData(item));

      await SocketManager.emit('match_maker.join', {
        name: mech.name,
        setup: setupForServer,
      });

      setInPool(true);
      setPopup(null);

    } catch (err) {

      setPopup({
        title: 'Could not join match maker!',
        info: err.message,
        onOffClick: () => setPopup(null),
      });

      return;

    }

  }

  function arenaPoolQuit (): void {
    SocketManager.emit('match_maker.quit', null);
    setInPool(false);
  }

  function onGoBack (): void {
    if (inPool) {
      arenaPoolQuit();
    }
    history.goBack();
  }

  function onBattleVSComputer (): void {

    const [pos1, pos2] = BattleUtils.getRandomStartPositions();

    const battle: BattleStartData = {
      online: false,
      starterID: 'player',
      player: {
        id: 'player',
        name: 'You',
        position: pos1,
        setup: ItemsManager.items2ids(mech.setup),
      },
      opponent: {
        id: 'opponent',
        name: 'Bot',
        position: pos2,
        setup: ItemsManager.items2ids(getOponentFromMechSaves().setup),
      },
    };
    
    history.push({
      pathname: pagePaths.battle,
      state: {
        battle,
        mirror: battle.player.position > battle.opponent.position,
      },
    });
  }

  function getOponentFromMechSaves (): Mech {

    const mechs = Object.values(MechSavesM.getMechsForCurrentPack());
    const mechsApt = mechs.filter(mech => BattleUtils.canBattleWithSetup(mech.setup));
    const mechsPreffered = mechsApt.filter(mech => mech.name.includes('!'));
  
    return (
      mechsPreffered.length
      ? arrayRandomItem(mechsPreffered)
      : arrayRandomItem(mechsApt)
    ) as Mech;
  }


  return (
    <div id="lobby-screen">

      <Header
        title="Arena"
        onGoBack={onGoBack}
      />

      <div className="player-container">
        <MechGfx
          scale={0.6}
          setup={mech.setup}
          outline={true}
        />
      </div>

      <div className="opponent-container" style={{ transform: 'scaleX(-1)' }}>
        <MechGfx
          scale={0.6}
          setup={mech.setup}
          outline={true}
        />
      </div>

      <div className="battle-button-holder">
        {inPool ? (
          <button onClick={arenaPoolQuit} className="cancel classic-button">
            Searching For Opponent...
            <span>(Click to cancel)</span>
          </button>
        ) : (
          <HalvedButton
            first={['Online Battle', arenaPoolJoin]}
            last={['Battle VS Computer', onBattleVSComputer]}
          />
        )}
      </div>

      {popup && <Popup { ...popup } />}

    </div>
  );
};


export default Lobby;
