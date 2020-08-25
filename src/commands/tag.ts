import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { MESSAGES } from '../util/constants';
import * as Lexure from 'lexure';
import { Embed } from '../util/Embed';

const { COMMANDS } = MESSAGES;

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('tag', handler, {
			aliases: ['t', 'showtag'],
			description: {
				content: 'Shows a tag',
				usage: '<tagname|tagalias>',
				flags: {}
			},
			ownerOnly: true
		});
	}

	public async execute(message: Message, args: Lexure.Args, special?: string): Promise<Message|void> {
		const { client } = this.handler;
		const name = args ? Lexure.joinTokens(args.many()) : special!;
		if (!name.length) return;

		const tag = client.tagCache.find(tag => (name === tag.name || tag.aliases.includes(name)));
		if (!tag) {
			if (!special) {
				message.answer(COMMANDS.TAG.NO_TAG(name));
			}
			return;
		}
		if (message.useEmbed) {
			const embed = new Embed()
				.setFooter(COMMANDS.TAG.NOTICE, client.user!.displayAvatarURL({ dynamic: true }))
				.setDescription(tag.content);
			return message.answer('', embed);
		}
		return message.answer(tag.content);
	}
}
