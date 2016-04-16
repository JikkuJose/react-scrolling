import * as React from 'react';
import autobind from 'autobind-decorator';
import ReactGestures from 'react-gesture';
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
	pagePositionForScroller,
	pageNumberForPosition,
} from '../helpers/PositionCorrectors';
import { getPropValueForScroller } from '../helpers/ArrayPropValue';
import { orientationProp, orientationDirection } from '../helpers/OrientationHelpers';

export class Scroller extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
		const defaultSingleState = {
			position: 0,
			spring: Springs.Normal,
		};
		if (typeof props.id === 'string') {
			this.state[props.id] = defaultSingleState;
		} else {
			for (const id of props.id) {
				this.state[id] = Object.assign({}, defaultSingleState);
			}
		}
		this.lock = null;
		this.correctOutOfTheBox(props);
	}

	componentWillReceiveProps(props) {
		if (!this.lock) {
			this.correctPagination(props, Springs.Hard);
			this.correctOutOfTheBox(props);
		}
	}

	// <publicMethods>

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

	moveScrollWithinBox(delta, scrollerId) {
		if (scrollerId in this.state) {
			const oldPosition = this.state[scrollerId].position;
			const newPosition = oldPosition + delta;
			const finalPosition = outOfTheBoxCorrection(newPosition, scrollerId, this.props);
			if (finalPosition !== oldPosition) {
				this.moveScroller(finalPosition, scrollerId);
			}
			return finalPosition !== oldPosition;
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
		if (scrollerId in this.state) {
			return pageNumberForPosition(
				this.state[scrollerId].position,
				scrollerId,
				this.props
			);
		}
		return undefined;
	}

	isScrolling() {
		return this.lock !== null;
	}

	releaseScroller() {
		this.handleEventEnd({
			gesture: {
				velocityX: 0,
				velocityY: 0,
			},
		});
	}

	scrollerPosition(scrollerId = this.props.id) {
		return this.state[scrollerId].position;
	}

	allPositions() {
		const res = {};
		for (const scrollerId in this.state) {
			if (this.state.hasOwnProperty(scrollerId)) {
				res[scrollerId] = this.state[scrollerId].position;
			}
		}
		return res;
	}

	correctOutOfTheBox(props = this.props) {
		for (const scrollerId in this.state) {
			if (this.state.hasOwnProperty(scrollerId)) {
				const oldPosition = this.state[scrollerId].position;
				const newPosition = outOfTheBoxCorrection(oldPosition, scrollerId, props);
				if (newPosition !== oldPosition) {
					this.moveScroller(newPosition, scrollerId);
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
					if (newPosition !== oldPosition && oldPosition !== 0) {
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

	// </publicMethods>

	@autobind
	handleEventBegin(e) {
		if (!this.lock) {
			const coordinates = eventCoordinates(e, this.props.scale);
			const coordinateValue = coordinates[orientationProp[this.props.orientation]];

			const scroller = scrollerOnPoint(coordinates, this.props);
			if (scroller) {
				this.lock = {
					scroller,
					coordinateValue,
				};
				if (getPropValueForScroller(scroller, this.props.id, this.props.pagination)
					=== Pagination.Single) {
					this.lock.page = this.currentPage(scroller);
				}
				if (this.lastRenderedStyle[scroller] !== this.state[scroller].position) {
					this.moveScroller(this.lastRenderedStyle[scroller], scroller, Springs.Hard);
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
			if (getPropValueForScroller(
					this.lock.scroller,
					this.props.id,
					this.props.pagination
				) === Pagination.Single) {
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
				if (getPropValueForScroller(
						this.lock.scroller,
						this.props.id,
						this.props.pagination
					) === Pagination.Multiple) {
					newPosition = paginationCorrection(
						newPosition,
						this.lock.scroller,
						this.props
					);
					springValue = Springs.Bounce;
				}
			}

			const finalPosition = outOfTheBoxCorrection(newPosition, this.lock.scroller, this.props);
			if (newPosition !== finalPosition) {
				springValue = Springs.Bounce;
			}
			this.moveScroller(finalPosition, this.lock.scroller, springValue);
		}
		this.lock = null;
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
				if (outOfTheBoxCorrection(newPosition, this.lock.scroller, this.props) !== newPosition) {
					newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
				}

				this.lock.coordinateValue = coordinateValue;
				this.lock.swiped = true;
				this.moveScroller(newPosition, this.lock.scroller);
			}
		}
	}

	render() {
		const springStyle = {};
		for (const scrollerId in this.state) {
			if (this.state.hasOwnProperty(scrollerId)) {
				springStyle[scrollerId] = spring(
					this.state[scrollerId].position,
					this.state[scrollerId].spring
				);
			}
		}
		return (
			<Motion style={springStyle} >
				{style => {
					this.lastRenderedStyle = style;
					let children = null;
					if (typeof this.props.id === 'string') {
						if (typeof this.props.children === 'function') {
							children = this.props.children(style[this.props.id]);
						} else {
							const translate = { x: 0, y: 0 };
							translate[orientationProp[this.props.orientation]] = style[this.props.id];
							children = (
								<div style={{
									overflow: 'hidden',
									width: '100%',
									height: '100%',
								}}
								>
									<div style={{
										transform: `translate3d(${translate.x}px, ${translate.y}px, 0px)`,
									}}
									>
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
						<ReactGestures
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
						</ReactGestures>
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

Scroller.propTypes = {
	id: Scroller.valueOrArray(React.PropTypes.string).isRequired,
	orientation: Scroller.enumType(Orientation),
	pagination: Scroller.valueOrArray(Scroller.enumType(Pagination)),
	center: Scroller.valueOrArray(React.PropTypes.bool),
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
Scroller.defaultProps = {
	scale: 1,
	orientation: Orientation.Vertiacal,
	pagination: Pagination.None,
	center: false,
};

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
