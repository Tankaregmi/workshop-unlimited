import React from 'react';
import TTManager from '../../managers/TooltipManager';
import './styles.css';


interface ProgressBarParams extends React.HTMLProps<HTMLDivElement> {
  progress: number;
  label?: string;
  color?: string;
  tip?: string;
}


const ProgressBar: React.FC<ProgressBarParams> = ({ progress, label, color, tip, ...rest }) => {

  const width = Math.max(0, Math.min(100, progress)) + '%';
  const backgroundColor = color;

  return (
    <div
      className="progress-bar"
      ref={ tip ? e => TTManager.listen(e, { text: tip }) : null }
      { ...rest }>
      <div style={{ width, backgroundColor }}></div>
      <span>{ label || Number(progress.toFixed()) + '%' }</span>
    </div>
  );
};


export default ProgressBar;
