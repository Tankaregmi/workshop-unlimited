import React from 'react';
import TooltipManager, { TooltipData } from '../../managers/TooltipManager';
import StatBlocks from '../../components/StatBlocks';
import ItemInfo from '../ItemInfo';

import './styles.css';


class Tooltip extends React.Component
{
  state = {
    style: {} as React.CSSProperties,
    data: null as TooltipData
  };

  offset = 20;
  _isMounted = false;

  getPosition = (e: MouseEvent) => {
    if (this._isMounted) {

      const width = window.innerWidth;
      const height = window.innerHeight;

      const cx = width  / 2;
      const cy = height / 2;

      let left, top, right, bottom;

      const x = e.clientX;
      const y = e.clientY;

      x > cx ? right  = width  - x + this.offset : left = x + this.offset;
      y > cy ? bottom = height - y + this.offset : top  = y + this.offset;

      const style = { left, top, right, bottom };

      this.setState(state => ({ ...state, style }));
    }
  };

  RenderedData: React.FC = () => {

    if (this.state.data === null) {
      return null;
    }

    const { text, jsx, item, setup } = this.state.data;

    if (text) return <span>{ text }</span>;

    if (jsx) return jsx;

    if (item) return <ItemInfo item={item} />;

    if (setup) return (
      <div className="mech-stat-blocks">
        <StatBlocks source={setup} />
      </div>
    );
    
    return null;
  }

  componentDidMount () {
    this._isMounted = true;
    TooltipManager.onChange = (data: TooltipData) => {
      this.setState(state => ({ ...state, data }));
    };
    document.addEventListener('mousemove', this.getPosition);
  }

  componentWillUnmount () {
    this._isMounted = false;
    document.addEventListener('mousemove', this.getPosition);
  }

  render () {

    if (!this.state.data) {
      return null;
    }

    return (
      <div
        className="tooltip classic-box"
        style={ this.state.style }
        >
        <this.RenderedData />
      </div>
    );

  }
}


export default Tooltip;
