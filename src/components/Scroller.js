import React from 'react';
import autobind from 'autobind-decorator';
import ReactGesture from 'react-gesture';
import { eventCoordinates } from '../helpers/coordinatesFromEvent';
import { Motion, spring } from 'react-motion';
import * as Config from '../config';
import * as Orientation from '../consts/Orientation';
import * as Pagination from '../consts/Pagination';
import * as Springs from '../consts/Springs';
import { scrollerOnPoint } from '../helpers/ScrollerOnPoint';
import {
  outOfTheBoxCorrection,
  paginationCorrection,
  velocityPositionCorrection,
  pageNumberForPosition,
} from '../helpers/PositionCorrectors';
import { getPropValueForScroller } from '../helpers/ArrayPropValue';
import {
  orientationProp,
  orientationDirection,
  orientationSize,
} from '../helpers/OrientationHelpers';

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
      this.state[props.id] = {
        position: this.getInitialPosition(props.id, props),
        spring: Springs.Normal,
      };
    } else {
      for (const id of props.id) {
        this.state[id] = {
          position: this.getInitialPosition(id, props),
          spring: Springs.Normal,
        };
      }
    }
    this.autosize = props.size.content === undefined;
    this.lock = null;
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
      this.correctPagination(props, Springs.Hard);
      this.correctOutOfTheBox(props);
    }
  }

  getInitialPosition(scrollerId, props = this.props) {
    const pagination = getPropValueForScroller(scrollerId, props.id, props.pagination);
    if (pagination === Pagination.First) {
      const pageSize = getPropValueForScroller(scrollerId, props.id, props.page.size);
      const pageMargin = getPropValueForScroller(scrollerId, props.id, props.page.margin);
      return -(pageSize + 2 * pageMargin);
    }
    return 0;
  }

  moveScroller(newPosition, id = this.props.id, springValue = Springs.Normal) {
    if (id in this.state) {
      const newPartialState = {};
      newPartialState[id] = {
        position: newPosition,
        spring: springValue,
      };
      this.setState(newPartialState);
    }
  }

  currentPage(scrollerId) {
    if (scrollerId in this.state) {
      return pageNumberForPosition(
        this.state[scrollerId].position,
        scrollerId,
        this.props
      );
    }
    return undefined;
  }

  correctOutOfTheBox(props = this.props, springValue = Springs.Normal) {
    for (const scrollerId in this.state) {
      if (this.state.hasOwnProperty(scrollerId)) {
        const oldPosition = this.state[scrollerId].position;
        const newPosition = outOfTheBoxCorrection(oldPosition, scrollerId, props);
        if (newPosition !== oldPosition) {
          this.moveScroller(newPosition, scrollerId, springValue);
        }
      }
    }
  }

  correctPagination(props = this.props, springValue = Springs.Normal) {
    for (const scrollerId in this.state) {
      if (this.state.hasOwnProperty(scrollerId)) {
        if (getPropValueForScroller(scrollerId, props.id, props.pagination) !== Pagination.None) {
          const oldPosition = this.state[scrollerId].position;
          const newPosition = paginationCorrection(oldPosition, scrollerId, props);
          if (newPosition !== oldPosition && (oldPosition !== 0 || props.loop)) {
            this.moveScroller(newPosition, scrollerId, springValue);
          }
        }
      }
    }
  }

  @autobind
  handleEventBegin(e) {
    if (!Scroller.Scrolling && !this.lock) {
      const coordinates = eventCoordinates(e, this.props.scale);
      const coordinateValue = coordinates[orientationProp[this.props.orientation]];

      const scroller = scrollerOnPoint(coordinates, this.props);
      if (scroller) {
        Scroller.Scrolling = true;
        this.lock = {
          scroller,
          coordinateValue,
        };
        if (getPropValueForScroller(scroller, this.props.id, this.props.pagination)
          === Pagination.Single) {
          this.lock.page = this.currentPage(scroller);
        }
        if (this.lastRenderedStyle[scroller] !== this.state[scroller].position) {
          this.moveScroller(this.lastRenderedStyle[scroller], scroller, null);
          this.lock.swiped = true;
        }
      }
    }
  }

  @autobind
  handleEventEnd(e) {
    if (this.lock && this.lock.swiped) {
      const velocityProp = `velocity${orientationProp[this.props.orientation].toUpperCase()}`;
      let signedVelocity = e.gesture[velocityProp];
      if (Math.abs(signedVelocity) < Config.FLICK_THRESHOLD) {
        signedVelocity = 0;
      } else {
        const deltaProp = `delta${orientationProp[this.props.orientation].toUpperCase()}`;
        signedVelocity *= Math.sign(e.gesture[deltaProp]);
      }

      let springValue = Springs.Move;
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
          springValue = Springs.Bounce;
        }
      }

      let finalPosition = newPosition;
      if (!this.props.loop) {
        finalPosition = outOfTheBoxCorrection(newPosition, this.lock.scroller, this.props);
      }
      if (newPosition !== finalPosition) {
        springValue = Springs.Bounce;
      }
      this.moveScroller(finalPosition, this.lock.scroller, springValue);
    }
    this.lock = undefined;
    Scroller.Scrolling = false;
  }

  @autobind
  handleSwipe(e) {
    const direction = e.gesture.type.replace('swipe', '');
    if (orientationDirection[this.props.orientation].indexOf(direction) >= 0) {
      if (this.lock) {
        const coordinates = eventCoordinates(e, this.props.scale);
        const coordinateValue = coordinates[orientationProp[this.props.orientation]];
        const delta = coordinateValue - this.lock.coordinateValue;

        const oldPosition = this.state[this.lock.scroller].position;
        let newPosition = oldPosition + delta;
        if (!this.props.loop &&
          outOfTheBoxCorrection(newPosition, this.lock.scroller, this.props) !== newPosition) {
          newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
        }

        this.lock.coordinateValue = coordinateValue;
        this.lock.swiped = true;
        this.moveScroller(newPosition, this.lock.scroller);
      }
    }
  }

  updateContentSize() {
    if (!this.autosize || this.contentDom === undefined) {
      return;
    }
    const sizeProp = orientationSize[this.props.orientation];
    const capitalSizeProp = sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1);
    this.props.size.content = this.contentDom[`client${capitalSizeProp}`];
  }

  @autobind
  initContentDom(ref) {
    this.contentDom = ref;
  }

  render() {
    const springStyle = {};
    const state = this.state;
    for (const scrollerId in state) {
      if (state.hasOwnProperty(scrollerId)) {
        if (state[scrollerId].spring !== null) {
          springStyle[scrollerId] = spring(
            state[scrollerId].position,
            state[scrollerId].spring
          );
        } else {
          springStyle[scrollerId] = state[scrollerId].position;
        }
      }
    }

    return (
      <Motion style={springStyle} >
        {style => {
          this.lastRenderedStyle = style;
          let children = null;
          if (typeof this.props.id === 'string') {
            if (typeof this.props.children === 'function') {
              let pos = style[this.props.id];
              if (this.props.loop) {
                pos %= this.props.size.content;
                if (pos > 0) {
                  pos -= this.props.size.content;
                }
              }
              children = this.props.children(pos);
            } else {
              const translate = { x: 0, y: 0 };
              translate[orientationProp[this.props.orientation]] = style[this.props.id];
              const containerStyle = {
                overflow: 'hidden',
                width: '100%',
                height: '100%',
              };
              containerStyle[orientationSize[this.props.orientation]] =
                `${this.props.size.container}px`;
              const containerItemStyle = {
                transform: `translate3d(${translate.x}px, ${translate.y}px, 0px)`,
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
    container: Scroller.valueOrArray(React.PropTypes.number),
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

Scroller.Scrolling = false;

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
