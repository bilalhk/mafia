import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Rooms } from '../api/rooms.js';
import { Players } from '../api/players.js';

import './landing.html';

Template.landing.helpers({
	createAttr() {
		return !!Rooms.find({ }).count();
	},
	joinAttr() {
		return !Rooms.find({ }).count();
	},
	id() {
		return Session.get('id');
	}
});

Template.landing.events({
	'click .create-room'(event) {
		event.preventDefault();

		Rooms.insert({ owner: Session.get('id') });
		Session.set('showLanding', false);
	},
	'click .join-room'(event) {
		event.preventDefault();

		var name = event.currentTarget.nextElementSibling.value;

		Players.insert({ name: name, id: Session.get('id') });
		Session.set('showLanding', false);
	}
});