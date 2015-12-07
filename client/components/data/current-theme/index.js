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

		this.refresh( this.props );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.site && nextProps.site !== this.props.site ) {
			this.refresh( nextProps );
		}
	},

	componentWillUnmount: function() {
		CurrentThemeStore.off( 'change', this.onCurrentThemeChange );
	},

	refresh: function( props ) {
		if ( ! this.state.currentTheme && props.site ) {
			fetchCurrentTheme( props.site );
		}
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
