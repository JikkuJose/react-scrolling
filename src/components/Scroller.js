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
  closestLoopPosition,
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
    this.randomId = Math.random();
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props, undefined, true);
  }

  componentDidMount() {
    if (this.updateContentSize()) {
      this.correctOutOfTheBox(this.props, null);
      if (this.props.loop) {
        this.correctPagination(this.props, null);
      }
    }

    const stringId = this.getStringId();
    const wrapper = document.getElementById(stringId);
    wrapper.addEventListener('click', this.disableClick, true);
  }

  componentWillReceiveProps(nextProps, nextContext, noAnimation = false) {
    this.updateContentSize(nextProps);
    let positionChanged = false;
    foreachScroller(this.state, (scrollerId) => {
      const oldPosition = this.getPropPositionObject(this.props, scrollerId);
      const newPosition = this.getPropPositionObject(nextProps, scrollerId);
      if (newPosition === undefined) {
        return;
      }
      if (newPosition.value !== undefined &&
        (oldPosition === undefined ||
        oldPosition.value !== newPosition.value)) {
        this.moveScroller(
          newPosition.value,
          scrollerId,
          noAnimation ? null : newPosition.spring
        );
        positionChanged = true;
        return;
      }
      if (newPosition.page !== undefined) {
        this.moveScrollerToPage(
          newPosition.page,
          scrollerId,
          undefined,
          noAnimation ? null : newPosition.spring
        );
        positionChanged = true;
        return;
      }
    });
    if (!positionChanged && !this.getLock()) {
      this.correctPagination(nextProps, null);
      if (!nextProps.loop) {
        this.correctOutOfTheBox(nextProps, null);
      }
    }
  }

  shouldComponentUpdate(/* nextProps, nextState */) {
    return true;
    /*
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
    */
  }

  componentDidUpdate() {
    if (this.updateContentSize()) {
      if (!this.getLock()) {
        this.correctPagination(this.props, null);
        if (!this.props.loop) {
          this.correctOutOfTheBox(this.props);
        }
      }
    }
  }

  componentWillUnmount() {
    const stringId = this.getStringId();
    const wrapper = document.getElementById(stringId);
    wrapper.removeEventListener('click', this.disableClick, true);
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
        this.resetScrolling();
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
      this.checkPageChanged(scrollerId, newPosition);
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
      this.startScrolling();
      this.callOnScrollStarted();
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

  getPropPositionObject(props, scroller) {
    const positionProp = getPropValueForScroller(
      scroller, props.id, props.position);
    if (typeof positionProp === 'number') {
      return {
        value: positionProp,
        spring: Springs.Normal,
      };
    }
    return positionProp;
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

  getStringId() {
    const { id } = this.props;
    const stringId = (typeof id === 'string') ? id : id.join('+');
    return `${stringId}-${this.randomId}`;
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

  moveScrollerToPage(page, scrollerId, margin, springValue) {
    if (scrollerExists(this.state, scrollerId)) {
      let position = pagePositionForScroller(page, scrollerId, this.props, margin);
      if (this.props.loop) {
        position = closestLoopPosition(
          getScrollerPosition(this.state, scrollerId),
          position,
          this.props.size.content,
          this.contentAutoSize
        );
      }
      this.moveScroller(position, scrollerId, springValue);
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

  wasScrolling() {
    return this.wasScrollingValue;
  }

  startScrolling() {
    this.wasScrollingValue = true;
  }

  resetScrolling() {
    this.wasScrollingValue = false;
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
    const paginationType = getPropValueForScroller(scroller, id, pagination);
    if (paginationType === Pagination.Single ||
      paginationType === Pagination.Multiple) {
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

  checkPageChanged(scrollerId, position) {
    const oldPage = this.getLockedPage();
    if (oldPage === undefined) {
      return;
    }
    const newPage = pageNumberForPosition(
      position,
      scrollerId,
      this.props
    );
    if (oldPage !== newPage) {
      this.callOnPageChanged(newPage);
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

  updateContentSize(props = this.props) {
    const prevSize = this.contentAutoSize;
    const { size, page, orientation, pagination } = props;
    if (size.content === undefined && this.contentDom !== undefined) {
      const sizeProp = orientationSize[orientation];
      const capitalSizeProp = sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1);
      this.contentAutoSize = this.contentDom[`client${capitalSizeProp}`];
    }
    let contentSize = size.content || this.contentAutoSize;
    if (pagination === Pagination.First) {
      const minSize = size.container + page.size + page.margin;
      if (contentSize < minSize) {
        contentSize = minSize;
      }
      this.contentAutoSize = contentSize;
    }
    return this.contentAutoSize !== prevSize;
  }

  callOnScroll(scrollerPosition) {
    const { onScroll } = this.props;
    if (onScroll) {
      onScroll(scrollerPosition);
    }
  }

  callOnPageChanged(page) {
    const { onPageChanged } = this.props;
    if (onPageChanged) {
      onPageChanged(page);
    }
  }

  callOnScrollStarted() {
    const { onScrollStarted } = this.props;
    if (onScrollStarted) {
      onScrollStarted();
    }
  }

  callOnScrollFinished() {
    const { onScrollFinished } = this.props;
    if (onScrollFinished) {
      onScrollFinished();
    }
  }

  @autobind
  disableClick(e) {
    if (this.wasScrolling()) {
      e.stopPropagation();
    }
  }

  @autobind
  motionRest() {
    this.autoScrolling = false;
    this.callOnScrollFinished();
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

  renderWrapped(children) {
    const stringId = this.getStringId();
    return <div id={stringId}>{children}</div>;
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
              {this.renderWrapped(children)}
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
  position: valueOrArray(React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.shape({
      value: React.PropTypes.number,
      page: React.PropTypes.number,
      spring: React.PropTypes.any,
    }),
  ])),
  children: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.node,
  ]),
  onScroll: React.PropTypes.func,
  onScrollStarted: React.PropTypes.func,
  onScrollFinished: React.PropTypes.func,
  onPageChanged: React.PropTypes.func,
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
