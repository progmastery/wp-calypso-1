import { expect } from 'chai';

import { createStore } from 'redux';

import ThemeConstants from '../constants';
import { reducer } from '../reducers/current-theme';

describe( 'CurrentThemeStore', function() {
	const SITE = { ID: 77203074 }; // dummy id

	const actionReceiveCurrentTheme = {
		type: ThemeConstants.RECEIVE_CURRENT_THEME,
		themeId: 'twentyfifteen',
		themeName: 'Twenty Fifteen',
		site: SITE
	};

	let store;

	function getCurrentTheme( siteId ) {
		return store.getState().get( 'currentThemes' ).get( siteId );
	}

	beforeEach( function() {
		store = createStore( reducer );
	} );

	describe( 'get()', function() {
		beforeEach( function() {
			store.dispatch( actionReceiveCurrentTheme );
		} );

		it( 'returns the current theme for the supplied site id', function() {
			const currentTheme = getCurrentTheme( SITE.ID );

			expect( currentTheme.id ).to.equal( 'twentyfifteen' );
			expect( currentTheme.name ).to.equal( 'Twenty Fifteen' );
		} );
	} );
} );
