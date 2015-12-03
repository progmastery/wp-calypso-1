import React, { PropTypes } from 'react';

/**
 * Calls a given function on a given interval
 */
export default React.createClass( {
	displayName: 'Interval',

	propTypes: {
		onTick: PropTypes.func.isRequired,
		milliseconds: PropTypes.number,
		leading: PropTypes.bool,
		pauseWhenHidden: PropTypes.bool,
		children: PropTypes.element
	},

	getDefaultProps: () => ( {
		milliseconds: 30000,
		leading: true,
		pauseWhenHidden: true
	} ),

	getInitialState: () => ( {
		timer: null
	} ),

	componentDidMount() {
		this.start()
	},

	componentWillUnmount() {
		this.stop()
	},

	componentDidUpdate() {
		this.start();
	},

	run() {
		clearTimeout( this.state.timer );

		if ( document.hidden && this.props.pauseWhenHidden ) {
			return this.setState( { timer: null } );
		}

		this.setState( { timer: setTimeout( this.run, this.props.milliseconds ) } );

		this.props.onTick();
	},

	start() {
		return ! this.state.timer && this.setState( {
			timer: setTimeout( this.run, this.props.leading ? 0 : this.props.milliseconds )
		} );
	},

	stop() {
		this.setState( { timer: clearTimeout( this.state.timer ) } );
	},

	render() {
		return this.props.children;
	}
} );
