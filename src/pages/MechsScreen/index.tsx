import React, { useState } from 'react';
import { ReactComponent as PlusIcon } from '../../assets/images/icons/plus.svg';
import Header from '../../components/Header';
import MechSavesM, { Mech } from '../../managers/MechSavesManager';
import MechCard from './MechCard';
import './styles.css';


interface MechsPageParams {
  goTo: (screen: string) => any;
}


const MechsScreen: React.FC<MechsPageParams> = ({ goTo }) => {

  const [mechs, setMechs] = useState(MechSavesM.getMechsForCurrentPack());


  function onSelectMech (mech: Mech) {
    MechSavesM.setLastMech(mech);
    goTo('workshop');
  }

  function onDeleteMech (mech: Mech) {
    MechSavesM.deleteMech(mech.id);
    setMechs(MechSavesM.getMechsForCurrentPack());
  }

  function onCreateNewMech () {
    const lastMech = MechSavesM.getLastMech();
    if (lastMech.setup.every(item => item === null)) {
      goTo('workshop');
    }
    else {
      MechSavesM.setLastMech(MechSavesM.createMech(lastMech.setup));
      setMechs(MechSavesM.getMechsForCurrentPack());
    }
  }

  function onRenameMech (mech: Mech, name: string) {
    mech.name = name;
    MechSavesM.saveMech(mech);
    setMechs(MechSavesM.getMechsForCurrentPack());
  }


  return (
    <div id="page-mechs">

      <Header title="Your Mechs" onGoBack={() => goTo('workshop')} />

      <main>
        {
          Object.values(mechs).map(mech => 
            <MechCard
              key={ mech.id }
              mech={ mech }
              onSelect={ onSelectMech }
              onDelete={ onDeleteMech }
              onRename={ onRenameMech }
            />
          )
        }

        <button className="create-mech-card" onClick={ () => onCreateNewMech() }>
          <PlusIcon />
        </button>
      </main>

    </div>
  );
};


export default MechsScreen;
