import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Scroller, Orientation, Pagination } from 'react-scrolling';

const sizeProps = {
	container: 400,
};
const style = {
	width: '200px',
};
const searchStyle = {
	width: '200px',
	padding: '5px',
	backgroundColor: '#eee',
	borderRadius: '5px',
	color: '#888',
};

const carouselPage = {
	size: 150,
	margin: 10,
};
const colors = ['red', 'green', 'blue', 'yellow'];
const carouselSize = {
	container: 200,
	content: colors.length * (carouselPage.size + carouselPage.margin) + carouselPage.margin,
};
const carouselItemPosition = (position, item, page, count) => {
	const realPos = item * (page.size + page.margin) + page.margin + position;
	if (item === 0 && realPos < -page.size) {
		return count * (page.size + page.margin) + page.margin + position;
	}
	if (item === count - 1 && realPos > (count - 1) * (page.size + page.margin) + page.margin) {
		return -page.size + position;
	}
	return realPos;
};

ReactDOM.render(
	<div>
		<Scroller id="scroller-p" orientation={ Orientation.Vertiacal } size={ sizeProps }
				  pagination={ Pagination.First } page={{ size: 35, margin: 0 }}
		>
			<div style={ searchStyle }>Search...</div>
			<p style={ style } >
				(Horizontal) Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Curabitur nec risus vel sapien mattis aliquam vel ullamcorper
				enim. Nulla fermentum euismod elit quis vulputate. Donec
				efficitur est justo, et sollicitudin dolor tincidunt non.
				Maecenas eget mattis nisi, nec vestibulum dui. Suspendisse
				potenti. Quisque malesuada tortor sit amet metus tempus, nec
				ullamcorper arcu dignissim. Phasellus dignissim leo vitae tellus
				molestie maximus. Integer eget orci nec ipsum faucibus rhoncus.
				Aliquam consectetur tempor pellentesque. Proin sit amet enim
				sem. Phasellus consequat consequat nisi sit amet vehicula. Duis
				placerat justo felis, vel tristique erat interdum eget. Maecenas
				scelerisque dolor mauris.
			</p>
			<p style={ style } >
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Curabitur nec risus vel sapien mattis aliquam vel ullamcorper
				enim. Nulla fermentum euismod elit quis vulputate. Donec
				efficitur est justo, et sollicitudin dolor tincidunt non.
				Maecenas eget mattis nisi, nec vestibulum dui. Suspendisse
				potenti. Quisque malesuada tortor sit amet metus tempus, nec
				ullamcorper arcu dignissim. Phasellus dignissim leo vitae tellus
				molestie maximus. Integer eget orci nec ipsum faucibus rhoncus.
				Aliquam consectetur tempor pellentesque. Proin sit amet enim
				sem. Phasellus consequat consequat nisi sit amet vehicula. Duis
				placerat justo felis, vel tristique erat interdum eget. Maecenas
				scelerisque dolor mauris.
			</p>
		</Scroller>
		<div style={{
			position: 'relative',
			width: carouselSize.container,
			height: carouselSize.container,
			overflow: 'hidden',
		}}
		>
			<Scroller id="carousel"
				orientation={ Orientation.Horizontal }
				size={ carouselSize }
				pagination={ Pagination.Single }
				page={ carouselPage }
				loop
			>
				{(position) => colors.map((color, i) => (
					<div key={color} style={{
						position: 'absolute',
						backgroundColor: color,
						width: carouselPage.size,
						height: carouselPage.size,
						transform: `translate3d(${
							carouselItemPosition(position, i, carouselPage, colors.length)
						}px, 50px, 0px)`,
					}}
					>
					</div>
				))}
			</Scroller>
		</div>
	</div>,
	document.getElementById('ReactScrolling')
);
