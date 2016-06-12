import React from 'react';
import autobind from 'autobind-decorator';
import ReactGesture from 'react-gesture';
import { eventCoordinates } from '../helpers/coordinatesFromEvent';
import { Motion } from 'react-motion';
import * as Config from '../config';
import * as Orientation from '../consts/Orientation';
import * as Pagination from '../consts/Pagination';
import * as Springs from '../consts/Springs';
import { scrollerOnPoint } from '../helpers/ScrollerOnPoint';
import {
  outOfTheBoxCorrection,
  paginationCorrection,
  velocityPositionCorrection,
  pagePositionForScroller,
  pageNumberForPosition,
} from '../helpers/PositionCorrectors';
import { getPropValueForScroller } from '../helpers/ArrayPropValue';
import {
  orientationDirection,
  orientationSize,
} from '../helpers/OrientationHelpers';
import { getSpringByPagination, getAdjustedSpring } from '../utils/effects';
import { getContainerWithOrientationStyle } from '../utils/style-api';
import { getVelocityProp, getDeltaProp, getTranslate3D } from '../utils/properties';
import {
  getEmptyVelocity,
  setOrientationPos,
  getCoordinatesByOrientation,
  correctLoopPosition,
} from '../utils/logic';
import {
  getInitialState,
  getSpringStyle,
  scrollerExists,
  moveScrollerNewPartialState,
  getScrollerPosition,
  getScrollerSpring,
  getAllScrollerPositions,
  foreachScroller,
} from '../helpers/StateHelpers';
import {
  setScrollerLock,
  getScrollerLock,
  emptyScrollerLock,
  isScrollerLocked,
} from '../helpers/ScrollerLocks';

const defaultProps = {
  scale: 1,
  orientation: Orientation.Vertiacal,
  pagination: Pagination.None,
  center: false,
  loop: false,
};

const windowWidth = window.innerWidth;

export class Scroller extends React.Component {

  constructor(props) {
    super(props);

    this.state = getInitialState(props);
  }

