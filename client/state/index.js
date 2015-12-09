/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import sharing from './sharing/reducers';
import sites from './sites/reducers';
import ui from './ui/reducers';
import notices from './notices/reducers';

/**
 * Module variables
 */
const reducer = combineReducers( {
	sharing,
	sites,
	ui,
    notices
} );

const store = applyMiddleware(
	thunkMiddleware
)( createStore )( reducer );

export default store;
