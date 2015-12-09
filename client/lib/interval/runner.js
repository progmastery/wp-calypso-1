import { fromJS } from 'immutable';

export const EVERY_SECOND = 1000;
export const EVERY_FIVE_SECONDS = 5 * 1000;
export const EVERY_TEN_SECONDS = 10 * 1000;
export const EVERY_THIRTY_SECONDS = 30 * 1000;
export const EVERY_MINUTE = 60 * 1000;

const initialState = fromJS( {
	nextId: 1,
	periodTimers: {
		EVERY_SECOND: null,
		EVERY_FIVE_SECONDS: null,
		EVERY_TEN_SECONDS: null,
		EVERY_THIRTY_SECONDS: null,
		EVERY_MINUTE: null
	},
	actions: []
} );
let state = initialState;

const increment = a => a + 1;
const push = item => list => list.push( item );
const pull = id => list => list.filterNot( o => o.get( 'id' ) === id );

export const resetForTesting = () => {
	state
		.get( 'periodTimers' )
		.forEach( clearTimeout );

	state = initialState;
};

export function add( period, onTick ) {
	const id = state.get( 'nextId' );

	storeNewAction( { id, period, onTick } );
	scheduleNextRun();

	return id;
}

function storeNewAction( { id, period, onTick } ) {
	state = state
		.update( 'actions', push( fromJS( { id, period, onTick } ) ) )
		.update( 'nextId', increment );

	return state.get( 'nextId' );
}

export function remove( id ) {
	removeStoredAction( id );
	scheduleNextRun();
}

function removeStoredAction( id ) {
	state = state.update( 'actions', pull( id ) );
}

function getPeriodActions( period ) {
	return state
		.get( 'actions' )
		.filter( a => a.get( 'period' ) === period );
}

function hasPeriodActions( period ) {
	return state
		.get( 'actions' )
		.some( a => a.get( 'period' ) === period );
}

function executePeriodActions( period ) {
	getPeriodActions( period )
		// since onTick() could explicitly return `false` and
		// that would terminate the iteration from forEach(),
		// we need to make sure we don't allow that to happen
		.forEach( a => a.get( 'onTick' ).call() || true );

	state = state.setIn( [ 'periodTimers', period ], null );

	scheduleNextRun();
}

function scheduleNextRun() {
	[ EVERY_SECOND, EVERY_FIVE_SECONDS, EVERY_TEN_SECONDS, EVERY_THIRTY_SECONDS, EVERY_MINUTE ]
		.forEach( p => {
			if ( ! hasPeriodActions( p ) ) {
				state = state.updateIn( [ 'periodTimers', p ], clearTimeout );
				return;
			}

			if ( ! state.get( 'periodTimers' ).get( p ) ) {
				// Note that the second `p` in the call here gets passed as an arg to `executePeriodActions`
				state = state.setIn( [ 'periodTimers', p ], setTimeout( executePeriodActions, p, p ) );
			}
		} );
}
