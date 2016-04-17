import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Scroller, Orientation } from 'react-scrolling';

const sizeProps = {
	container: 400,
	content: 1000,
};
const style = {
	width: '100px',
};

ReactDOM.render(
	<Scroller id="scroller-p" orientation={ Orientation.Vertiacal } size={ sizeProps } >
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
	</Scroller>,
	document.getElementById('ReactScrolling')
);
