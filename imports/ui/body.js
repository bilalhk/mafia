import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { Rooms } from '../api/rooms.js';

import './body.html';

import './landing.js';
import './host.js';
import './wait.js';

Session.set('showLanding', true);
Session.set('id', Random.id());

Template.body.helpers({
	showLanding() {
		return Session.get('showLanding');
	},
	showHost() {
		let rooms = Rooms.find({ }).fetch();
		return rooms.length > 0 && rooms[0].owner === Session.get('id');
	},
	showWait() {
		return true;
	},
	id() {
		return Session.get('id');
	},
	state() {
		let keys = Object.keys(Session.keys);
		let state = { };

		for(var i = 0; i < keys.length; i++) {
			state[keys[i]] = Session.get(keys[i]);
		}

		return JSON.stringify(state);
	}
});

Template.body.events({
	'click .nuke'(event) {
		event.preventDefault();

		Meteor.call('nuke');
		Session.set('showLanding', true)
	}
});