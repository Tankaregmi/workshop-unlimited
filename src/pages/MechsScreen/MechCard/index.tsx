import React from 'react';
import MechGfx from '../../../components/MechGfx';
import { Mech } from '../../../managers/MechSavesManager';
import TTManager from '../../../managers/TooltipManager';


interface MechCardParams {
  mech: Mech;
  onSelect: (mech: Mech) => any;
  onDelete: (mech: Mech) => any;
  onRename: (mech: Mech, name: string) => any;
}


const MechCard: React.FC<MechCardParams> = ({ mech, onSelect, onDelete, onRename }) => {

  const { setup } = mech;

  return (
    <div className="mech-card">

      <div ref={ e => TTManager.listen(e, { setup }) }>
        <MechGfx setup={ mech.setup } scale={ 0.6 } />
      </div>

      <footer>
        <div className="info">
          
          <input
            type="text"
            value={ mech.name }
            spellCheck={ false }
            onChange={ e => onRename(mech, e.currentTarget.value) }
          ></input>
          
          { mech.pack_name }
          <span>{ mech.pack_key }</span>
        </div>

        <div className="buttons">
          <button onClick={ () => onSelect(mech) }>Select</button>
          <button onClick={ () => onDelete(mech) }>Delete</button>
        </div>

      </footer>
    </div>
  );
};


export default MechCard;
