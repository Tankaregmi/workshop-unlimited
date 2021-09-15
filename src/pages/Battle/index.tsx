import React, { useEffect, useState } from 'react';
import MechGfx from '../../components/MechGfx';
import PlayerStatsPanel from './PlayerStatsPanel';
import Footer from './Footer';
import Popup, { PopupParams } from '../../components/Popup';
import { Redirect, useHistory } from 'react-router-dom';
import SocketManager from '../../managers/SocketManager';
import BattleData, { BattleStartData } from '../../battle/Battle';
import BattleManager, { BattleEvent } from '../../battle/BattleManager';
import BattleAI from '../../battle/BattleAI';
import pagePaths from '../pagePaths';
import { cloneDeep } from 'lodash';
import './styles.css';
import BattleUtils from 'src/battle/BattleUtils';



const Battle: React.FC = () => {

  const history = useHistory<{
    battle: BattleStartData;
    mirror: boolean;
    playerID: string;
  }>();

  const [myPlayerID] = useState(history.location.state ? history.location.state.playerID : '');
  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [viewLogs, setViewLogs] = useState(false);
  const [battle, setBattle] = useState(
    history.location.state && history.location.state.battle
    ? new BattleData(history.location.state.battle)
    : null
  );


  // Functions

  const onQuitBattle = async (): Promise<void> => {

    if (battle && battle.online) {

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


  const onOpponentQuit = (): void => {
    if (battle) {
      BattleManager.setBattleComplete(battle, player.id, true);
    }
  }


  const dispatchBattleEvent = async (event: BattleEvent): Promise<void> => {

    if (!battle || battle.turnOwnerID !== myPlayerID) {
      return;
    }

    if (battle.online) {

      setPopup({ title: 'Please wait...' });

      try {
        event.damageDealt = BattleUtils.getRandomDamageForEvent(battle, event);
        await SocketManager.emit('battle.event', { event });
      } catch (err) {
        console.log(err);
      }

      setPopup(null);

    } else {
      BattleManager.handleEvent(battle, event);
    }

  }


  const getPlayerAndOpponent = () => {

    const { p1, p2 } = battle!;

    return (
      myPlayerID === p1.id
      ? { player: p1, opponent: p2 }
      : { player: p2, opponent: p1 }
    );

  }


  const getDirection = (): 1 | -1 => {
    const { player, opponent } = getPlayerAndOpponent();
    return player.position < opponent.position ? 1 : -1;
  }



  useEffect(() => {
    if (battle && battle.turns === 0 && !battle.droneFired) {

      const { attacker } = BattleUtils.getAttackerAndDefender(battle);

      if (attacker.droneActive) {
        dispatchBattleEvent({ name: 'drone_fire' });
      }
  
    }
  }, [battle]);


  useEffect(() => {
    if (battle
     && battle.turns
     && battle.turnOwnerID !== myPlayerID
     && !battle.complete
     && !battle.online) {

      setTimeout(() => {
        const event = BattleAI.think(battle);
        BattleManager.handleEvent(battle, event);
      }, 1000);

    }
  }, [battle, myPlayerID]);


  useEffect(() => {

    BattleManager.setOnUpdate(battle => {
      setBattle(cloneDeep(battle));
    });

    const attachmentID = SocketManager.attach({

      'battle.opponent_quit' (resolve): void {
        resolve();
        onOpponentQuit();
      },

      'battle.event' (resolve, reject, data): void {

        if (battle) {
          try {
            BattleManager.handleEvent(battle, data.event);
            resolve();
          } catch (err) {
            reject(err);
          }
        } else {
          reject();
        }

      },

    });

    const onDisconnect = () => {
      if (battle && !battle.complete) {
        const { opponent } = getPlayerAndOpponent();
        BattleManager.setBattleComplete(battle, opponent.id, true);
      }
    };

    SocketManager.psocket.socket.on('disconnect', onDisconnect);

    return () => {
      BattleManager.setOnUpdate(null);
      SocketManager.detach(attachmentID);
      SocketManager.psocket.socket.off('disconnect', onDisconnect);
    };

  });



  // Render


  if (!battle) {
    return <Redirect to={pagePaths.workshop} />;
  }


  // Graphic
  const mechScale = 0.325;
  const { player, opponent } = getPlayerAndOpponent();


  return (
    <div id="screen-battle">

      <PlayerStatsPanel player={player}   battle={battle} />
      <PlayerStatsPanel player={opponent} battle={battle} side="right" />

      <div className="buttons-container">
        <button className="classic-button logs-btn" onClick={() => setViewLogs(true)}>
          Logs
        </button>
        <button className="classic-button" onClick={onQuitBattle}>
          Quit
        </button>
      </div>

      <div className="mechs-container" style={{ transform: history.location.state.mirror ? 'scaleX(-1)' : '' }}>
        <div
          className="mech-gfx-container"
          style={{
            transform: `scaleX(${getDirection()})`,
            left: 5 + player.position * 10 + '%',
            filter: battle.turnOwnerID === myPlayerID ? 'drop-shadow(0 0 0.2rem #00ff00)' : '',
          }}>
          <MechGfx setup={player.items} droneActive={player.droneActive} scale={mechScale} outline />
        </div>
        <div
          className="mech-gfx-container"
          style={{
            transform: `scaleX(${getDirection() * -1})`,
            left: 5 + opponent.position * 10 + '%',
            filter: battle.turnOwnerID !== myPlayerID ? 'drop-shadow(0 0 0.2rem #ff0000)' : '',
          }}>
          <MechGfx setup={opponent.items} droneActive={opponent.droneActive} scale={mechScale} outline />
        </div>
      </div>

      {viewLogs &&
        <div className="logs-tab" onClick={() => setViewLogs(false)}>
          <div className="logs-tab-contents">
            {battle.logs.map(({ playerID, message, type }, i) => {

              const color = playerID === myPlayerID ? '#77ff77' : '#ff7777';

              return (
                <div style={{ color }} key={i}>
                  {`[${type}] ${message}`}
                </div>
              );

            })}
          </div>
        </div>
      }

      <Footer
        battle={battle}
        resolveAction={dispatchBattleEvent}
        mirror={history.location.state.mirror}
        show={!battle.complete && (battle.turnOwnerID === myPlayerID)}
      />

      {battle.complete && !viewLogs &&
        <Popup
          title={battle.complete.winnerID === myPlayerID ? 'You Won' : 'You Lost'}
          info={battle.complete.winnerID === myPlayerID && battle.complete.quit ? 'Opponent has quit!' : undefined}
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
