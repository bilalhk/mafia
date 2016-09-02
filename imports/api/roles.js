import { Teams } from './teams.js';

export const Roles = {
	Villager: {
		name: 'Villager',
		alignment: Teams.Town
	},
	MobGrunt: {
		name: 'MobGrunt',
		alignment: Teams.Mafia
	},
	Mafioso: {
		name: 'Mafioso',
		alignment: Teams.Mafia
	}
};