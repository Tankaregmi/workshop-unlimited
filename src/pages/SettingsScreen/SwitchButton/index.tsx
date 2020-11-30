import React from 'react';
import TTManager from '../../../managers/TooltipManager';


interface SwitchButtonParam {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  tip?: string;
}


const SwitchButton: React.FC<SwitchButtonParam> = ({ checked, onChange, tip, children }) => {
  return (
    <label ref={ tip ? e => TTManager.listen(e, { text: tip }) : null }>
      <div className="switch-button">
        <input type="checkbox" checked={ checked } onChange={ onChange } />
        <div></div>
      </div>
      { children }
    </label>
  );
};


export default SwitchButton;
