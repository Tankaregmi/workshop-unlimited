import React, { useEffect, useState } from 'react';
import { BrowserView } from 'react-device-detect';
import WorkshopScreen from './pages/WorkshopScreen';
import SettingsScreen from './pages/SettingsScreen';
import PacksScreen from './pages/PacksScreen';
import MechsScreen from './pages/MechsScreen';
import BattleScreen from './pages/BattleScreen';
import LobbyScreen from './pages/LobbyScreen';
import StatsManager from './managers/StatsManager';
import SocketManager from './managers/SocketManager';
import Tooltip from './components/Tooltip';

import './assets/styles/mech-gfx-animations.css';
import './assets/styles/global.css';




const App = () => {

  const [page, setPage] = useState('packs');

  const currentPage = (
    page === 'packs'    ? <PacksScreen    goTo={ setPage } /> :
    page === 'workshop' ? <WorkshopScreen goTo={ setPage } /> :
    page === 'settings' ? <SettingsScreen goTo={ setPage } /> :
    page === 'mechs'    ? <MechsScreen    goTo={ setPage } /> :
    page === 'battle'   ? <BattleScreen   goTo={ setPage } /> :
    page === 'lobby'    ? <LobbyScreen    goTo={ setPage } /> :
    <div>Unknown page '{ page }'</div>
  );


  useEffect(() => {
    // TODO: Make the app actually care about the stats,
    // and perhaps make the stats customizable too.
    StatsManager.load();
    SocketManager.init(setPage);
    console.log('App init');
  }, []);


  return (
    <div id="workshop-unlimited">
      { currentPage }
      <BrowserView>
        <Tooltip />
      </BrowserView>
    </div>
  )
};


export default App;
