import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';

import './wait.html';

Template.wait.helpers({
	players() {
		return Players.find({ });
	}
});

Template.wait.events({
	'click .leave-game'(event) {
		event.preventDefault();

		Players.remove(Players.findOne({ id: Session.get('id') })._id);
		Session.set('showLanding', true);
	}
});