  componentWillMount() {
    this.correctOutOfTheBox(this.props, null);
    if (this.props.loop) {
      this.correctPagination(this.props, null);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (let i = 0; i < nextState.scrollers.length; ++i) {
      if (nextState.scrollers[i].position !== this.state.scrollers[i].position) {
        return true;
      }
    }
    if (nextProps.size !== this.props.size) {
      return true;
    }
    if (nextProps.size.container !== this.props.size.container) {
      return true;
    }
    if (nextProps.size.content !== this.props.size.content) {
      return true;
    }
    if (nextProps.page !== this.props.page) {
      return true;
    }
    if (nextProps.page !== undefined) {
      if (nextProps.page.size !== this.props.page.size) {
        return true;
      }
      if (nextProps.page.margin !== this.props.page.margin) {
        return true;
      }
    }
    if (nextProps.multiple !== this.props.multiple) {
      return true;
    }
    if (nextProps.multiple !== undefined) {
      if (nextProps.multiple.before !== this.props.multiple.before) {
        return true;
      }
      if (nextProps.multiple.between !== this.props.multiple.between) {
        return true;
      }
      if (nextProps.multiple.size !== this.props.multiple.size) {
        return true;
      }
    }
    return false;
  }

  componentDidUpdate() {
    this.updateContentSize();
    if (!this.getLock()) {
      this.correctPagination(this.props, null);
      if (!this.props.loop) {
        this.correctOutOfTheBox(this.props);
      }
    }
  }

  @autobind
  onEventBegin(e) {
    const { orientation } = this.props;
    if (!this.getLock() && !isScrollerLocked(orientation)) {
      const coordinates = eventCoordinates(e, this.props.scale, windowWidth);
      const coordinateValue = getCoordinatesByOrientation(coordinates, orientation);
      const scroller = scrollerOnPoint(coordinates, this.props);
      if (scroller) {
        this.setLocker(orientation, scroller, coordinateValue);
        this.lockPage();
        this.stopLockedScroller();
      }
    }
  }

  @autobind
  onEventEnd(e) {
    const { orientation } = this.props;
    if (!this.getLock() || !this.getLockedSwiped()) {
      this.setLockerEmpty(orientation);
      return;
    }
    const signedVelocity = this.getSignedVelocity(e);
    const scrollerId = this.getLockedScroller();
    let oldPosition = getScrollerPosition(this.state, scrollerId);
    let newPosition = oldPosition;
    const pagination = getPropValueForScroller(
      scrollerId,
      this.props.id,
      this.props.pagination
    );
    if (pagination === Pagination.Single) {
      newPosition = paginationCorrection(
        oldPosition,
        scrollerId,
        this.props,
        Math.sign(signedVelocity),
        this.getLockedPage()
      );
    } else {
      oldPosition = velocityPositionCorrection(
        oldPosition,
        scrollerId,
        signedVelocity
      );
      newPosition = oldPosition;
      if (pagination === Pagination.Multiple || pagination === Pagination.First) {
        newPosition = paginationCorrection(
          oldPosition,
          scrollerId,
          this.props,
          0,
          undefined, // prevSinglePage
          pagination === Pagination.First
        );
      }
    }
    newPosition = this.getFinalPosition(newPosition);
    const paginationSpring = getSpringByPagination(pagination);
    const adjustedSpring = getAdjustedSpring(oldPosition, newPosition, paginationSpring);
    if (getScrollerPosition(this.state, scrollerId) !== newPosition) {
      this.moveScroller(newPosition, scrollerId, adjustedSpring);
      this.autoScrolling = true;
    }
    this.setLockerEmpty(orientation);
  }

  @autobind
  onSwipe(e) {
    if (!this.isSwipeInRightDirection(e)) {
      return;
    }
    const { orientation } = this.props;
    if (this.getLock() && getScrollerLock(orientation) === this.getLockedScroller()) {
      const scrollerId = this.getLockedScroller();
      const coordinates = eventCoordinates(e, this.props.scale, windowWidth);
      const coordinateValue = getCoordinatesByOrientation(coordinates, orientation);
      const delta = coordinateValue - this.getLockedCoordinateValue();
      const oldPosition = getScrollerPosition(this.state, scrollerId);
      let newPosition = oldPosition + delta;
      if (this.isOutOfTheBox(newPosition)) {
        newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
      }
      this.setLockedCoordinateValue(coordinateValue);
      this.setLockedSwiped(true);
      this.moveScroller(newPosition, scrollerId);
    }
  }

  @autobind
  onSetContentDom(ref) {
    this.contentDom = ref;
  }

  getSignedVelocity(e) {
    const { orientation } = this.props;
    const velocityProp = getVelocityProp(orientation);
    const signedVelocity = e.gesture[velocityProp];
    if (Math.abs(signedVelocity) < Config.FLICK_THRESHOLD) {
      return 0;
    }
    const deltaProp = getDeltaProp(orientation);
    return signedVelocity * Math.sign(e.gesture[deltaProp]);
  }

  getTransformString(position) {
    const initTranslate = { x: 0, y: 0 };
    const { orientation } = this.props;
    const translate = setOrientationPos(initTranslate, orientation, position);
    return getTranslate3D(translate);
  }

  getFinalPosition(newPosition) {
    if (this.props.loop) {
      return newPosition;
    }
    return outOfTheBoxCorrection(
      newPosition,
      this.getLockedScroller(),
      this.props,
      this.contentAutoSize
    );
  }

  getLock() {
    return this.lock;
  }

  getLockedScroller() {
    return this.lock.scroller;
  }

  getLockedSwiped() {
    return this.lock.swiped;
  }

  getLockedPage() {
    return this.lock.page;
  }

  getLockedCoordinateValue() {
    return this.lock.coordinateValue;
  }

  setLock(lock) {
    this.lock = lock;
  }

  setLockedCoordinateValue(coordinateValue) {
    this.lock.coordinateValue = coordinateValue;
  }

  setLockedPageLocked() {
    const { scroller } = this.getLock();
    this.lock.page = this.currentPage(scroller);
  }

  setLockedSwiped(swiped) {
    this.lock.swiped = swiped;
  }

  setLockerEmpty(orientation) {
    this.lock = undefined;
    emptyScrollerLock(orientation);
  }

  setLocker(orientation, scroller, coordinateValue) {
    this.lock = {
      scroller,
      coordinateValue,
    };
    setScrollerLock(orientation, scroller);
  }

  getLastRenderedStyle(scrollerId) {
    return this.lastRenderedStyle[scrollerId];
  }

  getLastRenderedStyleForLocked() {
    return this.lastRenderedStyle[this.getLock().scroller];
  }

  setLastRenderedStyle(style) {
    this.lastRenderedStyle = style;
  }

  moveScroller(newPosition, id = this.props.id, springValue = Springs.Normal) {
    const state = this.state;
    if (scrollerExists(state, id)) {
      this.setState(moveScrollerNewPartialState(state, id, newPosition, springValue));
    }
  }

  moveScrollerWithinBox(delta, scrollerId) {
    const state = this.state;
    if (!scrollerExists(state, scrollerId)) {
      return false;
    }
    const oldPosition = getScrollerPosition(state, scrollerId);
    const newPosition = oldPosition + delta;
    const finalPosition = outOfTheBoxCorrection(
        newPosition,
        scrollerId,
        this.props,
        this.contentAutoSize
    );
    if (finalPosition !== oldPosition) {
      this.moveScroller(finalPosition, scrollerId);
      return true;
    }
    return false;
  }

  moveScrollerToPage(page, scrollerId, margin) {
    if (scrollerExists(this.state, scrollerId)) {
      const position = pagePositionForScroller(page, scrollerId, this.props, margin);
      this.moveScroller(position, scrollerId);
    }
  }

  currentPage(scrollerId) {
    const state = this.state;
    if (!scrollerExists(state, scrollerId)) {
      return undefined;
    }
    return pageNumberForPosition(
      getScrollerPosition(state, scrollerId),
      scrollerId,
      this.props
    );
  }

  isScrolling() {
    return (this.getLock() !== undefined && this.getLockedSwiped()) || this.autoScrolling;
  }

  releaseScroller() {
    this.onEventEnd({
      gesture: getEmptyVelocity(),
    });
  }

  scrollerPosition(scrollerId = this.props.id) {
    return getScrollerPosition(this.state, scrollerId);
  }

  allPositions() {
    return getAllScrollerPositions(this.state);
  }

  correctOutOfTheBox(props = this.props, springValue = Springs.Normal) {
    const state = this.state;
    let moved = false;
    foreachScroller(state, (scrollerId) => {
      const oldPosition = getScrollerPosition(state, scrollerId);
      const newPosition = outOfTheBoxCorrection(
        oldPosition,
        scrollerId,
        props,
        this.contentAutoSize);
      let newSpringValue = springValue;
      if (this.lastRenderedStyle &&
        newPosition !== this.getLastRenderedStyle(scrollerId) &&
        getScrollerSpring(state, scrollerId) === null) {
        newSpringValue = null;
      }
      if (newPosition !== oldPosition) {
        this.moveScroller(newPosition, scrollerId, newSpringValue);
        moved = true;
      }
    });
    return moved;
  }

  correctPagination(props = this.props, springValue = Springs.Normal) {
    const state = this.state;
    let moved = false;
    foreachScroller(state, (scrollerId) => {
      if (getPropValueForScroller(scrollerId, props.id, props.pagination) !== Pagination.None) {
        const oldPosition = getScrollerPosition(state, scrollerId);
        const ignorePagination = oldPosition === 0 && !props.loop;
        if (!ignorePagination) {
          const newPosition = paginationCorrection(
            oldPosition,
            scrollerId,
            props,
            0,
            undefined, // prevSinglePage
            props.pagination === Pagination.First
          );
          if (newPosition !== oldPosition) {
            this.moveScroller(newPosition, scrollerId, springValue);
            moved = true;
          }
        }
      }
    });
    return moved;
  }

  correctPosition() {
    this.correctPagination();
    this.correctOutOfTheBox();
  }

  lockPage() {
    const { scroller } = this.getLock();
    const { id, pagination } = this.props;
    if (getPropValueForScroller(scroller, id, pagination) === Pagination.Single) {
      this.setLockedPageLocked();
    }
  }

  stopLockedScroller() {
    const { scroller } = this.getLock();
    const diff = this.getLastRenderedStyleForLocked() - getScrollerPosition(this.state, scroller);
    const minDiff = Springs.Normal.precision / this.props.scale;
    if (Math.abs(diff) > minDiff) {
      this.moveScroller(this.getLastRenderedStyleForLocked(), scroller, null);
      this.setLockedSwiped(true);
    }
  }

  isSwipeInRightDirection(e) {
    const { orientation } = this.props;
    const direction = e.gesture.type.replace('swipe', '');
    return orientationDirection[orientation].indexOf(direction) >= 0;
  }

  isOutOfTheBox(position) {
    if (this.props.loop) {
      return false;
    }
    const outOfTheBoxCorrectionPos = outOfTheBoxCorrection(
      position,
      this.getLockedScroller(),
      this.props,
      this.contentAutoSize
    );
    return outOfTheBoxCorrectionPos !== position;
  }

  updateContentSize() {
    const { size, page, orientation, pagination } = this.props;
    if (size.content === undefined && this.contentDom !== undefined) {
      const sizeProp = orientationSize[orientation];
      const capitalSizeProp = sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1);
      this.contentAutoSize = this.contentDom[`client${capitalSizeProp}`];
    }
    let contentSize = this.contentAutoSize || size.content;
    if (pagination === Pagination.First) {
      const minSize = size.container + page.size + page.margin;
      if (contentSize < minSize) {
        contentSize = minSize;
      }
      this.contentAutoSize = contentSize;
    }
  }

