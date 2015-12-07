/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CurrentThemeStore = require( 'lib/themes/stores/current-theme' ),
	fetchCurrentTheme = require( 'lib/themes/flux-actions' ).fetchCurrentTheme;

/**
 * Fetches the currently active theme of the supplied site
 * and passes it to the supplied child component.
 */
var CurrentThemeData = React.createClass( {

	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		children: React.PropTypes.element.isRequired
	},

	getInitialState: function() {
		return {
			currentTheme: CurrentThemeStore.getCurrentTheme( this.props.site.ID )
		};
	},

	componentDidMount: function() {
		CurrentThemeStore.on( 'change', this.onCurrentThemeChange );

		if ( ! this.state.currentTheme && this.props.site ) {
			fetchCurrentTheme( this.props.site );
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.state.currentTheme ) {
			return;
		}

		if ( nextProps.site && nextProps.site !== this.props.site ) {
			fetchCurrentTheme( nextProps.site );
		}
	},

	componentWillUnmount: function() {
		CurrentThemeStore.off( 'change', this.onCurrentThemeChange );
	},

	onCurrentThemeChange: function() {
		this.setState( {
			currentTheme: CurrentThemeStore.getCurrentTheme( this.props.site.ID )
		} );
	},

	render: function() {
		return React.cloneElement( this.props.children, this.state );
	}
} );

module.exports = CurrentThemeData;
