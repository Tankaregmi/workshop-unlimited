import React, { useContext } from 'react';
import PageContext from '../../contexts/PageContext';
import MechSavesM from '../../managers/MechSavesManager';


const URLChanged: React.FC = () => {

  const raulDiscordTag = 'ctrl-raul#9419';
  const { setPage } = useContext(PageContext);

  function exportMechs () {
    MechSavesM.exportAllMechs();
  }

  return (
    <div id="url-changed" style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    }}>

      <div style={{
        maxWidth: '50rem',
        padding: '1rem',
        backgroundColor: '#0c0e18',
        border: 'var(--ui-radius) solid #000000',
      }}>

        <div>
          Oops :(  This link is not supported anymore! WU officially migrated to
          {' '}
          <a
            href="https://workshop-unlimited.vercel.app/"
            style={{ color: '#7289da' }}>
            workshop-unlimited.vercel.app
          </a>
          {' '}
          for technical reasons.
        </div>

        <br/>

        <div>But don't worry - your mechs are safe!
          <button
            onClick={exportMechs}
            className="classic-button"
            style={{
              display: 'inline',
              margin: '0 0.8rem',
              padding: '0 0.4rem',
            }}>
              click here
          </button>
          to download them. You can import them in the new link from the "Mechs Manager" tab.
        </div>

        <br/>

        <div>
          Soon this link will redirect to the new link. You can contact me on discord ({raulDiscordTag}) or in the official
          {' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://community.supermechs.com/profile/20-raul/"
            style={{ color: '#7289da' }}>
            forum
          </a>
          {' '}
          if you have further questions.
        </div>

      </div>

      <button
        onClick={() => setPage('packs')}
        className="classic-button"
        style={{
          width: '20rem',
          height: '4rem',
          marginTop: '2rem',
        }}>
        Whatever
      </button>

    </div>
  );
};


export default URLChanged;
