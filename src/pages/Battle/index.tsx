import React, { useContext, useState } from 'react';
import BattleM from '../../managers/BattleManager';
import MechGfx from '../../components/MechGfx';
import PlayerStatsPanel from './PlayerStatsPanel';
import Footer from './Footer';
import DataManager from '../../managers/DataManager';
import SocketM from '../../managers/SocketManager';
import Popup, { PopupParams } from '../../components/Popup';
import PageContext from '../../contexts/PageContext';
import './styles.css';


const Battle: React.FC = () => {

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [battle, setBattle] = useState(DataManager.getBattle());
  const [viewLogs, setViewLogs] = useState(false);
  const { setPage } = useContext(PageContext);

  const { attacker, defender } = BattleM.getPlayers(battle);
  const dir = (attacker.position > defender.position ? 1 : -1);
  const mechScale = 0.325;

  const isMyTurn = !battle.over && battle.multiplayer ? (
    battle.players[battle.turnOwnerIndex].id === SocketM.procket.socket.id
  ) : (
    !battle.activeAI || battle.turnOwnerIndex === 0
  );

  const mechHighlightColor = isMyTurn ? '#00ff00' : '#ff0000';
  const [p1, p2] = battle.players.sort(a => a.id === SocketM.procket.socket.id ? 1 : -1);


  DataManager.updateBattle = () => {
    setBattle(Object.assign({}, DataManager.getBattle()));
  };


  async function onQuitBattle () {
    if (battle.multiplayer) {
      try {
        SocketM.battle_quit();
        quit();
      } catch (error) {
        setPopup({
          title: 'Error',
          info: error.message,
          onOffClick: quit,
          options: { Ok: quit }
        });
      }
    } else {
      quit();
    }
  }

  function quit () {
    const battle = DataManager.getBattle();
    battle.over = true;
    battle.victory = false;
    battle.quit = true;
    DataManager.updateBattle();
  }


  return (
    <div id="screen-battle">

      <div className="stat-panels">
        <PlayerStatsPanel player={p1} style={{ gridArea: 'p1-stats' }} />
        <PlayerStatsPanel player={p2} style={{ gridArea: 'p2-stats' }} side="right" />
      </div>

      <div className="buttons-container">
        <button className="classic-button logs-btn" onClick={() => setViewLogs(true)}>
          Logs
        </button>
        <button className="classic-button" onClick={onQuitBattle}>
          Quit
        </button>
      </div>

      <div className="mechs-container">
        <div
          className="mech-gfx-container"
          style={{
            transform: `scaleX(${dir * -1})`,
            left: 5 + attacker.position * 10 + '%',
          }}>
          <MechGfx
            setup={attacker.mech.setup}
            droneActive={attacker.droneActive}
            scale={mechScale}
            outline={true}
          />
        </div>
        <div
          className="mech-gfx-container"
          style={{
            transform: `scaleX(${dir})`,
            left: 5 + defender.position * 10 + '%',
            filter: `drop-shadow(0 0 0.2rem ${mechHighlightColor}) drop-shadow(0 0 0.2rem ${mechHighlightColor})`,
          }}>
          <MechGfx
            setup={defender.mech.setup}
            droneActive={defender.droneActive}
            scale={mechScale}
            outline={true}
          />
        </div>
      </div>

      {viewLogs &&
        <div className="logs-tab" onClick={() => setViewLogs(false)}>
          <div className="logs-tab-contents">
            {battle.logs.map(([log, color], i) => 
              <span key={i} style={{ color }}>{log}</span>
            )}
          </div>
        </div>
      }

      {isMyTurn && <Footer battle={battle} />}

      {battle.over && !viewLogs &&
        <Popup
          title={battle.victory ? 'You Won' : 'You Lost'}
          info={battle.quit && battle.victory ? 'Opponent has quit!' : undefined}
          options={{
            'View Logs': () => setViewLogs(true),
            'Workshop': () => setPage('workshop'),
          }}
        />
      }

      {popup && <Popup {...popup} />}

    </div>
  );
};


export default Battle;
