/**
 * Internal dependencies
 */
import notices from 'notices';
import wpcom from 'lib/wp';
import debugModule from 'debug';
import i18n from 'lib/mixins/i18n';

import { prepareExportRequest } from './selectors';

const debug = debugModule( 'calypso:exporter' );
const wpcomUndocumented = wpcom.undocumented();

import {
	TOGGLE_EXPORTER_SECTION,
	SET_EXPORTER_ADVANCED_SETTING,

	REQUEST_EXPORTER_ADVANCED_SETTINGS,
	REPLY_EXPORTER_ADVANCED_SETTINGS,

	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from '../action-types';

/**
 * Toggles whether a section of the export is enabled.
 *
 * @param  {string} section   The name of the section to toggle - 'posts', 'pages', or 'feedback'
 * @return {Object}           Action object
 */
export function toggleSection( section ) {
	return {
		type: TOGGLE_EXPORTER_SECTION,
		section
	};
}

/**
 * Sets one of the advanced export settings values in the UI
 *
 * @param  {string} section   The name of the section containing the setting - 'posts', 'pages', or 'feedback'
 * @param  {string} setting   The name of the setting
 * @param  {any}    value     The new value for the setting
 * @return {Object}           Action object
 */
export function setAdvancedSetting( section, setting, value ) {
	return {
		type: SET_EXPORTER_ADVANCED_SETTING,
		section,
		setting,
		value
	};
}

/**
 * Request the available settings for customizing an export.
 *
 * @param  {int}      siteId  The ID of the site for which to retrieve export settings
 * @return {Function}         Action thunk
 */
export function requestExportSettings( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: REQUEST_EXPORTER_ADVANCED_SETTINGS,
			siteId: siteId
		} );

		wpcomUndocumented.getExportSettings( siteId, ( error, data ) => {
			dispatch( replyExportSettings( siteId, data ) );
		} );
	}
}

/**
 * Called when the available export settings are returned from the server.
 *
 * @param  {int}      siteId  The ID of the site for which the export settings belong
 * @param  {Object}   data    The data returned from the server
 * @return {Function}         Action thunk
 */
export function replyExportSettings( siteId, data ) {
	return {
		type: REPLY_EXPORTER_ADVANCED_SETTINGS,
		siteId: siteId,
		data: data
	};
}

/**
 * Sends a request to the server to start an export.
 *
 * @param {number}    siteId            The ID of the site to export
 * @param {number}    advancedSettings  Advanced settings for the site
 * @return {Function}                   Action thunk
 */
export function startExport( siteId ) {
	return ( dispatch, getState ) => {

		const advancedSettings = prepareExportRequest( getState() );

		dispatch( {
			type: REQUEST_START_EXPORT,
			siteId: siteId,
			advancedSettings: advancedSettings
		} );

		wpcomUndocumented.startExport( siteId, advancedSettings, ( error, startResponse ) => {
			if ( error ) {
				debug( error );
				dispatch( failExport( error.toString() ) );
				return;
			}
			debug( startResponse );

			dispatch( replyStartExport() );

			// Poll for completion of the export
			let poll = ( timeout ) => {
				setTimeout( () => {
					wpcomUndocumented.getExport( siteId, 0, ( error, pollResponse ) => {
						if ( error ) {
							dispatch( failExport( error.toString() ) );
						}

						if ( pollResponse.status === 'running' ) {
							poll( 500 );
						}

						if ( pollResponse.status === 'finished' ) {
							dispatch( completeExport( pollResponse.$attachment_url ) );
						}
					} );
				}, timeout );
			}
			poll( 0 );
		} );
	}
}

/**
 * Called when the server acknowledges a request to begin an export
 *
 * @return {Object}         Action object
 */
export function replyStartExport() {
	return {
		type: REPLY_START_EXPORT
	}
}

/**
 * Called when an export fails
 *
 * @param  {string} failureReason   User displayed reason for the failure
 * @return {Object}                 Action object
 */
export function failExport( failureReason ) {
	notices.error(
		failureReason,
		{
			button: i18n.translate( 'Get Help' ),
			href: 'https://en.support.wordpress.com/'
		}
	);

	return {
		type: FAIL_EXPORT
	}
}

/**
 * Called when an export completes
 *
 * @param  {string} downloadURL     A link to download the export file
 * @return {Object}                 Action object
 */
export function completeExport( downloadURL ) {
	notices.success(
		i18n.translate( 'Your export was successful! A download link has also been sent to your email' ),
		{
			button: i18n.translate( 'Download' ),
			href: downloadURL
		}
	);

	return {
		type: COMPLETE_EXPORT
	}
}
