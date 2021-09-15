import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import sha256 from 'simple-js-sha2-256';

import Header from '../../components/Header';
import MechGfx from '../../components/MechGfx';
import Popup, { PopupParams } from '../../components/Popup';
import HalvedButton from '../../components/HalvedButton';

import MechSavesM, { Mech } from '../../managers/MechSavesManager';
import SocketManager from '../../managers/SocketManager';
import ItemsManager, { EssentialItemData } from '../../managers/ItemsManager';
import pagePaths from '../pagePaths';
import BattleUtils from '../../battle/BattleUtils';
import { BattleStartData } from '../../battle/Battle';
import { arrayRandomItem } from '../../utils/arrayRandom';

import './styles.css';


function isValidSetupHash (setup: (EssentialItemData | null)[], hash: string): boolean {

  const validSetup = setup.map(item =>
    item && ItemsManager.getEssentialItemDataByID(item.id)
  );

  return hash === sha256(JSON.stringify(validSetup));

}


const Lobby: React.FC = () => {

  const history = useHistory();

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [inPool, setInPool] = useState(false);
  const [mech] = useState(MechSavesM.getLastMech());


  useEffect(() => {

    const id = SocketManager.attach({

      'match_maker.is_valid_setup' (resolve, reject, data): void {

        const isSetupHashValid = isValidSetupHash(data.setup, data.setupHash);

        if (isSetupHashValid) {

          // The setup is valid relative to my items, but
          // I still have to check if it can battle

          const { can, reason } = BattleUtils.canBattleWithSetup(data.setup);

          if (can) {
            resolve();
          } else {
            reject({ message: reason });
          }

        } else {
          reject({ message: `Invalid setup hash` });
        }

      },

      'battle.start' (resolve, _reject, data: BattleStartData): void {

        const battle = data;

        const { player, opponent } = (() =>
          SocketManager.psocket.socket.id === battle.p1.id
          ? { player: battle.p1, opponent: battle.p2 }
          : { player: battle.p2, opponent: battle.p1 }
        )();

        history.push({
          pathname: pagePaths.battle,
          state: {
            battle,
            playerID: player.id,
            mirror: player.position > opponent.position,
          },
        });

        resolve();

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
    SocketManager.emit('match_maker.quit', null).catch();
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
    const playerID = 'player';

    const battle: BattleStartData = {
      online: false,
      starterID: playerID,
      p1: {
        id: playerID,
        name: 'You',
        position: pos1,
        setup: mech.setup,
      },
      p2: {
        id: 'computer',
        name: 'Bot',
        position: pos2,
        setup: getOponentFromMechSaves().setup,
      },
    };
    
    history.push({
      pathname: pagePaths.battle,
      state: {
        battle,
        playerID,
        mirror: false,
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
