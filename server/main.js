import { Meteor } from 'meteor/meteor';

import { Rooms } from '../imports/api/rooms.js';
import { Players } from '../imports/api/players.js';
import { Games } from '../imports/api/games.js';
import { Votes } from '../imports/api/votes.js';
import { Lynchs } from '../imports/api/lynchs.js';
import { Messages } from '../imports/api/messages.js';
import { Actions } from '../imports/api/actions.js';
import { Voices } from '../imports/api/voices.js';
import { Results } from '../imports/api/results.js';

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
	Roles.Mason,
	Roles.Mason,
	Roles.Doctor,
	Roles.Vigilante,
	Roles.Mafioso,
	Roles.Pusheen,
	Roles.SerialKiller,
	Roles.Doctor,
	Roles.MobGrunt,
	Roles.Vigilante,
	Roles.Villager,
	Roles.Mason,
	Roles.MobGrunt,
	Roles.Villager,
	Roles.Doctor,
	Roles.Villager,
	Roles.Vigilante,
	Roles.MobGrunt,
	Roles.Villager,
	Roles.Mason,
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
		Voices.insert({
			content: 'Game over. '
				+ Object.keys(remainingTeams)[0]
				+ ' wins'
		});
	}
}

function kill(id) {
	console.log('killing player ' + id);
	let player = Players.findOne({ id: id });

	if (player.isImmune) {
		return false;
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
				role: Roles.Mafioso,
				priority: 100
			});
		}
	}
	return true;
}

function simpleKillAction(action, player, target, source) {
	let result = kill(action.value);
	if (result) {
		Results.insert({ id: player.id, msg: 'You successfully killed ' + target.name });
		Results.insert({ id: target.id, msg: 'You were killed' });
		Voices.insert({
			content: target.name
				+ ' was killed by '
				+ source
				+ '.  Their role was '
				+ target.role.name
		});
	} else {
		Results.insert({ id: player.id, msg: target.name + ' was immune' });
		Results.insert({ id: target.id, msg: 'Someone tried to kill you but you were immune' });
	}
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
			Voices.remove({ });
			Results.remove({ });
		},
		startGame() {
			let players = Players.find({ }, { sort: ['id'] }).fetch();
			if (players.length < 5) {
				return;
			}

			Games.insert({ state: 'day-conversation' });

			for (let i = 0; i < players.length; i++) {
				Players.update(players[i]._id, { $set: {
					role: roleOrder[i],
					isImmune: roleOrder[i].isImmune || false,
					dead: false
				} });
			}
		},
		nextPhase() {
			let game = Games.find({ }).fetch()[0];

			switch(game.state) {
				case 'day-conversation':
					Voices.insert({ content: 'begin acusing' });
					break;
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
						Voices.insert({ content: 'It is now night time' });
					} else {
						Voices.insert({ content: 'Someone is on trial' });
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
					let player = Players.find({ id: lynch.id }).fetch()[0];
					if (playerVotes.yes > playerVotes.no) {
						console.log(lynch.id);
						console.log(player.name);
						Players.update(player._id, { $set: { dead: true } });
						Lynchs.remove({ });
					}

					Lynchs.remove(lynch._id);
					Votes.remove({ });

					Voices.insert({
						content: player.name
							+ ' was found ' 
							+ (playerVotes.yes > playerVotes.no ? 'guilty' : 'innocent')
							+ 'with a vote of '
							+ playerVotes.yes
							+ ' to '
							+ playerVotes.no
					});

					if (playerVotes.yes > playerVotes.no) {
						Voices.insert({
							content: 'their role was '
								+ player.role.name
						});
					}

					if (Lynchs.find({ }).count() > 0) {
						return;
					}

					Voices.insert({ content: 'It is now night time' });
					break;
				case 'night':
					Voices.insert({ content: 'night is over.'});
					console.log('in night');
					let actions = Actions.find({ }, { sort: [['priority', 'desc']] }).fetch();
					var action = actions.length > 0 ? actions[0] : null;
					while (action) {
						console.log(action);
						let player = Players.findOne({ id: action.id });
						let target = Players.findOne({ id: action.value });
						switch (action.type) {
							case Roles.Mafioso.name:
								simpleKillAction(action, player, target, 'the mafia');
								break;
							case Roles.Vigilante.name:
								simpleKillAction(action, player, target, 'a vigilante');
								break;
							case Roles.SerialKiller.name:
								simpleKillAction(action, player, target, 'a serial killer');
								break;
							case Roles.Doctor.name:
								Players.update(target._id, { $set: { isImmune: true } });
								Actions.insert({
									type: 'Remove Immunity',
									value: target.id,
									priority: -1
								});
								break;
							case 'Change Roles':
								target.role = action.role;
								Results.insert({
									id: target.id,
									msg: 'You have become the Mafioso'
								});
							case 'Remove Immunity':
								Players.update(target._id, { $set: { isImmune: target.role.isImmune || false } });
						}

						Actions.remove(action._id);
						actions = Actions.find({ }, { sort: [['priority', 'desc']] }).fetch();
						action = actions.length > 0 ? actions[0] : null;
					}
					break;
				case 'night-result':
					Results.remove({ });
					Messages.remove({ });
					break;
			}

			Games.update(game._id, { $set: { state: nextPhase[game.state] } });

			checkGameOver();
		}
	})
});
