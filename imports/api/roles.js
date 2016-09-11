import { Teams } from './teams.js';
import { Menus } from './menus.js';

export const Roles = {
	Pusheen: {
		name: 'Pusheen',
		alignment: Teams.Town
	},
	Villager: {
		name: 'Villager',
		alignment: Teams.Town
	},
	Mason: {
		name: 'Mason',
		chat: 'Mason',
		alignment: Teams.Town
	},
	Doctor: {
		name: 'Doctor',
		alignment: Teams.Town,
		menu: Menus.Unary,
		priority: 70,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	Vigilante: {
		name: 'Vigilante',
		alignment: Teams.Town,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	SerialKiller: {
		name: 'SerialKiller',
		alignment: Teams.SerialKiller,
		isImmune: true,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	MobGrunt: {
		name: 'MobGrunt',
		chat: Teams.Mafia,
		alignment: Teams.Mafia
	},
	Mafioso: {
		name: 'Mafioso',
		alignment: Teams.Mafia,
		chat: Teams.Mafia,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: player => player.dead || player.role.alignment === Teams.Mafia
	}
};
