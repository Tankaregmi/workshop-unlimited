import React, { useContext, useState } from 'react';

import Header from '../../components/Header';
import MechGfx from '../../components/MechGfx';
import Popup, { PopupParams } from '../../components/Popup';
import HalvedButton from '../../components/HalvedButton';
import PageContext from '../../contexts/PageContext';

import MechSavesM, { Mech } from '../../managers/MechSavesManager';
import SocketM from '../../managers/SocketManager';
import DataM from '../../managers/DataManager';
import BattleM from '../../managers/BattleManager';

import Battle from '../../classes/Battle';
import { arrayRandomItem } from '../../utils/arrayRandom';

import './styles.css';


const Lobby: React.FC = () => {

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const { setPage } = useContext(PageContext);

  const [inPool, setInPool] = useState(false);
  const [mech] = useState(MechSavesM.getLastMech());


  function joinArenaPool () {

    setPopup({ title: 'Please wait!' });

    return SocketM.arena_pool_join(mech)
      .then(() => {
        setInPool(true);
        setPopup(null);
      })
      .catch((error: any) => {
        setPopup({
          title: error.name || 'Error',
          info: error.message === 'xhr poll error' ? 'could not connect to socket' : error.message,
          options: { Ok: () => setPopup(null) }
        });
      });
  }

  async function quitArenaPool () {

    if (!inPool) {
      setPopup({
        title: 'Error',
        info: 'Not in pool',
        options: {
          Ok: () => setPopup(null)
        }
      });
      return;
    }

    setPopup({ title: 'Please wait!' });

    try {
      await SocketM.arena_pool_quit();
    } catch (error) {
      setPopup({
        title: error.name || 'Error',
        info: error.message,
        options: { Ok: () => setPopup(null) }
      });
      return;
    }

    setInPool(false);
    setPopup(null);
  }

  async function onGoToWorkshop () {

    if (inPool) {
      try {
        await quitArenaPool();
      } catch (error) {
        setPopup({
          title: error.name || 'Error',
          info: error.toString(),
          options: { Ok: () => setPopup(null) }
        });
        return;
      }
    }

    setPage('workshop');
  }

  function battleVSComputer () {
    DataM.battle = new Battle({
      mechs: [mech, getOponentFromMechSaves()],
      multiplayer: false,
      turnOwnerIndex: 0
    });
    setPage('battle');
  }

  function getOponentFromMechSaves () {

    const mechs = Object.values(MechSavesM.getMechsForCurrentPack());
    const mechsApt = mechs.filter(mech => BattleM.canSetupBattle(mech.setup));
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
        onGoBack={onGoToWorkshop}
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
          <button onClick={quitArenaPool} className="cancel classic-button">
            Searching For Opponent...
            <span>(Click to cancel)</span>
          </button>
        ) : (
          <HalvedButton
            first={['Online Battle', joinArenaPool]}
            last={['Battle VS Computer', battleVSComputer]}
            />
        )}
      </div>

      {popup && <Popup { ...popup } />}

    </div>
  );
};


export default Lobby;
