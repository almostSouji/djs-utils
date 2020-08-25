import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { Tag } from '../structures/Database';
import { MESSAGES } from '../util/constants';

const { COMMANDS } = MESSAGES;

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('reload', handler, {
			aliases: ['reloadtags', 'tag reload', 'tagreload'],
			description: {
				content: 'Reloads all tags from the database',
				usage: '',
				flags: {}
			},
			ownerOnly: true
		});
	}

	public async execute(message: Message): Promise<Message|void> {
		const { client } = this.handler;
		client.tagCache.clear();

		try {
			const settingsRes = await client.sql`
			select * from tags
		`;
			for (const row of settingsRes) {
				const tag = {
					...row,
					aliases: row.aliases.split(',')
				};
				client.tagCache.set(row.name, (tag as Tag));
			}
		} catch (err) {
			client.logger.error('TAG_RELOAD', err);
			return message.answer(COMMANDS.RELOAD.FAIL);
		}

		return message.answer(COMMANDS.RELOAD.SUCCESS);
	}
}
