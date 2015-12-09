/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import Immutable from 'immutable';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	TOGGLE_EXPORTER_SECTION,
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from '../action-types';

import { States } from './constants';

const debug = debugModule( 'calypso:exporter' );

const initialUIState = Immutable.fromJS( {
	exportingState: States.READY,
	advancedSettings: {
		posts: {
			isEnabled: true
		},
		pages: {
			isEnabled: true
		},
		feedback: {
			isEnabled: true
		}
	}
} );

/**
 * Reducer for managing the exporter UI
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function ui( state = initialUIState, action ) {
	switch ( action.type ) {
		case TOGGLE_EXPORTER_SECTION:
			debug( 'toggle section', action.section );
			return state.updateIn( [ 'advancedSettings', action.section, 'isEnabled' ], ( x ) => ( !x ) );

		case REQUEST_START_EXPORT:
			debug( 'start export' );
			return state.set( 'exportingState', States.STARTING );

		case REPLY_START_EXPORT:
			debug( 'reply start export' );
			return state.set( 'exportingState', States.EXPORTING );

		case FAIL_EXPORT:
			debug( 'fail export', action.reason );
			return state.set( 'exportingState', States.READY );

		case COMPLETE_EXPORT:
			debug( 'complete export', action.downloadURL );
			return state.set( 'exportingState', States.READY );
	}

	return state;
}

export default combineReducers( {
	ui
} );
