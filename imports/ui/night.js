import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';
import { Games } from '../api/games.js';
import { Messages } from '../api/messages.js';
import { Actions } from '../api/actions.js';
import { Roles } from '../api/roles.js';

import { Teams } from '../api/teams.js'

import './night.html';

Template.night.helpers({
	hasActionMenu() {
		return !!Players.findOne({ id: Session.get('id') }).role.menu;
	}
});

Template.chat.helpers({
	messages() {
		let player = Players.findOne({ id: Session.get('id') });

		if (player.role.alignment === Teams.Mafia) {
			return Messages.find({ id: Teams.Mafia });
		}

		return [];
	}
});

Template.unarymenu.helpers({
	players() {
		let player = Players.findOne({ id: Session.get('id') });

		return Players
			.find({ })
			.map(p => {
				p.canAct = Roles[player.role.name].menuFilter(p);
				return p;
			});
	}
});

Template.chat.events({
	'click .send': (event, template) => {
		event.preventDefault();

		let messageBox = template.find('input:text[name=messagebox]');
		let message = messageBox.value;
		Messages.insert({
			id: Teams.Mafia,
			from: Players.findOne({ id: Session.get('id') }).name,
			content: message
		});

		messageBox.value = "";
	}
});

Template.unarymenu.events({
	'click .action'(event, template) {
		event.preventDefault();

		let player = Players.findOne({ id: Session.get('id') });
		let action = Actions.find({ id: Session.get('id') }).fetch();
		let value = event.target.value;

		if (action.length > 0) {
			Actions.update(action._id, { $set: { value: value } });
		}
		else {
			Actions.insert({
				id: Session.get('id'),
				value: value,
				type: player.role.name
			});
		}
	}
});