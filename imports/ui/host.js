import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';
import { Games } from '../api/games.js';
import { Voices } from '../api/voices.js';

import './host.html';

let messages = [];
let playFn = () => {
	if (responsiveVoice.isPlaying()) {
		setTimeout(playFn, 0);
	} else {
		responsiveVoice.speak(messages.shift());
		if (messages.length > 0) {
			setTimeout(playFn, 0);
		}
	}
};

let nextPhaseFn = () => {
	Meteor.call('nextPhase');
	setTimeout(nextPhaseFn, 30000);
}

Template.host.onCreated(() => {
	Voices.find({ }).observe({
		added: (voice) => {
			messages.push(voice.content);
			if (messages.length === 1) {
				setTimeout(playFn, 0);
			}
		}
	})
});

Template.hostview.onCreated(() => {
	responsiveVoice.speak('the game has started.  it is day time.');
	setTimeout(nextPhaseFn, 30000);
});

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