import React, { useEffect, useState } from 'react';
import { BrowserView } from 'react-device-detect';
import WorkshopScreen from './pages/Workshop';
import SettingsScreen from './pages/Settings';
import PacksScreen from './pages/Packs';
import MechsScreen from './pages/Mechs';
import BattleScreen from './pages/Battle';
import LobbyScreen from './pages/Lobby';
import URLChangedScreen from './pages/URLChanged';
import StatsM from './managers/StatsManager';
import SocketM from './managers/SocketManager';
import Tooltip from './components/Tooltip';
import ScreenOrientationContext, { Orientations, initialOrientation } from './contexts/ScreenOrientationContext';
import PageContext from './contexts/PageContext';

import './assets/styles/mech-gfx-animations.css';
import './assets/styles/global.css';
import './assets/styles/button.css';



const quotes = [
  'loading stat images',
  'removing mech dust',
  'removing dust mech',
  'installing more floor pads in arena',
  'making another Nightmare mech',
  'balancing energy mechs',
  'buffing frantic brute',
  'cooling down',
  'regenerating energy',
  'Kraken is op',
  'doing daily 5 battles',
  'fixing bugs, and making more',
  'thinking about more loading screen texts',
  'you will probably never be able to read this if you have fast internet lol',
  'alex balut connoisseur',
  'nerfing drop rates',
  'finishing a battle vs bobson',
  'procastinating',
  'now for something completely different',
  'workshop limited',
  'worshop unlimited',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
];


interface GetCurrentPageParams {
  page: string;
}

const GetCurrentPage: React.FC<GetCurrentPageParams> = ({ page }) => {
  switch (page) {
    case 'url-changed': return <URLChangedScreen />;
    case 'packs':       return <PacksScreen />;
    case 'workshop':    return <WorkshopScreen />;
    case 'settings':    return <SettingsScreen />;
    case 'mechs':       return <MechsScreen />;
    case 'battle':      return <BattleScreen />;
    case 'lobby':       return <LobbyScreen />;
  }
  return <div>Unknown page '{ page }'</div>;
}

const App = () => {

  const usingFirebaseURL = window.location.hostname === 'workshop-unlimited.web.app';

  const [page, setPage] = useState(usingFirebaseURL ? 'url-changed' : 'packs');
  const [orientation, setOrientation] = useState<Orientations>(initialOrientation);
  const [statsLoaded, setStatsLoaded] = useState(false);


  useEffect(() => {

    StatsM.load(() => setStatsLoaded(true));
    SocketM.init(setPage);

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


  if (!statsLoaded) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return <div>{randomQuote}</div>;
  }


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
