import { assert } from 'chai';

import { createStore } from 'redux';

import ThemeConstants from '../constants';
import { reducer } from '../reducers/themes';

describe( 'ThemesStore', function() {
	const actionReceiveThemes = {
		type: ThemeConstants.RECEIVE_THEMES,
		themes: [
			{ id: 'bold-news', active: true },
			{ id: 'picard' }
		]
	};
	const actionReceiveMoreThemes = {
		type: ThemeConstants.RECEIVE_THEMES,
		themes: [
			{ id: 'picard' },
			{ id: 'hue' }
		]
	};
	const actionThemeActivated = {
		type: ThemeConstants.ACTIVATED_THEME,
		theme: { id: 'picard' }
	};

	let store;

	function getThemeById( id ) {
		const theme = store.getState().getIn( [ 'themes', id ] );
		return theme ? theme.toJS() : undefined;
	}

	beforeEach( function() {
		store = createStore( reducer );
	} );

	describe( 'get()', function() {
		beforeEach( function() {
			store.dispatch( actionReceiveThemes );
		} );

		it( 'returns all themes', function() {
			const themes = store.getState().get( 'themes' );
			assert( themes.size === 2, 'Wrong number of themes' );
		} );
	} );

	context( 'when THEMES_RECEIVE is received', function() {
		beforeEach( function() {
			store.dispatch( actionReceiveThemes );
		} );

		it( 'removes duplicates', function() {
			store.dispatch( actionReceiveMoreThemes );
			const themes = store.getState().get( 'themes' );
			assert( themes.size === 3, 'duplicates found' );
		} );
	} );

	context( 'when ACTIVATED_THEME is received', function() {
		beforeEach( function() {
			store.dispatch( actionReceiveThemes );
		} );

		it( 'clears previous active flag', function() {
			assert.ok( getThemeById( 'bold-news' ).active, 'initial theme not active' );
			store.dispatch( actionThemeActivated );
			assert.notOk( getThemeById( 'bold-news' ).active, 'initial theme still active' );
			assert.ok( getThemeById( 'picard' ).active, 'new theme not active' );
		} );
	} );
} );
