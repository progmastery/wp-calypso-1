import { assert } from 'chai';
import * as sinon from 'sinon';

import {
	add, remove,
	getForTesting as get,
	resetForTesting as reset,
	EVERY_SECOND,
	EVERY_FIVE_SECONDS,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	EVERY_MINUTE
} from '../runner';

const getSentinel = value => () => value;

describe( 'Interval Runner', function() {
	before( function() {
		this.clock = sinon.useFakeTimers();
	} );

	after( function() {
		this.clock.restore();
	} );

	beforeEach( function() {
		reset();
	} );

	describe( 'Adding actions', function() {
		it( 'Should return the appropriate id', function() {
			const id = add( EVERY_SECOND, getSentinel( 42 ) );

			assert( 1 === id );

			assert( 42 === get().get( 'actions' ).find( a => a.get( 'id' ) === id ).get( 'onTick' ).call() );
		} );

		it( 'Should increment the next id after adding an action', function() {
			[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach( i => add( EVERY_SECOND, getSentinel( i ) ) );

			assert( 10 === get().get( 'nextId' ) );
		} );

		it( 'Should add an action to the proper slot', function() {
			add( EVERY_TEN_SECONDS, getSentinel( 42 ) );

			assert( 42 === get().get( 'actions' ).find( a => a.get( 'period' ) === EVERY_TEN_SECONDS ).get( 'onTick' ).call() );
		} );

		it( 'Should add two actions of the same interval to the same slot', function() {
			add( EVERY_TEN_SECONDS, getSentinel( 10 ) );
			add( EVERY_FIVE_SECONDS, getSentinel( 5 ) );
			add( EVERY_TEN_SECONDS, getSentinel( 1010 ) );

			const tenSecondActions = get().get( 'actions' ).filter( a => a.get( 'period' ) === EVERY_TEN_SECONDS );

			assert( 2 === tenSecondActions.size );
			assert( 10 === tenSecondActions.first().get( 'onTick' ).call() );
			assert( 1010 === tenSecondActions.last().get( 'onTick' ).call() );
		} );
	} );

	describe( 'Removing actions', function() {
		beforeEach( function() {
			[ EVERY_SECOND, EVERY_FIVE_SECONDS, EVERY_TEN_SECONDS, EVERY_THIRTY_SECONDS, EVERY_MINUTE ].forEach( p => add( p, getSentinel( p ) ) );
		} );

		it( 'Should remove an action by id', function() {
			remove( 1 );

			assert( get().get( 'actions' ).filter( a => a.get( 'period' ) === EVERY_SECOND ).isEmpty() );
		} );

		it( 'Should not decrement the next id after removing an action', function() {
			const prevNextId = get().get( 'nextId' );

			remove( 1 );

			assert( prevNextId === get().get( 'nextId' ) );
		} );
	} );

	describe( 'Running actions', function() {
		it( 'Should run all actions for a given period when called', function() {
			let value = 5;
			const modifyValue = () => {
				value = value * 2;
			};

			add( EVERY_SECOND, modifyValue );
			add( EVERY_SECOND, modifyValue );

			this.clock.tick( 1000 );

			assert( 20 === value );
		} );

		it( 'Should only execute actions for the given period', function() {
			let value = 5;
			const modifyValue = () => {
				value = value * 2;
			};

			add( EVERY_SECOND, modifyValue );
			add( EVERY_MINUTE, modifyValue );

			this.clock.tick( 1000 );

			assert( 10 === value );

			this.clock.tick( 1000 * 60 );

			// The every-second value should double sixty times,
			// then the every-minute value should double
			assert( 10 * Math.pow( 2, 60 ) * 2 === value );
		} );

		it( 'Should only execute actions that remain after removal', function() {
			let value = 5;
			const addToValue = v => () => {
				value = value + v;
			};

			const id = add( EVERY_SECOND, addToValue( 5 ) );
			this.clock.tick( 1000 );
			assert( 10 === value );

			this.clock.tick( 1000 );
			assert( 15 === value );

			remove( id );
			this.clock.tick( 1000 );
			assert( 15 === value );
		} );
	} );
} );
