import { Meteor } from 'meteor/meteor';

import { Rooms } from '../imports/api/rooms.js';
import { Players } from '../imports/api/players.js';
import { Games } from '../imports/api/games.js';
import { Votes } from '../imports/api/votes.js';
import { Lynchs } from '../imports/api/lynchs.js';
import { Messages } from '../imports/api/messages.js';
import { Actions } from '../imports/api/actions.js';

import { Teams } from '../imports/api/teams.js';
import { Roles } from '../imports/api/roles.js';

const nextPhase = {
	'day-conversation': 'day-acuse',
	'day-acuse': 'day-vote',
	'day-vote': 'night',
	'night': 'night-result',
	'night-result': 'day-conversation'
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

function checkGameOver() {
	let remainingPlayers = Players
	.find({ dead: false })
	.map(p => p.role.alignment);

	let remainingTeams = { };
	for (let i = 0; i < remainingPlayers.length; i++) {
		remainingTeams[remainingPlayers[i]] = true;
	}

	if (Object.keys(remainingTeams).length === 1) {
		Games.update(Games.findOne({ })._id, { $set: { state: 'game-over' } });
	}
}

function kill(id) {
	console.log('killing player ' + id);
	let player = Players.findOne({ id: id });

	if (player.isImmune) {
		return 'That player was immune.';
	}

	Players.update(player._id, { $set: { dead: true } });
	if (player.role.name === Roles.Mafioso.name) {
		console.log('player was mafia');
		let mafia = Players.find({ role: { alignment: Teams.Mafia }, dead: false });
		if (mafia.length > 1) {
			console.log('making another mafia mafioso');
			Actions.insert({
				type: 'Change Roles',
				target: mafia[0].id,
				role: Roles.Mafioso
			});
		}
	}
	return 'You successfully killed that player.'
}

Meteor.startup(() => {
	return Meteor.methods({
		nuke() {
			Rooms.remove({ });
			Players.remove({ });
			Games.remove({ });
			Votes.remove({ });
			Lynchs.remove({ });
			Messages.remove({ });
			Actions.remove({ });
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
					console.log(JSON.stringify(playerVotes));
					for (i = 0; i < players.length; i++) {
						if (playerVotes[players[i]] === targetInterest) {
							target.push(players[i]);
						}
						if (playerVotes[players[i]] > targetInterest) {
							target = [players[i]];
							targetInterest = playerVotes[players[i]];
						}
					}

					console.log(JSON.stringify(target));
					console.log(targetInterest);
					for (i = 0; i < target.length; i++) {
						Lynchs.insert({
							id: players[i],
							name: Players.find({ id: players[i]}).fetch()[0].name
						});
					}

					Votes.remove({ });

					console.log(JSON.stringify(Lynchs.find({ }).fetch()));
					console.log(Lynchs.find({ }).count());
					if (Lynchs.find({ }).count() === 0) {
						game.state = nextPhase[game.state];
					}
					break;
				case 'day-vote':
					console.log('in day vote');
					votes = Votes.find({ }).fetch();
					playerVotes = { yes: 0, no: 0 };
					for (i = 0; i < votes.length; i++) {
						playerVotes[votes[i].value] = playerVotes[votes[i].value] + 1;
					}

					console.log(playerVotes);
					let lynch = Lynchs.find({ }).fetch()[0];
					if (playerVotes.yes > playerVotes.no) {
						let player = Players.find({ id: lynch.id }).fetch()[0];
						console.log(lynch.id);
						console.log(player.name);
						Players.update(player._id, { $set: { dead: true } });
						Lynchs.remove({ });
					}

					Lynchs.remove(lynch._id);
					Votes.remove({ });

					if (Lynchs.find({ }).count() > 0) {
						return;
					}
					break;
				case 'night':
					console.log('in night');
					let actions = Actions.find({ }).fetch();
					var action = actions.length > 0 ? actions[0] : null;
					while (action) {
						console.log(action);
						let player = Players.findOne({ id: action.id });
						switch (actions[0].type) {
							case Roles.Mafioso.name:
								let result = kill(action.value);
								break;
							case 'Change Roles':
								let target = Players.findOne({ id: actions[0].target });
								target.role = actions[0].role;
						}

						Actions.remove(action._id);
						actions = Actions.find({ }).fetch();
						action = actions.length > 0 ? actions[0] : null;
					}
					break;
			}

			Games.update(game._id, { $set: { state: nextPhase[game.state] } });

			checkGameOver();
		}
	})
});
