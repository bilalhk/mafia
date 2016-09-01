import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';

import './host.html';

Template.host.helpers({
	players() {
		return Players.find({ });
	}
});