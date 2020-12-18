import React, { useContext, useState } from 'react';
import LSManager from '../../managers/LocalStorageManager';
import SwitchButton from './SwitchButton';
import Header from '../../components/Header';
import PageContext from '../../contexts/PageContext';
import './styles.css';


type InputFormat = [string, boolean, React.Dispatch<React.SetStateAction<boolean>>, string?];

interface SectionsType {
  title: string;
  inputs: InputFormat[];
}


const Settings: React.FC = () => {

  const defaultSettings = LSManager.getSettings();

  const [arenaBuffs, setArenaBuffs] = useState(defaultSettings.arena_buffs);
  const [buffsOnTooltip] = useState(defaultSettings.buffs_on_tooltip);
  const [clearSlotButton, setClearSlotButton] = useState(defaultSettings.clear_slot_button);
  const [controlOpponentMech, setControlOpponentMech] = useState(defaultSettings.control_opponent_mech);
  const { setPage } = useContext(PageContext);


  LSManager.setSettings({
    arena_buffs: arenaBuffs,
    buffs_on_tooltip: buffsOnTooltip,
    clear_slot_button: clearSlotButton,
    control_opponent_mech: controlOpponentMech
  });


  const sections: SectionsType[] = [{
    title: 'Workshop',
    inputs: [
      ['Arena Buffs', arenaBuffs, setArenaBuffs, 'Whether should use Arena Buffs (Always active in battle)'],
      ['Clear Slot Button', clearSlotButton, setClearSlotButton]
    ]
  }, {
    title: 'Battle',
    inputs: [
      ['Control Opponent Mech', controlOpponentMech, setControlOpponentMech]
    ]
  }];


  return (
    <div id="settings-screen">

      <Header title="Settings" onGoBack={() => setPage('workshop')} />

      <main>
        {sections.map(({ title, inputs }) =>
          <section key={ title }>

            <header>{ title }</header>

            {inputs.map((input: InputFormat) => 
              <SwitchButton
                key={ input[0] }
                checked={ input[1] }
                onChange={ () => input[2](!input[1]) }
                tip={ input[3] }
                >
                { input[0] as string }
              </SwitchButton>
            )}

          </section>
        )}
      </main>

    </div>
  );
};


export default Settings;
