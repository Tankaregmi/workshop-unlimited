import React from 'react';
import { ReactComponent as CrossIcon } from '../../assets/images/icons/cross.svg';
import './styles.css';


interface HeaderParams {
  title: string;
  onGoBack: () => any;
  canGoBack?: boolean;
}


const Header: React.FC<HeaderParams> = ({ title, onGoBack, canGoBack = true }) => {
  return (
    <header className="basic-header">

      {title}

      {canGoBack && (
        <button onClick={onGoBack}>
          <CrossIcon />
        </button>
      )}

    </header>
  );
};


export default Header;
