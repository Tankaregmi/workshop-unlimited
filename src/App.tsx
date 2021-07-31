import React, { useEffect, useState } from 'react';
import { BrowserView } from 'react-device-detect';
import { HashRouter, Redirect, Route, RouteProps } from 'react-router-dom';

// Pages
import WorkshopScreen from './pages/Workshop';
import SettingsScreen from './pages/Settings';
import PacksScreen from './pages/Packs';
import MechsScreen from './pages/Mechs';
import BattleScreen from './pages/Battle';
import LobbyScreen from './pages/Lobby';

// Managers
import StatsManager from './managers/StatsManager';
import ItemsManager from './managers/ItemsManager';

// Global Components
import Tooltip from './components/Tooltip';

// Contexts
import ScreenOrientationContext, { Orientations, initialOrientation } from './contexts/ScreenOrientationContext';

// Util data
import pagePaths from './pages/pagePaths';
import loadingQuotes from './loading-quotes.json';

// Styles
import './assets/styles/mech-gfx-animations.css';
import './assets/styles/global.css';
import './assets/styles/button.css';



// Component

const App = () => {

  const [orientation, setOrientation] = useState<Orientations>(initialOrientation);
  const [statsLoaded, setStatsLoaded] = useState(false);


  useEffect(() => {

    StatsManager.loadStatImages()
      .then(() => setStatsLoaded(true))
      .catch();

    window.addEventListener('resize', () => {
      setOrientation(
        window.innerWidth < window.innerHeight
        ? 'portrait'
        : 'landscape'
      );
    });

  }, []);


  if (!statsLoaded) {
    return (
      <div>
        Loading...
        <br/>
        {loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]}
      </div>
    );
  }


  return (
    <ScreenOrientationContext.Provider value={{ orientation, setOrientation }}>

      <div id="workshop-unlimited">

        <HashRouter>
          <WURoute path={pagePaths.packs} component={PacksScreen} exact />
          <WURoute path={pagePaths.settings} component={SettingsScreen} exact />
          <WURoute path={pagePaths.workshop} component={WorkshopScreen} exact loadFirst />
          <WURoute path={pagePaths.mechs} component={MechsScreen} exact loadFirst />
          <WURoute path={pagePaths.lobby} component={LobbyScreen} exact loadFirst />
          <WURoute path={pagePaths.battle} component={BattleScreen} exact loadFirst />
        </HashRouter>

        <BrowserView>
          <Tooltip />
        </BrowserView>

      </div>

    </ScreenOrientationContext.Provider>
  );
};



// Util Component

const WURoute: React.FC<{ loadFirst?: boolean } & RouteProps> = props => {

  const { loadFirst, component: Comp, ...rest } = props;

  if (!loadFirst) {
    return <Route {...rest} component={Comp} />;
  }

  return (
    <Route {...rest} render={() => {
      return (
        ItemsManager.loaded()
        // @ts-ignore Works properly, idk what's going on.
        ? <Comp/>
        : <Redirect to={pagePaths.packs} />
      );
    }}/>
  );

};



// Exports

export default App;
