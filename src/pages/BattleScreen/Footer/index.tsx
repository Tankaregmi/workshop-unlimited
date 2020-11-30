import React, { useState } from 'react';
import Battle from '../../../classes/Battle';
import BattleM from '../../../managers/BattleManager';
import TooltipM from '../../../managers/TooltipManager';
import { ReactComponent as ArrowCrossSvg } from '../../../assets/images/icons/arrow-cross.svg';
import { ReactComponent as AimSvg } from '../../../assets/images/icons/aim.svg';
import { ReactComponent as SpecialsSvg } from '../../../assets/images/icons/specials.svg';
import { ReactComponent as CooldownSvg } from '../../../assets/images/icons/cooldown.svg';
import { ReactComponent as ArrowBackSvg } from '../../../assets/images/icons/arrow-back.svg';


interface FooterParams {
  battle: Battle;
}


const Footer: React.FC<FooterParams> = ({ battle }) => {

  const { attacker } = BattleM.getPlayers(battle);

  const [section, setSection] = useState('main');
  const [positionsMap, setPositionsMap] = useState<boolean[]>([]);
  const [rangeMap, setRangeMap] = useState<boolean[]>([]);
  const [teleporting, setTeleporting] = useState<boolean>(false);

  const legs = attacker.items[1];


  function main () {

    const canMove = legs && (legs.stats.walk || legs.stats.jump);
    const hasWeapons = Boolean(attacker.weapons.length);
    const hasSpecials = Boolean(attacker.specials.length);

    const onClickMovements = () => {
      if (canMove) {
        setPositionsMap(BattleM.getAccessiblePositions(battle, 1));
      }
    };

    return (
      <>
        <button
          ref={e => TooltipM.listen(e, { text: 'Movement' })}
          className={canMove ? '' : 'disabled'}
          onClick={onClickMovements}>
          <ArrowCrossSvg />
        </button>
        
        <button
          ref={e => TooltipM.listen(e, { text: 'Weapons' })}
          className={hasWeapons ? '' : 'disabled'}
          onClick={() => hasWeapons && setSection('weapons')}>
          <AimSvg />
        </button>
        
        <button
          ref={e => TooltipM.listen(e, { text: 'Specials' })}
          className={hasSpecials ? '' : 'disabled'}
          onClick={() => hasSpecials && setSection('specials')}>
          <SpecialsSvg />
        </button>

        <ItemButton
          setRangeMap={setRangeMap}
          itemIndex={1}
          battle={battle}
          onClick={() => BattleM.resolveAction(battle, 'stomp')}
        />
        
        <button
          ref={e => TooltipM.listen(e, { text: `Cooldown (${attacker.stats.heaCol} cooling)` })}
          onClick={() => BattleM.resolveAction(battle, 'cooldown', { double: false })}>
          <CooldownSvg />
        </button>
      </>
    );
  }

  function weapons () {
    return (
      <>
        <button onClick={ () => setSection('main') }>
          <ArrowBackSvg />
        </button>

        {attacker.weapons.map(([_item, itemIndex]) =>
          <ItemButton
            key={ itemIndex }
            setRangeMap={ setRangeMap }
            itemIndex={ itemIndex }
            battle={ battle }
            onClick={ () => BattleM.resolveAction(battle, 'fire', { itemIndex }) }
            />
        )}
      </>
    );
  }

  function specials () {

    if (teleporting) {
      return (
        <button onClick={ () => setTeleporting(false) }>
          Cancel
        </button>
      )
    }

    type specialItemType = 'DRONE' | 'TELEPORTER' | 'CHARGE_ENGINE' | 'GRAPPLING_HOOK';

    const listeners = {
      DRONE: () => BattleM.resolveAction(battle, 'drone_toggle'),
      TELEPORTER: () => [setTeleporting(true), setRangeMap([])],
      CHARGE_ENGINE: () => BattleM.resolveAction(battle, 'charge'),
      GRAPPLING_HOOK: () => BattleM.resolveAction(battle, 'hook')
    };

    return (
      <>
        <button onClick={ () => setSection('main') }>
          <ArrowBackSvg />
        </button>

        {attacker.specials.map(([{ type }, itemIndex]) =>
          <ItemButton
            key={ itemIndex }
            setRangeMap={ setRangeMap }
            itemIndex={ itemIndex }
            battle={ battle }
            onClick={ listeners[type as specialItemType] }
            />
        )}
      </>
    );
  }

  function movements () {
    return (
      <button onClick={ () => setPositionsMap([]) }>
        <ArrowBackSvg />
      </button>
    );
  }


  return (
    <footer>

      {
        positionsMap.length    ? movements() :
        section === 'main'     ? main()      :
        section === 'weapons'  ? weapons()   :
        section === 'specials' ? specials()  :
        <h1>Error: Unknown section '{ section }'</h1>
      }

      {
        teleporting &&
        BattleM.getAccessiblePositions(battle, 10)
          .map((accessible, i) => accessible &&
            <div
              key={ i }
              onClick={ () => {
                BattleM.resolveAction(battle, 'teleport', { position: i });
                setTeleporting(false);
              }}
              className="position-highlight"
              style={{ left: 1 + i * 10 + '%' }}>
            </div>
          )
      }

      {positionsMap.map((accessible, i) => accessible &&
        <div
          key={ i }
          onClick={ () => {
            BattleM.resolveAction(battle, 'walk', { position: i });
            setPositionsMap([]);
          }}
          className="position-highlight"
          style={{ left: 1 + i * 10 + '%' }}>
        </div>
      )}

      {rangeMap.map((accessible, i) => accessible &&
        <div
          key={ i }
          className="range-highlight"
          style={{ left: 1 + i * 10 + '%' }}>
        </div>
      )}

    </footer>
  );
};


interface ItemButtonParams {
  setRangeMap: React.Dispatch<React.SetStateAction<boolean[]>>;
  itemIndex: number;
  battle: Battle;
  onClick: () => any;
};

const ItemButton: React.FC<ItemButtonParams> = ({ itemIndex, battle, setRangeMap, onClick }) => {

  const { attacker } = BattleM.getPlayers(battle);

  const item = attacker.items[itemIndex];

  if (item === null) {
    return null;
  }

  const canPlayerUse = BattleM.canPlayerUse(battle, itemIndex);
  const canUse = item.type === 'DRONE' || canPlayerUse.can;

  return (
    <button
      key={ String(item.id) + String(itemIndex) }
      onMouseEnter={ () => setRangeMap(BattleM.getRelativeWeaponRange(battle, itemIndex)) }
      onMouseLeave={ () => setRangeMap([]) }
      className={ canUse ? undefined : 'disabled' }
      onClick={ canUse ? onClick : () => BattleM.log(battle, 2, canPlayerUse.reason) }>

      <img src={ item.image.url } alt={ item.name } />

      {
        item.stats.uses
        ? <span>{ attacker.uses[itemIndex] }</span>
        : null
      }
      
    </button>
  );
};


export default Footer;
