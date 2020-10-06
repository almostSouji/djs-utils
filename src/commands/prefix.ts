import * as Lexure from 'lexure';

import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { MESSAGES } from '../util/constants';

const { COMMANDS: { PREFIX } } = MESSAGES;

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('prefix', handler, {
			aliases: ['p'],
			description: {
				content: 'Sets prefix',
				usage: '<prefix>',
				flags: {
					'`-f`, `--force`': 'skip permission check for setting'
				}
			}
		});
	}

	public async execute(message: Message, args: Lexure.Args): Promise<Message | void> {
		const newPrefix = args.single();
		const skip = args.flag('force', 'f') && this.handler.client.commands.isOwner(message.author);

		if (!message.guild) {
			message.answer(PREFIX.NO_GUILD(this.handler.prefix(message.guild)));
			return;
		}

		if ((!skip && !message.member?.permissions.has('MANAGE_GUILD')) || !newPrefix) {
			const current = this.handler.prefix(message.guild);
			message.answer(PREFIX.CURRENT(current));
			return;
		}

		if (newPrefix.length > 5) {
			message.answer(PREFIX.ERRORS.TOO_LONG);
			return;
		}

		await this.handler.client.sql`
			insert into guild_settings(guild, prefix)
			values(${message.guild.id}, ${newPrefix})
			on conflict(guild)
			do update set prefix = ${newPrefix};`;

		const settings = this.handler.client.guildSettings;
		const current = settings.get(message.guild.id);
		const newEntry = current
			? {
				...current,
				prefix: newPrefix
			}
			: {
				guild: message.guild.id,
				prefix: newPrefix
			};

		settings.set(message.guild.id, newEntry);

		message.answer(PREFIX.SUCCESS(message.guild.name, newPrefix));
	}
}
