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
    <div className="popup-container tab" onClick={onOffClick}>
      <div className="classic-box">

        <div className="title">{title}</div>

        {info && <span>{info}</span>}

        {options && (
          <div className="buttons">
            {Object.entries(options).map(([key, handler]) =>
              <button
                key={key}
                className="classic-button"
                onClick={handler}>
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