  callOnScroll(scrollerPosition) {
    const { onScroll } = this.props;
    if (onScroll) {
      onScroll(scrollerPosition);
    }
  }

  @autobind
  motionRest() {
    this.autoScrolling = false;
  }

  renderChildren(style) {
    if (typeof this.props.id === 'string') {
      let pos = style[this.props.id];
      if (this.props.loop) {
        pos = correctLoopPosition(
          pos,
          this.props.size.content,
          this.contentAutoSize
        );
      }
      this.callOnScroll(pos);
      if (typeof this.props.children === 'function') {
        return this.props.children(pos);
      }
      const { orientation, size } = this.props;
      const containerStyle = getContainerWithOrientationStyle(orientation, size);
      const containerItemStyle = {
        transform: this.getTransformString(pos),
      };
      return (
        <div style={containerStyle} >
          <div style={containerItemStyle} ref={this.onSetContentDom} >
            {this.props.children}
          </div>
        </div>
      );
    }
    this.callOnScroll(style);
    return this.props.children(style);
  }

  renderWrappedIfArray(children) {
    if (children instanceof Array) {
      return <div>{children}</div>;
    }
    return children;
  }

  render() {
    const springStyle = getSpringStyle(this.state);
    return (
      <Motion style={springStyle} onRest={this.motionRest}>
        {style => {
          this.setLastRenderedStyle(style);
          const children = this.renderChildren(style);
          return (
            <ReactGesture
              onTouchStart={this.onEventBegin}
              onMouseDown={this.onEventBegin}
              onTouchEnd={this.onEventEnd}
              onMouseUp={this.onEventEnd}
              onSwipeLeft={this.onSwipe}
              onSwipeRight={this.onSwipe}
              onSwipeUp={this.onSwipe}
              onSwipeDown={this.onSwipe}
            >
              {this.renderWrappedIfArray(children)}
            </ReactGesture>
          );
        }}
      </Motion>
    );
  }
}

