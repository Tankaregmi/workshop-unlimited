import React, { useState } from 'react';
import fetch from 'node-fetch';
import ProgressBar from '../../components/ProgressBar';
import ItemsManager, { ItemsPack } from '../../managers/ItemsManager';
// import LocalStorageM from '../../managers/LocalStorageManager';
import Popup, { PopupParams } from '../../components/Popup';
import pagePaths from '../pagePaths';
import { useHistory } from 'react-router-dom';
import './styles.css';


const discordTag = 'ctrl-raul#9419';
const forumProfile = 'https://community.supermechs.com/profile/20-raul/';


const Packs: React.FC = () => {

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [itemsPack, setItemsPack] = useState<ItemsPack | null>(null);
  const [progress, setProgress] = useState(0);

  const history = useHistory();

  const defaultItems = 'https://gist.githubusercontent.com/ctrl-raul/3b5669e4246bc2d7dc669d484db89062/raw';
  // const lastPackData = LocalStorageM.getLastItemsPack();


  function removePopup () {
    setPopup(null);
  }


  async function importFromURL (url: string) {

    if (popup) {
      return;
    }

    setPopup({ title: 'Awaiting Response...' });


    try {

      const response = await fetch(url);
      const itemsPack = await response.json();
      beginImporting(itemsPack);

    } catch (err) {

      setPopup({
        title: 'Could not load this pack!',
        info: `Error: ${err.message}\n\nIf you're having trouble contact me:\nDiscord: ${discordTag}\nForum: ${forumProfile}`,
        options: { Ok: removePopup },
        onOffClick: removePopup,
      });

    }
  }


  function importFromFile (e: React.ChangeEvent<HTMLInputElement>) {

    if (popup) {
      return;
    }

    if (e.target && e.target.files) {
      const file = e.target.files[0];
      if (['application/json', 'text/plain'].includes(file.type)) {
        importFromURL(URL.createObjectURL(file));
      }
      else {
        alert('Invalid file type. Valid file types are JSON or TXT.');
      }
    }
  }


  function beginImporting (itemsPack: ItemsPack): void {
    setItemsPack(itemsPack);
    removePopup();

    ItemsManager.importItemsPack(itemsPack, progress => {
      if (progress === 1) {
        history.replace(pagePaths.workshop);
      } else {
        setProgress(progress * 100);
      }
    });
  }


  function Buttons () {
    return (
      <>
        {/* {lastPackData &&
          <button
            className="classic-button"
            onClick={() => {
              ItemsManager.loadLastPack(lastPackData);
              history.replace(pagePaths.workshop);
            }}>
            Use last pack
          </button>
        } */}

        <button
          className="classic-button"
          onClick={() => importFromURL(defaultItems)}>
          Use the default items
          <span>(Recommended)</span>
        </button>

        <button
          className="classic-button"
          onClick={() => {
          if (popup) {
            return;
          }
          const url = prompt('URL to Items Pack JSON');
          if (url) {
            importFromURL(url);
          }
        }}>
          Import From URL
        </button>

        <button className="classic-button">
          Import From File
          <input type="file" onChange={ importFromFile }/>
        </button>

      </>
    );
  }


  return (
    <div id="packs-screen">

      {itemsPack ? (
        <Loading itemsPack={itemsPack} progress={progress} />
      ) : (
        <Buttons />
      )}

      {popup && <Popup {...popup} />}

    </div>
  );
};


interface LoadingParams {
  itemsPack: ItemsPack;
  progress: number;
}

const Loading: React.FC<LoadingParams> = ({ itemsPack, progress }) => {
  return (
    <>
      <div className="classic-box items-pack-info">
        <div className="name">
          {itemsPack.config.name}
          <span>({itemsPack.items.length} items)</span>
        </div>
        <div className="separator"></div>
        <div className="description">
          {itemsPack.config.description}
        </div>
      </div>
      
      <ProgressBar progress={ progress } />
    </>
  );
};


export default Packs;
