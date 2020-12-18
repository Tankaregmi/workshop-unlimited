import React, { useEffect, useState } from 'react';
import { BrowserView } from 'react-device-detect';
import WorkshopScreen from './pages/WorkshopScreen';
import SettingsScreen from './pages/SettingsScreen';
import PacksScreen from './pages/Packs';
import MechsScreen from './pages/Mechs';
import BattleScreen from './pages/BattleScreen';
import LobbyScreen from './pages/Lobby';
import StatsManager from './managers/StatsManager';
import SocketManager from './managers/SocketManager';
import Tooltip from './components/Tooltip';
import ScreenOrientationContext, { Orientations, initialOrientation } from './contexts/ScreenOrientationContext';
import PageContext from './contexts/PageContext';

import './assets/styles/mech-gfx-animations.css';
import './assets/styles/global.css';
import './assets/styles/button.css';


interface GetCurrentPageParams {
  page: string;
}

const GetCurrentPage: React.FC<GetCurrentPageParams> = ({ page }) => {
  switch (page) {
    case 'packs':    return <PacksScreen />;
    case 'workshop': return <WorkshopScreen />;
    case 'settings': return <SettingsScreen />;
    case 'mechs':    return <MechsScreen />;
    case 'battle':   return <BattleScreen />;
    case 'lobby':    return <LobbyScreen />;
  }
  return <div>Unknown page '{ page }'</div>;
}

const App = () => {

  const [page, setPage] = useState('packs');
  const [orientation, setOrientation] = useState<Orientations>(initialOrientation);

  useEffect(() => {

    console.log('App init');

    // TODO: Make the app actually care about the stats,
    // and perhaps make the stats customizable too.
    StatsManager.load();
    SocketManager.init(setPage);

    window.addEventListener('resize', () => {

      setOrientation(
        window.innerWidth < window.innerHeight
        ? 'portrait'
        : 'landscape'
      );

      // A bit better but doesn't work...
      // const newOrientation = (
      //   window.innerWidth < window.innerHeight
      //   ? 'portrait'
      //   : 'landscape'
      // );
      // if (orientation !== newOrientation) {
      //   setOrientation(newOrientation);
      // }

    });

  }, []);


  return (
    <PageContext.Provider value={{ page, setPage }}>
    <ScreenOrientationContext.Provider value={{ orientation, setOrientation }}>

      <div id="workshop-unlimited">
        <GetCurrentPage page={page} />
        <BrowserView>
          <Tooltip />
        </BrowserView>
      </div>

    </ScreenOrientationContext.Provider>
    </PageContext.Provider>
  )
};


export default App;
