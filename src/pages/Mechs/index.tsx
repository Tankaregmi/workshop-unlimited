import React, { useContext, useState } from 'react';
import Header from '../../components/Header';
import MechGfx from '../../components/MechGfx';
import Popup, { PopupParams } from '../../components/Popup';
import PageContext from '../../contexts/PageContext';
import ScreenOrientationContext from '../../contexts/ScreenOrientationContext';
import ItemsM from '../../managers/ItemsManager';
import MechSavesM, { Mech } from '../../managers/MechSavesManager';
import TooltipM from '../../managers/TooltipManager';
import './styles.css';


const Mechs: React.FC = () => {

  const [popup, setPopup] = useState<PopupParams | null>(null);
  const [mechs, setMechs] = useState(MechSavesM.getMechsForCurrentPack());
  const [activeMech, setActiveMech] = useState<Mech>(MechSavesM.getLastMech());
  const [selectedMechsIDs, setSelectedMechsIDs] = useState<Mech['id'][]>([]);
  const { orientation } = useContext(ScreenOrientationContext);
  const { setPage } = useContext(PageContext);


  function onSelectMech (mech: Mech) {
    MechSavesM.setLastMech(mech);
    setPage('workshop');
  }

  function onDeleteMech (mech: Mech) {
    MechSavesM.deleteMech(mech.id);
    setActiveMech(MechSavesM.getLastMech());
    setMechs(MechSavesM.getMechsForCurrentPack());
  }

  function onCreateNewMech () {
    const newMech = MechSavesM.createMech({ setup: activeMech.setup });
    MechSavesM.setLastMech(newMech);
    setActiveMech(newMech);
    setMechs(MechSavesM.getMechsForCurrentPack());
  }

  function onChangeName (mech: Mech, name: string) {
    if (name.length > 32) {
      return;
    }
    mech.name = name;
    MechSavesM.saveMech(mech);
    setMechs(MechSavesM.getMechsForCurrentPack());
  }

  function onToggleSelected (id: Mech['id']): void {
    const index = selectedMechsIDs.indexOf(id);
    if (index === -1) {
      setSelectedMechsIDs([...selectedMechsIDs, id]);
    } else {
      const newIDs = [...selectedMechsIDs];
      newIDs.splice(index, 1);
      setSelectedMechsIDs(newIDs);
    }
  }

  function onSetActive (mech: Mech): void {
    if (mech.id !== activeMech.id) {
      setActiveMech(mech);
    } else {
      onSelectMech(activeMech);
    }
  }

  function onClickExportMechs () {
    if (selectedMechsIDs.length) {
      MechSavesM.exportMechs(selectedMechsIDs);
      return;
    }
    const Ok = () => setPopup(null);
    setPopup({
      title: 'No mechs selected!',
      info: 'Click on the checkboxes to select which mechs you want to export.',
      onOffClick: Ok,
      options: {
        Ok,
        'Select All' () {
          setSelectedMechsIDs(Object.keys(mechs));
          Ok();
        }
      },
    });
  }

  function onClickImportMechs () {

    console.log('onClickImportMechs');

    interface HTMLInputEvent extends Event {
      target: HTMLInputElement & EventTarget;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = event => {
      const e = event as HTMLInputEvent;
      if (e.target && e.target.files) {

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.addEventListener('load', (event) => {
          if (typeof event.target?.result === 'string') {
            const base64 = event.target.result.split(',')[1];
            let data;
            try {
              const jsonString = atob(base64);
              data = JSON.parse(jsonString);
            } catch (error) {
              console.error('Failed to import mechs', error);
              return;
            }
            MechSavesM.importMechs(data);
            setMechs(MechSavesM.getMechsForCurrentPack());
          }
        });
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }


  return (
    <div id="mechs-manager-screen">

      <Header
        title="Mechs Manager"
        onGoBack={() => setPage('workshop')}
      />

      <div className="current-mech-view">

        {orientation === 'landscape' && (
          <>
            <MechCard
              mech={activeMech}
              scale={0.6}
              onSetActive={() => onSelectMech(activeMech)}
              onChangeName={name => onChangeName(activeMech, name)}
              onDelete={() => onDeleteMech(activeMech)}
            />

            <div className="buttons-container">
              <button
                className="classic-button"
                onClick={() => onDeleteMech(activeMech)}>
                Delete
              </button>
              <button
                className="classic-button"
                onClick={() => onSelectMech(activeMech)}>
                Select
              </button>
            </div>
          </>
        )}

        <div ref={e => TooltipM.listen(e, 'Items Pack Name')}>
          {ItemsM.getItemsPackConfig().name}
        </div>

        <div>Mechs: {Object.keys(mechs).length}</div>

      </div>

      <div className="buttons-container">
        <button
          className="classic-button"
          onClick={onCreateNewMech}>
          Create New Mech
        </button>
        <button
          className="classic-button"
          onClick={onClickImportMechs}>
          Import
        </button>
        <button
          className={`classic-button ${selectedMechsIDs.length ? 'active' : ''}`}
          onClick={onClickExportMechs}>
          Export
        </button>
      </div>

      <div className="mechs-container">
        {Object.values(mechs).map(mech =>
          <MechCard
            key={mech.id}
            mech={mech}
            scale={0.5}
            active={mech.id === activeMech.id}
            selected={selectedMechsIDs.includes(mech.id)}
            onToggleSelected={() => onToggleSelected(mech.id)}
            onSetActive={() => onSetActive(mech)}
            onChangeName={name => onChangeName(mech, name)}
            onDelete={() => onDeleteMech(mech)}
          />
        )}
      </div>

      {popup && <Popup {...popup} />}

    </div>
  );
};


interface MechCardParams {
  mech: Mech;
  scale: number;
  active?: boolean;
  selected?: boolean;
  onToggleSelected?: () => any;
  onSetActive: () => any;
  onChangeName: (newName: string) => any;
  onDelete: () => any;
}

const MechCard: React.FC<MechCardParams> = ({ mech, scale, active, selected, onToggleSelected, onSetActive, onChangeName, onDelete }) => {

  const { orientation } = useContext(ScreenOrientationContext);

  return (
    <button
      ref={e => TooltipM.listen(e, { setup: mech.setup })}
      className={`mech-card classic-button ${active ? 'active' : ''}`}>

      <input
        type="text"
        value={mech.name}
        placeholder="(no name)"
        spellCheck="false"
        max={32}
        onChange={e => onChangeName(e.target.value)}
      />

      <div className="mech-gfx-holder" onClick={onSetActive}>
        <MechGfx setup={mech.setup} scale={scale} />
      </div>

      {orientation === 'portrait' && (
        <div className="buttons-container">
          <button className="classic-button" onClick={onDelete}>Delete</button>
          <button className="classic-button" onClick={onSetActive}>Equip</button>
        </div>
      )}

      {onToggleSelected && (
        <input
          type="checkbox"
          checked={selected}
          onInput={onToggleSelected}
          onChange={() => {}}
        />
      )}

    </button>
  );
};


export default Mechs;
