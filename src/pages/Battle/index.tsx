import React, { useEffect, useState } from 'react';
import MechGfx from '../../components/MechGfx';
import PlayerStatsPanel from './PlayerStatsPanel';
import Footer from './Footer';
import Popup, { PopupParams } from '../../components/Popup';
import { Redirect, useHistory } from 'react-router-dom';
import SocketManager from '../../managers/SocketManager';
import BattleData, { BattleStartData } from '../../classes/Battle';
import BattleManager, { BattleEvent } from '../../managers/BattleManager';
import BattleAI from '../../classes/BattleAI';
import pagePaths from '../pagePaths';
import './styles.css';
import BattleUtils from '../../battle/BattleUtils';



const Battle: React.FC = () => {

  const history = useHistory<{ battle: BattleStartData, mirror: boolean }>();

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [viewLogs, setViewLogs] = useState(false);
  const [battle, setBattle] = useState(
    history.location.state && history.location.state.battle
    ? new BattleData(history.location.state.battle)
    : null
  );



  // Graphic
  const mechScale = 0.325;



  // Effects

  useEffect(() => {
    if (battle
     && !battle.complete
     && !battle.online
     && !BattleUtils.isPlayerTurn(battle)) {

      setTimeout(() => {
        const event = BattleAI.think(battle);
        BattleManager.handleEvent(battle, event);
        setBattle(Object.assign({}, battle));
      }, 1000);

    }
  }, [battle]);


  useEffect(() => {

    const attachmentID = SocketManager.attach({

      'battle.opponent_quit' (resolve): void {
        resolve();
        onOpponentQuit();
      },
    
      'battle.opponent_action' (resolve, _reject, data): void {
        resolve();
        if (!BattleUtils.isPlayerTurn(battle)) {
          BattleManager.handleEvent(battle, data.event);
          setBattle(Object.assign({}, battle));
        }
      },

    });

    return () => {
      SocketManager.detach(attachmentID);
    };

  });



  // Functions

  async function onQuitBattle (): Promise<void> {

    if (battle.online) {

      setPopup({ title: 'Quitting...' });

      try {
        // Why do we await if we don't care about errors? No idea.
        await SocketManager.emit('battle.quit', null);
      } catch (err) {
        console.log('Error while quitting battle:', err);
      }
    }

    history.goBack();

  }


  function onOpponentQuit (): void {
    BattleManager.setBattleComplete(battle, true, true);
    setBattle(Object.assign({}, battle));
  }


  async function dispatchBattleEvent (event: BattleEvent): Promise<void> {

    if (battle.turnOwnerID !== battle.player.id) {
      return;
    }

    if (battle.online) {

      setPopup({ title: 'Please wait...' });

      try {
        await SocketManager.emit('battle.action', event);
      } catch (err) {
        onOpponentQuit(); // Yeah for now we just pretend the opponent quit
        return;
      } finally {
        setPopup(null);
      }

    }

    BattleManager.handleEvent(battle, event);
    setBattle(Object.assign({}, battle));

  }



  // Render

  if (!battle) {
    return <Redirect to={pagePaths.workshop} />;
  }

  return (
    <div id="screen-battle">

      <PlayerStatsPanel player={battle.player}   battle={battle} />
      <PlayerStatsPanel player={battle.opponent} battle={battle} side="right" />

      <div className="buttons-container">
        <button className="classic-button logs-btn" onClick={() => setViewLogs(true)}>
          Logs
        </button>
        <button className="classic-button" onClick={onQuitBattle}>
          Quit
        </button>
      </div>

      <div className="mechs-container" style={{
        transform: history.location.state.mirror ? 'scaleX(-1)' : ''
      }}>
        <div
          className="mech-gfx-container"
          style={{
            transform: `scaleX(${BattleUtils.getDirection(battle)})`,
            left: 5 + battle.player.position * 10 + '%',
            filter: BattleUtils.isPlayerTurn(battle) ? 'drop-shadow(0 0 0.2rem #00ff00)' : '',
          }}>
          <MechGfx
            setup={battle.player.items}
            droneActive={battle.player.droneActive}
            scale={mechScale}
            outline={true}
          />
        </div>
        <div
          className="mech-gfx-container"
          style={{
            transform: `scaleX(${BattleUtils.getDirection(battle) * -1})`,
            left: 5 + battle.opponent.position * 10 + '%',
            filter: !BattleUtils.isPlayerTurn(battle) ? 'drop-shadow(0 0 0.2rem #ff0000)' : '',
          }}>
          <MechGfx
            setup={battle.opponent.items}
            droneActive={battle.opponent.droneActive}
            scale={mechScale}
            outline={true}
          />
        </div>
      </div>

      {viewLogs &&
        <div className="logs-tab" onClick={() => setViewLogs(false)}>
          <div className="logs-tab-contents">
            {battle.logs.map(({ color, message }, i) =>
              <div style={{ color }} key={i}>{message}</div>
            )}
          </div>
        </div>
      }

      {BattleUtils.isPlayerTurn(battle) &&
        <Footer
          battle={battle}
          resolveAction={dispatchBattleEvent}
          mirror={history.location.state.mirror}
        />
      }

      {battle.complete && !viewLogs &&
        <Popup
          title={battle.complete.victory ? 'You Won' : 'You Lost'}
          info={battle.complete.victory && battle.complete.quit && 'Opponent has quit!'}
          options={{
            'View Logs': () => setViewLogs(true),
            'Go Back': () => history.goBack(),
          }}
        />
      }

      {popup && <Popup {...popup} />}

    </div>
  );
};


export default Battle;
