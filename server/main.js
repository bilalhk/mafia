import { Meteor } from 'meteor/meteor';

import { Rooms } from '../imports/api/rooms.js';
import { Players } from '../imports/api/players.js';

Meteor.startup(() => {
	return Meteor.methods({
		nuke() {
			Rooms.remove({ });
			Players.remove({ });
		}
	})
});