const valueOrArray = (ReactType) => (
  React.PropTypes.oneOfType([
    ReactType,
    React.PropTypes.arrayOf(ReactType),
  ])
);
const enumType = (Enum) => (
  React.PropTypes.oneOf(
    Object.keys(Enum).map(key => Enum[key])
  )
);

const propTypes = {
  id: valueOrArray(React.PropTypes.string).isRequired,
  orientation: enumType(Orientation),
  pagination: valueOrArray(enumType(Pagination)),
  center: valueOrArray(React.PropTypes.bool),
  loop: valueOrArray(React.PropTypes.bool),
  size: React.PropTypes.shape({
    container: valueOrArray(React.PropTypes.number).isRequired,
    content: valueOrArray(React.PropTypes.number),
  }).isRequired,
  page: React.PropTypes.shape({
    size: valueOrArray(React.PropTypes.number),
    margin: valueOrArray(React.PropTypes.number),
  }),
  multiple: React.PropTypes.shape({
    before: React.PropTypes.number,
    between: React.PropTypes.number,
    size: React.PropTypes.number,
  }),
  scale: React.PropTypes.number,
  children: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.node,
  ]),
  onScroll: React.PropTypes.func,
};

Scroller.propTypes = propTypes;
Scroller.defaultProps = defaultProps;

/*
const propsExample = {
  id: ['scr-a', 'scr-b'],
  orientation: Orientation.Horizontal, // single value only
  pagination: [Pagination.Multiple, Pagination.None],
  center: [true, false],
  size: {
    container: 1366,
    content: [900, 2000]
  },
  page: {
    size: 300,
    margin: 30
  },
  multiple: {
    before: 30,
    between: 200,
    size: 400
  }
};
*/
