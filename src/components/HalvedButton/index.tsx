import React from 'react';
import './styles.css';


interface HalvedButtonParams {
  first: [string, () => any];
  last: [string, () => any];
}

const HalvedButton: React.FC<HalvedButtonParams> = ({ first, last }) => {
  return (
    <button className="halved-button classic-button">
      <div>
        {/*Extra div just so the padding affects both halfs as a whole*/}
        <div onClick={first[1]}>{first[0]}</div>
        <div onClick={last[1]}>{last[0]}</div>
      </div>
    </button>
  );
};


export default HalvedButton;
