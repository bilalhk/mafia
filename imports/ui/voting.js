import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { Rooms } from '../api/rooms.js';
import { Players } from '../api/players.js';
import { Games } from '../api/games.js';
import { Votes } from '../api/votes.js';
import { Lynchs } from '../api/lynchs.js';

import './voting.html';

Template.vote.helpers({
	target() {
		return Lynchs.find({ }).fetch()[0].name;
	},
	amTarget() {
		return Lynchs.find({ }).fetch()[0].id === Session.get('id');
	}
});

Template.vote.events({
	'click .yes'(event, template) {
		event.preventDefault();

		let vote = Votes.find({ id: Session.get('id') }).fetch();

		if (vote.length > 0) {
			Votes.update(value._id, { $set: { value: 'yes' } });
		}
		else {
			Votes.insert({ id: Session.get('id'), value: 'yes' });
		}
	},
	'click .no'(event, template) {
		event.preventDefault();

		let vote = Votes.find({ id: Session.get('id') }).fetch();

		if (vote.length > 0) {
			Votes.update(value._id, { $set: { value: 'no' } });
		}
		else {
			Votes.insert({ id: Session.get('id'), value: 'no' });
		}
	}
});