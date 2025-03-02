/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import analytics from 'analytics';
import verticals from './verticals';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import BackButton from 'components/header-cake';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'SurveyStep',

	propTypes: {
		isOneStep: React.PropTypes.bool,
		surveySiteType: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			surveySiteType: 'site',
			isOneStep: false
		}
	},

	getInitialState() {
		return {
			stepOne: null,
			verticalList: verticals.get()
		}
	},

	renderStepTwoVertical( vertical ) {
		const stepTwoClickHandler = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			this.handleNextStep( vertical );
		}
		return (
			<Card className="survey-step__vertical" key={ vertical.value } href="#" onClick={ stepTwoClickHandler }>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderStepOneVertical( vertical ) {
		const icon = vertical.icon || 'user';
		const stepOneClickHandler = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			if ( this.props.isOneStep ) {
				this.handleNextStep( vertical )
				return;
			}
			this.showStepTwo( vertical );
		}
		return (
			<Card className="survey-step__vertical" key={ 'step-one-' + vertical.value } href="#" onClick={ stepOneClickHandler }>
				<Gridicon icon={ icon } className="survey-step__vertical__icon"/>
				<label className="survey-step__label">{ vertical.label }</label>
			</Card>
		);
	},

	renderOptionList() {
		if ( this.state.stepOne ) {
			return (
				<div>
					<BackButton isCompact className="survey-step__title" onClick={ this.showStepOne }>{ this.state.stepOne.label }</BackButton>
					{ this.state.stepOne.stepTwo.map( this.renderStepTwoVertical ) }
				</div>
			);
		}
		const blogLabel = this.translate( 'What is your blog about?' );
		const siteLabel = this.translate( 'What is your website about?' );
		return (
			<div>
				<CompactCard className="survey-step__title">
					<label className="survey-step__label">{ this.props.surveySiteType === 'blog' ? blogLabel : siteLabel }</label>
				</CompactCard>
				{ this.state.verticalList.map( this.renderStepOneVertical ) }
			</div>
		);
	},

	render() {
		const blogHeaderText = this.translate( 'Create your blog today!' );
		const siteHeaderText = this.translate( 'Create your site today!' );
		return (
			<div className="survey-step__section-wrapper">
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.props.surveySiteType === 'blog' ? blogHeaderText : siteHeaderText }
					subHeaderText={ this.translate( 'WordPress.com is the best place for your WordPress blog or website.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderOptionList() } />
			</div>
		);
	},

	showStepOne() {
		const { value, label } = this.state.stepOne;
		analytics.tracks.recordEvent( 'calypso_survey_category_back_click', { category: JSON.stringify( { value, label } ) } );
		this.setState( { stepOne: null } );
	},

	showStepTwo( stepOne ) {
		const { value, label } = stepOne;
		analytics.tracks.recordEvent( 'calypso_survey_category_click_level_one', { category: JSON.stringify( { value, label } ) } );
		this.setState( { stepOne } );
	},

	handleNextStep( vertical ) {
		const { value, label } = vertical;
		analytics.tracks.recordEvent( 'calypso_survey_site_type', { type: this.props.surveySiteType } );
		analytics.tracks.recordEvent( 'calypso_survey_category_chosen', { category: JSON.stringify( { value, label } ) } );
		if ( this.state.stepOne ) {
			analytics.tracks.recordEvent( 'calypso_survey_category_click_level_two', { category: JSON.stringify( { value, label } ) } );
		} else {
			analytics.tracks.recordEvent( 'calypso_survey_category_click_level_one', { category: JSON.stringify( { value, label } ) } );
		}
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { surveySiteType: this.props.surveySiteType, surveyQuestion: vertical.value } );
		this.props.goToNextStep();
	}
} );
