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
import { getVelocityProp, getDeltaProp } from '../utils/properties';
import {
  getSpringStyleForScroller,
  getPositionAndSpring,
  getEmptyVelocity,
} from '../utils/logic';

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

    this.state = {};
    if (typeof props.id === 'string') {
      this.setInitialState(props.id, props);
    } else {
      for (const id of props.id) {
        this.setInitialState(id, props);
      }
    }
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

  getInitialPosition(scrollerId, props = this.props) {
    const pagination = getPropValueForScroller(scrollerId, props.id, props.pagination);
    if (pagination === Pagination.First) {
      const pageSize = getPropValueForScroller(scrollerId, props.id, props.page.size);
      const pageMargin = getPropValueForScroller(scrollerId, props.id, props.page.margin);
      return - (pageSize + 2 * pageMargin);
    }
    return 0;
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

  getSpringStyle() {
    const springStyle = {};
    const state = this.state;
    for (const scrollerId in state) {
      if (state.hasOwnProperty(scrollerId)) {
        springStyle[scrollerId] = getSpringStyleForScroller(state[scrollerId]);
      }
    }
    return springStyle;
  }

  getTransformString(position) {
    const translate = { x: 0, y: 0 };
    translate[orientationProp[this.props.orientation]] = position;
    return `translate3d(${translate.x}px, ${translate.y}px, 0px)`;
  }

  getFinalPosition(newPosition) {
    if (!this.props.loop) {
      return outOfTheBoxCorrection(
        newPosition,
        this.lock.scroller,
        this.props,
        this.contentAutoSize
      );
    }
    return newPosition;
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
    if (id in this.state) {
      this.setState({
        [id]: getPositionAndSpring(newPosition, springValue),
      });
    }
  }

  moveScrollerWithinBox(delta, scrollerId) {
    const state = this.state;
    if (scrollerId in state) {
      const oldPosition = state[scrollerId].position;
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
    }
    return false;
  }

  moveScrollerToPage(page, scrollerId, margin) {
    if (scrollerId in this.state) {
      const position = pagePositionForScroller(page, scrollerId, this.props, margin);
      this.moveScroller(position, scrollerId);
    }
  }

  currentPage(scrollerId) {
    const state = this.state;
    if (scrollerId in state) {
      return pageNumberForPosition(
        state[scrollerId].position,
        scrollerId,
        this.props
      );
    }
    return undefined;
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
    return this.state[scrollerId].position;
  }

  allPositions() {
    const scrolelrs = {};
    const state = this.state;
    for (const scrollerId in state) {
      if (state.hasOwnProperty(scrollerId)) {
        scrolelrs[scrollerId] = state[scrollerId].position;
      }
    }
    return scrolelrs;
  }

  correctOutOfTheBox(props = this.props, springValue = Springs.Normal) {
    const state = this.state;
    for (const scrollerId in state) {
      if (!state.hasOwnProperty(scrollerId)) {
        return;
      }
      const oldPosition = state[scrollerId].position;
      const newPosition = outOfTheBoxCorrection(
        oldPosition,
        scrollerId,
        props,
        this.contentAutoSize);
      if (newPosition !== oldPosition) {
        this.moveScroller(newPosition, scrollerId, springValue);
      }
    }
  }

  correctPagination(props = this.props, springValue = Springs.Normal) {
    const state = this.state;
    for (const scrollerId in state) {
      if (!state.hasOwnProperty(scrollerId)) {
        return;
      }
      if (getPropValueForScroller(scrollerId, props.id, props.pagination) !== Pagination.None) {
        const oldPosition = state[scrollerId].position;
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
    }
  }

  correctPosition() {
    this.correctPagination();
    this.correctOutOfTheBox();
  }

  setInitialState(scrollerId, props) {
    this.state[scrollerId] = {
      position: this.getInitialPosition(scrollerId, props),
      spring: Springs.Normal,
    };
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
    if (this.lastRenderedStyle[scroller] !== this.state[scroller].position) {
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
    let newPosition = this.state[this.lock.scroller].position;
    const pagination = getPropValueForScroller(
      this.lock.scroller,
      this.props.id,
      this.props.pagination
    );
    if (pagination === Pagination.Single) {
      newPosition = paginationCorrection(
        newPosition,
        this.lock.scroller,
        this.props,
        Math.sign(signedVelocity),
        this.lock.page
      );
    } else {
      newPosition = velocityPositionCorrection(
        newPosition,
        this.lock.scroller,
        signedVelocity
      );
      if (pagination === Pagination.Multiple || pagination === Pagination.First) {
        newPosition = paginationCorrection(
          newPosition,
          this.lock.scroller,
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
    this.moveScroller(finalPosition, this.lock.scroller, adjustedSpring);
    this.setLockerEmpty(orientation);
  }

  @autobind
  handleSwipe(e) {
    if (!this.isSwipeInRightDirection(e)) {
      return;
    }
    const { orientation } = this.props;
    if (this.lock && Scroller.Locks[orientation] === this.lock.scroller) {
      const coordinates = eventCoordinates(e, this.props.scale, Scroller.windowWidth);
      const coordinateValue = coordinates[orientationProp[orientation]];
      const delta = coordinateValue - this.lock.coordinateValue;
      const oldPosition = this.state[this.lock.scroller].position;
      let newPosition = oldPosition + delta;
      if (this.isOutOfTheBox(newPosition)) {
        newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
      }
      this.lock.coordinateValue = coordinateValue;
      this.lock.swiped = true;
      this.moveScroller(newPosition, this.lock.scroller);
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
    const springStyle = this.getSpringStyle();
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
