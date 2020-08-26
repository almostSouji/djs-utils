import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { MESSAGES, TAG } from '../util/constants';
import * as Lexure from 'lexure';
import { Embed } from '../util/Embed';
import { ellipsis } from '../util';

const { COMMANDS } = MESSAGES;

export default class extends Command {
	private readonly subCommands = ['search', 'show'];
	public constructor(handler: CommandHandler) {
		super('tag', handler, {
			aliases: ['t', 'tags'],
			description: {
				content: 'Shows or searches for a tag',
				usage: '<search query> | <show tagname>',
				flags: {}
			}
		});
	}

	public async execute(message: Message, args: Lexure.Args, special?: string): Promise<Message|void> {
		const { client } = this.handler;
		const subCommand = args ? args.single() : special!;
		const query = args ? Lexure.joinTokens(args.many()) : special!;
		if (subCommand === 'show' || special) {
			if (!query.length) {
				if (!special) {
					message.answer(COMMANDS.TAG.NO_QUERY);
				}
				return;
			}
			const tag = client.tagCache.find(tag => (query === tag.name || tag.aliases.includes(query)));
			if (!tag) {
				if (!special) {
					message.answer(COMMANDS.TAG.NO_TAG(query));
				}
				return;
			}
			if (message.useEmbed) {
				const embed = new Embed()
					.setFooter(COMMANDS.TAG.NOTICE, client.user!.displayAvatarURL({ dynamic: true }))
					.setDescription(tag.content)
					.shorten();
				return message.answer('', embed);
			}
			return message.answer(tag.content);
		} else if (subCommand === 'search' && !special) {
			if (!query.length) {
				return message.answer(COMMANDS.TAG.NO_QUERY);
			}
			const searchResult = client.tagCache
				.filter(tag => tag.name.includes(query) || tag.aliases.some(a => a.includes(query)))
				.first(TAG.TRUNCATE_THRESHOLD)
				.map(tag => `\`${tag.name}\``)
				.sort()
				.join(', ') || 'None';

			if (message.useEmbed) {
				const embed = new Embed()
					.setTitle(`Found tags based on query "${query}"`)
					.setDescription(searchResult)
					.setFooter(COMMANDS.TAG.TRUNCATE_NOTICE, client.user?.displayAvatarURL())
					.shorten();
				return message.answer('', embed);
			}
			return message.answer(ellipsis(`Found tags: ${searchResult}`, 1900));
		} else if (!special) {
			return message.answer(COMMANDS.COMMON.FAIL.NO_SUB_COMMAND(this.subCommands));
		}
	}
}
