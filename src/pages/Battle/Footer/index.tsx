import React, { useState } from 'react';
import Battle from '../../../classes/Battle';
import TooltipM from '../../../managers/TooltipManager';
import { ReactComponent as ArrowCrossSvg } from '../../../assets/images/icons/arrow-cross.svg';
import { ReactComponent as AimSvg } from '../../../assets/images/icons/aim.svg';
import { ReactComponent as SpecialsSvg } from '../../../assets/images/icons/specials.svg';
import { ReactComponent as CooldownSvg } from '../../../assets/images/icons/cooldown.svg';
import { ReactComponent as ArrowBackSvg } from '../../../assets/images/icons/arrow-back.svg';
import BattleUtils from '../../../battle/BattleUtils';
import { BattleEvent } from '../../../managers/BattleManager';


interface FooterParams {
  battle: Battle;
  resolveAction: (event: BattleEvent) => any;
  mirror: boolean;
}


const Footer: React.FC<FooterParams> = ({ battle, resolveAction, mirror }) => {

  const { attacker } = BattleUtils.getAttackerAndDefender(battle);

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
        setPositionsMap(BattleUtils.getWalkablePositions(battle));
      }
    };

    return (
      <>
        <button
          ref={e => TooltipM.listen(e, { text: 'Movement' })}
          className={`classic-button ${canMove ? '' : 'disabled'}`}
          onClick={onClickMovements}>
          <ArrowCrossSvg />
        </button>

        <button
          ref={e => TooltipM.listen(e, { text: 'Weapons' })}
          className={`classic-button ${hasWeapons ? '' : 'disabled'}`}
          onClick={() => hasWeapons && setSection('weapons')}>
          <AimSvg />
        </button>

        <button
          ref={e => TooltipM.listen(e, { text: 'Specials' })}
          className={`classic-button ${hasSpecials ? '' : 'disabled'}`}
          onClick={() => hasSpecials && setSection('specials')}>
          <SpecialsSvg />
        </button>

        <ItemButton
          setRangeMap={setRangeMap}
          itemIndex={1}
          battle={battle}
          onClick={() => resolveAction({ name: 'stomp' })}
        />

        <button
          ref={e => TooltipM.listen(e, { text: `Cooldown (${attacker.stats.heaCol} cooling)` })}
          className="classic-button"
          onClick={() => resolveAction({ name: 'cooldown', doubleCooldown: false })}>
          <CooldownSvg />
        </button>
      </>
    );
  }

  function weapons () {
    return (
      <>
        <button onClick={() => setSection('main')} className="classic-button">
          <ArrowBackSvg />
        </button>

        {attacker.weapons.map(([_item, weaponIndex]) =>
          <ItemButton
            key={weaponIndex}
            setRangeMap={setRangeMap}
            itemIndex={weaponIndex}
            battle={battle}
            onClick={() => resolveAction({ name: 'use_weapon', weaponIndex })}
            />
        )}
      </>
    );
  }

  function specials () {

    if (teleporting) {
      return (
        <button onClick={() => setTeleporting(false)} className="classic-button">
          Cancel
        </button>
      )
    }

    type specialItemType = 'DRONE' | 'TELEPORTER' | 'CHARGE_ENGINE' | 'GRAPPLING_HOOK';

    const listeners = {
      DRONE: () => resolveAction({ name: 'drone_toggle' }),
      TELEPORTER: () => [setTeleporting(true), setRangeMap([])],
      CHARGE_ENGINE: () => resolveAction({ name: 'charge_engine' }),
      GRAPPLING_HOOK: () => resolveAction({ name: 'grappling_hook' }),
    };

    return (
      <>
        <button onClick={() => setSection('main')} className="classic-button">
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
      <button onClick={() => setPositionsMap([])} className="classic-button">
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

      <div className="ranges" style={{ transform: mirror ? 'scaleX(-1)' : '' }}>

      {teleporting &&
        BattleUtils.getTeleportablePositions(battle)
          .map((accessible, i) => accessible &&
            <div
              key={ i }
              onClick={ () => {
                resolveAction({ name: 'teleport', movingPosition: i });
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
            resolveAction({ name: 'walk', movingPosition: i });
            setPositionsMap([]);
          }}
          className="position-highlight"
          style={{left: 1 + i * 10 + '%' }}>
        </div>
      )}

      {rangeMap.map((accessible, i) => accessible &&
        <div
          key={ i }
          className="range-highlight"
          style={{ left: 1 + i * 10 + '%' }}>
        </div>
      )}

      </div>

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

  const { attacker } = BattleUtils.getAttackerAndDefender(battle);

  const item = attacker.items[itemIndex];

  if (item === null) {
    return null;
  }

  const canPlayerUse = BattleUtils.canPlayerUseItem(battle, itemIndex);
  const canUse = item.type === 'DRONE' || canPlayerUse.can;

  return (
    <button
      key={ String(item.id) + String(itemIndex) }
      onMouseEnter={ () => setRangeMap(BattleUtils.getItemRangePlot(battle, itemIndex)) }
      onMouseLeave={ () => setRangeMap([]) }
      className={`classic-button ${canUse ? '' : 'disabled'}`}
      onClick={ canUse ? onClick : () => console.log(canPlayerUse.reason) }>

      <img src={item.getImage().url} alt={item.name} />

      {
        item.stats.uses
        ? <span>{ attacker.uses[itemIndex] }</span>
        : null
      }

    </button>
  );
};


export default Footer;
