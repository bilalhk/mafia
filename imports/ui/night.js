import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';
import { Games } from '../api/games.js';

import './night.html';

Template.night.helpers({
	hasActionMenu() {
		return false;
	},
	canSeeMafiaChat() {
		return false;
	}
})