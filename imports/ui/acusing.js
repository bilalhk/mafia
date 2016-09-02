import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { Rooms } from '../api/rooms.js';
import { Players } from '../api/players.js';
import { Games } from '../api/games.js';
import { Votes } from '../api/votes.js';

import './acusing.html';

Template.acusing.helpers({
	players() {
		return Players.find({ dead: false });
	},
	isNotMe(id) {
		return id !== Session.get('id');
	}
});

Template.acusing.events({
	'click .vote'(event, template) {
		event.preventDefault();

		let vote = Votes.find({ id: Session.get('id') }).fetch();
		let value = template.find('input:radio[name=vote]:checked').value;

		if (vote.length > 0) {
			Votes.update(value._id, { $set: { value: value } });
		}
		else {
			Votes.insert({ id: Session.get('id'), value: value });
		}
	}
});