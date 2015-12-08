import React, { PropTypes } from 'react';
import omit from 'lodash/object/omit';

import { add, remove } from './runner';

export const EVERY_SECOND = 1000;
export const EVERY_FIVE_SECONDS = 5 * 1000;
export const EVERY_TEN_SECONDS = 10 * 1000;
export const EVERY_THIRTY_SECONDS = 30 * 1000;
export const EVERY_MINUTE = 60 * 1000;

/**
 * Calls a given function on a given interval
 */
export default React.createClass( {
	displayName: 'Interval',

	propTypes: {
		onTick: PropTypes.func.isRequired,
		period: PropTypes.oneOf( [
			EVERY_SECOND,
			EVERY_FIVE_SECONDS,
			EVERY_TEN_SECONDS,
			EVERY_THIRTY_SECONDS,
			EVERY_MINUTE
		] ).isRequired,
		pauseWhenHidden: PropTypes.bool,
		children: PropTypes.element
	},

	getDefaultProps: () => ( {
		pauseWhenHidden: true,
		children: <span />
	} ),

	getInitialState: () => ( {
		id: null
	} ),

	componentDidMount() {
		this.start();

		document.addEventListener( 'visibilitychange', this.handleVisibilityChange, false );
	},

	componentWillUnmount() {
		document.removeEventListener( 'visibilitychange', this.handleVisibilityChange, false );

		this.stop();
	},

	componentDidUpdate( prevProps ) {
		if ( prevProps.period === this.props.period && prevProps.onTick === this.props.onTick ) {
			return;
		}

		this.start();
	},

	handleVisibilityChange() {
		const { id } = this.state;
		const { pauseWhenHidden } = this.props;

		if ( document.hidden && id && pauseWhenHidden ) {
			return this.stop();
		}

		if ( ! document.hidden && ! id && pauseWhenHidden ) {
			this.start();
		}
	},

	start() {
		const { period, onTick } = this.props;

		if ( this.state.id ) {
			remove( this.state.id );
		}
		this.setState( { id: add( period, onTick ) } );
	},

	stop() {
		remove( this.state.id );
		this.setState( { id: null } );
	},

	render() {
		return React.cloneElement( this.props.children, omit( this.props, [ 'onTick', 'period', 'pauseWhenHidden', 'children' ] ) );
	}
} );
