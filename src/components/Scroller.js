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
  orientationProp,
  orientationDirection,
  orientationSize,
} from '../helpers/OrientationHelpers';
import { getSpringByPagination, getAdjustedSpring } from '../utils/effects';
import { getContainerWithOrientationStyle } from '../utils/style-api';
import { getVelocityProp, getDeltaProp, getTranslate3D } from '../utils/properties';
import {
  getEmptyVelocity,
  setOrientationPos,
} from '../utils/logic';
import {
  getInitialState,
  getSpringStyle,
  scrollerExists,
  moveScrollerNewState,
  getScrollerPosition,
  getAllScrollerPositions,
  foreachScroller,
} from '../helpers/StateHelpers';

const defaultProps = {
  scale: 1,
  orientation: Orientation.Vertiacal,
  pagination: Pagination.None,
  center: false,
  loop: false,
};

export class Scroller extends React.Component {

  constructor(props) {
    super(props);

    this.state = getInitialState(props);
    this.autosize = props.size.content === undefined;
  }

  componentDidMount() {
    this.updateContentSize();
    this.correctOutOfTheBox(this.props, null);
    if (this.props.loop) {
      this.correctPagination(this.props, null);
    }
  }

  componentWillReceiveProps(props) {
    this.updateContentSize();
    if (!this.lock) {
      this.correctPagination(props, null);
      if (!this.props.loop) {
        this.correctOutOfTheBox(props);
      }
    }
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
      this.lock.scroller,
      this.props,
      this.contentAutoSize
    );
  }

  setLockerEmpty(orientation) {
    this.lock = undefined;
    Scroller.Locks[orientation] = undefined;
  }

  setLocker(orientation, scroller, coordinateValue) {
    this.lock = {
      scroller,
      coordinateValue,
    };
    Scroller.Locks[orientation] = scroller;
  }

  moveScroller(newPosition, id = this.props.id, springValue = Springs.Normal) {
    const state = this.state;
    if (scrollerExists(state, id)) {
      this.setState(moveScrollerNewState(state, id, newPosition, springValue));
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
    return this.lock !== undefined && this.lock.swiped;
  }

  releaseScroller() {
    this.handleEventEnd({
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
    foreachScroller(state, (scrollerId) => {
      const oldPosition = getScrollerPosition(state, scrollerId);
      const newPosition = outOfTheBoxCorrection(
        oldPosition,
        scrollerId,
        props,
        this.contentAutoSize);
      if (newPosition !== oldPosition) {
        this.moveScroller(newPosition, scrollerId, springValue);
      }
    });
  }

  correctPagination(props = this.props, springValue = Springs.Normal) {
    const state = this.state;
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
          }
        }
      }
    });
  }

  correctPosition() {
    this.correctPagination();
    this.correctOutOfTheBox();
  }

  lockPage() {
    const { scroller } = this.lock;
    const { id, pagination } = this.props;
    if (getPropValueForScroller(scroller, id, pagination) === Pagination.Single) {
      this.lock.page = this.currentPage(scroller);
    }
  }

  stopLockedScroller() {
    const { scroller } = this.lock;
    if (this.lastRenderedStyle[scroller] !== getScrollerPosition(this.state, scroller)) {
      this.moveScroller(this.lastRenderedStyle[scroller], scroller, null);
      this.lock.swiped = true;
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
      this.lock.scroller,
      this.props,
      this.contentAutoSize
    );
    return outOfTheBoxCorrectionPos !== position;
  }

  @autobind
  handleEventBegin(e) {
    const { orientation } = this.props;
    if (!this.lock && !Scroller.Locks[orientation]) {
      const coordinates = eventCoordinates(e, this.props.scale, Scroller.windowWidth);
      const coordinateValue = coordinates[orientationProp[orientation]];
      const scroller = scrollerOnPoint(coordinates, this.props);
      if (scroller) {
        this.setLocker(orientation, scroller, coordinateValue);
        this.lockPage();
        this.stopLockedScroller();
      }
    }
  }

  @autobind
  handleEventEnd(e) {
    const { orientation } = this.props;
    if (!this.lock || !this.lock.swiped) {
      this.setLockerEmpty(orientation);
      return;
    }
    const signedVelocity = this.getSignedVelocity(e);
    const scrollerId = this.lock.scroller;
    let newPosition = getScrollerPosition(this.state, scrollerId);
    const pagination = getPropValueForScroller(
      scrollerId,
      this.props.id,
      this.props.pagination
    );
    if (pagination === Pagination.Single) {
      newPosition = paginationCorrection(
        newPosition,
        scrollerId,
        this.props,
        Math.sign(signedVelocity),
        this.lock.page
      );
    } else {
      newPosition = velocityPositionCorrection(
        newPosition,
        scrollerId,
        signedVelocity
      );
      if (pagination === Pagination.Multiple || pagination === Pagination.First) {
        newPosition = paginationCorrection(
          newPosition,
          scrollerId,
          this.props,
          0,
          undefined, // prevSinglePage
          pagination === Pagination.First
        );
      }
    }
    const finalPosition = this.getFinalPosition(newPosition);
    const paginationSpring = getSpringByPagination(pagination);
    const adjustedSpring = getAdjustedSpring(paginationSpring);
    this.moveScroller(finalPosition, scrollerId, adjustedSpring);
    this.setLockerEmpty(orientation);
  }

  @autobind
  handleSwipe(e) {
    if (!this.isSwipeInRightDirection(e)) {
      return;
    }
    const { orientation } = this.props;
    if (this.lock && Scroller.Locks[orientation] === this.lock.scroller) {
      const scrollerId = this.lock.scroller;
      const coordinates = eventCoordinates(e, this.props.scale, Scroller.windowWidth);
      const coordinateValue = coordinates[orientationProp[orientation]];
      const delta = coordinateValue - this.lock.coordinateValue;
      const oldPosition = getScrollerPosition(this.state, scrollerId);
      let newPosition = oldPosition + delta;
      if (this.isOutOfTheBox(newPosition)) {
        newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
      }
      this.lock.coordinateValue = coordinateValue;
      this.lock.swiped = true;
      this.moveScroller(newPosition, scrollerId);
    }
  }

  updateContentSize() {
    if (!this.autosize || this.contentDom === undefined) {
      return;
    }
    const sizeProp = orientationSize[this.props.orientation];
    const capitalSizeProp = sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1);
    this.contentAutoSize = this.contentDom[`client${capitalSizeProp}`];
  }

  @autobind
  initContentDom(ref) {
    this.contentDom = ref;
  }

  render() {
    const springStyle = getSpringStyle(this.state);
    return (
      <Motion style={springStyle} >
        {style => {
          this.lastRenderedStyle = style;
          let children = null;
          if (typeof this.props.id === 'string') {
            if (typeof this.props.children === 'function') {
              let pos = style[this.props.id];
              if (this.props.loop) {
                pos = this.correctLoopPosition(
                  pos,
                  this.props.size.content,
                  this.contentAutoSize
                );
              }
              children = this.props.children(pos);
            } else {
              const { orientation, size } = this.props;
              const containerStyle = getContainerWithOrientationStyle(orientation, size);
              const containerItemStyle = {
                transform: this.getTransformString(style[this.props.id]),
              };
              children = (
                <div style={containerStyle} >
                  <div style={containerItemStyle} ref={this.initContentDom} >
                    {this.props.children}
                  </div>
                </div>
              );
            }
          } else {
            children = this.props.children(style);
          }
          if (children instanceof Array) {
            children = <div>{children}</div>;
          }
          return (
            <ReactGesture
              onTouchStart={this.handleEventBegin}
              onMouseDown={this.handleEventBegin}
              onTouchEnd={this.handleEventEnd}
              onMouseUp={this.handleEventEnd}
              onSwipeLeft={this.handleSwipe}
              onSwipeRight={this.handleSwipe}
              onSwipeUp={this.handleSwipe}
              onSwipeDown={this.handleSwipe}
            >
              {children}
            </ReactGesture>
          );
        }}
      </Motion>
    );
  }
}

Scroller.Locks = {};
Scroller.windowWidth = window.innerWidth;

Scroller.valueOrArray = (ReactType) =>
  React.PropTypes.oneOfType([
    ReactType,
    React.PropTypes.arrayOf(ReactType),
  ]);

Scroller.enumType = (Enum) =>
  React.PropTypes.oneOf(
    Object.keys(Enum).map(key => Enum[key])
  );

const propTypes = {
  id: Scroller.valueOrArray(React.PropTypes.string).isRequired,
  orientation: Scroller.enumType(Orientation),
  pagination: Scroller.valueOrArray(Scroller.enumType(Pagination)),
  center: Scroller.valueOrArray(React.PropTypes.bool),
  loop: Scroller.valueOrArray(React.PropTypes.bool),
  size: React.PropTypes.shape({
    container: Scroller.valueOrArray(React.PropTypes.number).isRequired,
    content: Scroller.valueOrArray(React.PropTypes.number),
  }).isRequired,
  page: React.PropTypes.shape({
    size: Scroller.valueOrArray(React.PropTypes.number),
    margin: Scroller.valueOrArray(React.PropTypes.number),
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
