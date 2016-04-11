import * as React from 'react';

export const ReactScrolling = (props) => (
	<div>
		{ props.children }
	</div>
);

ReactScrolling.defaultProps = {
	children: undefined,
};

ReactScrolling.propTypes = {
	children: React.PropTypes.any,
};
