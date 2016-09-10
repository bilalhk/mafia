import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { Rooms } from '../api/rooms.js';
import { Games } from '../api/games.js';
import { Players } from '../api/players.js';

import './player.html';

Template.player.helpers({
	role() {
		return Players.find({ id: Session.get('id') }).fetch()[0].role.name;
	},
	showConversation() {
		return Games.find({ }).fetch()[0].state === 'day-conversation';
	},
	showAcusing() {
		return Games.find({ }).fetch()[0].state === 'day-acuse';
	},
	showVoting() {
		return Games.find({ }).fetch()[0].state === 'day-vote';
	},
	showNight() {
		return Games.find({ }).fetch()[0].state === 'night';
	},
	showNightMessages() {
		return Games.find({ }).fetch()[0].state === 'night-result';
	},
	gameOver() {
		return Games.find({ }).fetch()[0].state === 'game-over';
	},
	showWait() {
		return true;
	},
	amDead() {
		return Players.find({ id: Session.get('id') }).fetch()[0].dead;
	}
});