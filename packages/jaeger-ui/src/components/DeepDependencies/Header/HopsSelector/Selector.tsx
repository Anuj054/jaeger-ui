// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { PureComponent } from 'react';
import { Popover } from 'antd';
import { ImSortAmountAsc } from 'react-icons/im';
import { IoChevronForward } from 'react-icons/io5';

import ChevronDown from '../ChevronDown';
import { trackHopChange } from '../../index.track';
import { ECheckedStatus, EDirection, THop } from '../../../../model/ddg/types';

import './Selector.css';

type TProps = {
  direction: EDirection;
  furthestDistance: number;
  furthestFullDistance: number;
  furthestFullness: ECheckedStatus;
  handleClick: (distance: number, direction: EDirection) => void;
  hops: THop[];
};

const CLASSNAME = 'HopsSelector--Selector';

export default class Selector extends PureComponent<TProps> {
  private handleClick(distance: number) {
    const { direction, furthestFullDistance, handleClick } = this.props;
    handleClick(distance, direction);
    trackHopChange(furthestFullDistance, distance, direction);
  }

  private makeBtn = (
    { distance, fullness, suffix = 'popover-content' }: THop & { suffix?: string },
    showChevron?: number
  ) => {
    const { direction } = this.props;
    const testIdSuffix = `${direction === EDirection.Downstream ? 'down' : 'up'}-${Math.abs(distance)}`;
    return (
      <React.Fragment key={`${distance} ${direction} ${suffix}`}>
        {Boolean(showChevron) && <IoChevronForward className={`${CLASSNAME}--ChevronRight is-${fullness}`} />}
        <button
          className={`${CLASSNAME}--btn is-${fullness} ${CLASSNAME}--${suffix}`}
          type="button"
          onClick={() => this.handleClick(distance)}
          data-testid={`hop-${testIdSuffix}${suffix === 'popover-content' ? '-popover' : ''}`}
        >
          {Math.abs(distance)}
        </button>
      </React.Fragment>
    );
  };

  render() {
    const { direction, furthestDistance, furthestFullness, handleClick, hops } = this.props;
    const streamText = direction === EDirection.Downstream ? 'Down' : 'Up';
    const streamLabel = `${streamText}stream hops`;
    const lowercaseLabel = streamLabel.toLowerCase();
    if (hops.length <= 1) {
      return <span className={CLASSNAME}>No {lowercaseLabel}</span>;
    }

    const decrementBtn = (
      <button
        key={`decrement ${direction}`}
        disabled={furthestDistance === 0}
        className={`${CLASSNAME}--decrement`}
        type="button"
        onClick={() => handleClick(furthestDistance - direction, direction)}
        data-testid={`decrement-${direction === EDirection.Downstream ? 'down' : 'up'}`}
      >
        -
      </button>
    );
    const incrementBtn = (
      <button
        key={`increment ${direction}`}
        disabled={furthestDistance === hops[hops.length - 1].distance}
        className={`${CLASSNAME}--increment`}
        type="button"
        onClick={() => handleClick(furthestDistance + direction, direction)}
        data-testid={`increment-${direction === EDirection.Downstream ? 'down' : 'up'}`}
      >
        +
      </button>
    );
    const delimiterBtn = this.makeBtn({
      ...hops[hops.length - 1],
      suffix: 'delimiter',
    });
    const furthestBtn = this.makeBtn({
      distance: furthestDistance,
      fullness: furthestFullness,
      suffix: 'furthest',
    });

    return (
      <Popover
        arrow={{ pointAtCenter: true }}
        content={
          <div data-testid={`popover-content-${direction === EDirection.Downstream ? 'down' : 'up'}`}>
            {[decrementBtn, ...hops.map(this.makeBtn), incrementBtn]}
          </div>
        }
        placement="bottom"
        title={`Visible ${lowercaseLabel}`}
      >
        <span
          className={CLASSNAME}
          data-testid={`hops-selector-${direction === EDirection.Downstream ? 'down' : 'up'}`}
        >
          <ImSortAmountAsc className={`${CLASSNAME}--AscIcon is-${streamText}`} />
          {streamLabel}
          {furthestBtn}
          <span className={`${CLASSNAME}--delimiter`}>/</span>
          {delimiterBtn}
          <ChevronDown className="ub-ml1" />
        </span>
      </Popover>
    );
  }
}
