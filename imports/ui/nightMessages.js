import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../api/players.js';
import { Games } from '../api/games.js';
import { Results } from '../api/results.js';

import './nightMessages.html';

Template.nightmessages.helpers({
	results() {
		return Results.find({ id: Session.get('id') });
	}
});