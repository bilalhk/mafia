import { Meteor } from 'meteor/meteor';

import { Rooms } from '../imports/api/rooms.js';
import { Players } from '../imports/api/players.js';
import { Games } from '../imports/api/games.js';
import { Votes } from '../imports/api/votes.js';
import { Lynchs } from '../imports/api/lynchs.js';

import { Teams } from '../imports/api/teams.js';
import { Roles } from '../imports/api/roles.js';

const nextPhase = {
	'day-conversation': 'day-acuse',
	'day-acuse': 'day-vote',
	'day-vote': 'night',
	'night': 'day-conversation'
};

const roleOrder = [
	Roles.Villager,
	Roles.Villager,
	Roles.Villager,
	Roles.Villager,
	Roles.Mafioso,
	Roles.Villager,
	Roles.Villager,
	Roles.MobGrunt,
	Roles.Villager,
	Roles.Villager,
	Roles.Villager,
	Roles.MobGrunt,
	Roles.Villager,
	Roles.Villager,
	Roles.Villager,
	Roles.Villager,
	Roles.MobGrunt,
	Roles.Villager,
	Roles.Villager,
	Roles.Villager
];

Meteor.startup(() => {
	return Meteor.methods({
		nuke() {
			Rooms.remove({ });
			Players.remove({ });
			Games.remove({ });
			Votes.remove({ });
			Lynchs.remove({ });
		},
		startGame() {
			let players = Players.find({ }).fetch();
			if (players.length < 5) {
				return;
			}

			Games.insert({ state: 'day-conversation' });

			for(let i = 0; i < players.length; i++) {
				Players.update(players[i]._id, { $set: {
					role: roleOrder[i],
					dead: false
				} });
			}
		},
		nextPhase() {
			let game = Games.find({ }).fetch()[0];

			switch(game.state) {
				case 'day-acuse':
					console.log('in day acuse');
					let votes = Votes.find({ }).fetch();
					let playerVotes = { };
					for (let i = 0; i < votes.length; i++) {
						if (playerVotes[votes[i].value] === undefined) {
							playerVotes[votes[i].value] = 0;
						}
						playerVotes[votes[i].value] = playerVotes[votes[i].value] + 1;
					}
					let target = [];
					let targetInterest = 0;
					let players = Object.keys(playerVotes);
					for (i = 0; i < players.length; i++) {
						if (playerVotes[players[i]] === targetInterest) {
							target.push(players[i]);
						}
						if (playerVotes[players[i]] > targetInterest) {
							target = [players[i]];
							targetInterest = playerVotes[players[i]];
						}
					}

					for (i = 0; i < target.length; i++) {
						Lynchs.insert({
							id: players[i],
							name: Players.find({ id: players[i]}).fetch()[0].name
						});
					}

					Votes.remove({ });
					break;
				case 'day-vote':
					console.log('in day vote');
					votes = Votes.find({ }).fetch();
					playerVotes = { yes: 0, no: 0 };
					for (i = 0; i < votes.length; i++) {
						playerVotes[votes[i].value] = playerVotes[votes[i].value] + 1;
					}

					console.log(playerVotes);
					if (playerVotes.yes > playerVotes.no) {
						let lynch = Lynchs.find({ }).fetch()[0];
						let player = Players.find({ id: lynch.id }).fetch()[0];
						console.log(lynch.id);
						console.log(player.name);
						Players.update(player._id, { $set: { dead: true } });
						Lynchs.remove(lynch._id);

						Votes.remove({ });
						if (Lynchs.find({ }).count() > 0) {
							return;
						}
						break;
					}
			}

			Games.update(game._id, { $set: { state: nextPhase[game.state] } });
		}
	})
});
