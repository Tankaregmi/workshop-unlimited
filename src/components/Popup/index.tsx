import React from 'react';
import './styles.css';


export interface PopupParams {
  title: string;
  info?: string;
  options?: {
    [key: string]: () => any;
  };
  onOffClick?: () => any;
}


const Popup: React.FC<PopupParams> = ({ title, info, options, onOffClick }) => {
  return (
    <div className="popup-container" onClick={onOffClick}>
      <div className="classic-box">
        
        <h3>{title}</h3>
        
        {info && (
          <span>{info}</span>
        )}
        
        {options && (
          <div className="buttons">
            {Object.entries(options).map(([key, handler]) =>
              <button key={key} onClick={handler}>
                {key}
              </button>
            )}
          </div>
        )}
      
      </div>
    </div>
  );
};


export default Popup;
