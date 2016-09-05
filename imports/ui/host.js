import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';
import { Games } from '../api/games.js';

import './host.html';

Template.host.helpers({
	gameStarted() {
		return Games.find({ }).count() > 0;
	}
});

Template.lobby.helpers({
	players() {
		return Players.find({ });
	}
});

Template.hostview.helpers({
	state() {
		return Games.find({ }).fetch()[0].state;
	},
	gameOver() {
		return Games.find({ }).fetch()[0].state === 'game-over';
	}
});

Template.lobby.events({
	'click .start-game'(event) {
		event.preventDefault();
		Meteor.call('startGame');
	}
});

Template.hostview.events({
	'click .next-phase'(event) {
		event.preventDefault();
		Meteor.call('nextPhase');
	}
});