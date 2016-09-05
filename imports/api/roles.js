import { Teams } from './teams.js';
import { Menus } from './menus.js';

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
		alignment: Teams.Mafia,
		menu: Menus.Unary,
		menuFilter: (player) => player.dead || player.role.alignment === Teams.Mafia
	}
};
