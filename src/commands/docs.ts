
import fetch from 'node-fetch';
import * as qs from 'querystring';
import * as Lexure from 'lexure';

import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { MESSAGES, DOCS } from '../util/constants';
import { Embed } from '../util/Embed';

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('docs', handler, {
			aliases: ['docs', 'docu', 'doc'],
			description: {
				content: 'Searches discord.js documentation.',
				usage: '<query> [--source <source>] [--force]',
				flags: {
					'`-s=`, `--source=`, `--src=`': 'provide a source other than the discord.js main repository',
					'`-f`, `--force`': 'refresh documentation cache'
				}
			},
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
		});
	}

	public async execute(message: Message, args: Lexure.Args): Promise<Message|void> {
		let source = args.option('source', 'src', 's') ?? 'stable';
		const force = args.flag('force', 'f');
		const includePrivate = args.flag('private', 'p');
		const query = Lexure.joinTokens(args.many(), null, true);

		const q = query.split(' ');
		if (!DOCS.SOURCES.includes(source)) {
			const potentialSource = `${DOCS.API.DOCS_URL}${source}.json`;
			const res = await fetch(potentialSource);
			if (res.ok) {
				source = potentialSource;
			} else {
				source = 'stable';
			}
		}
		let forceColor;
		if (source === DOCS.COLLECTION_SOURCE) {
			forceColor = DOCS.COLORS.COLLECTION;
		}
		if (source === DOCS.DEV_SOURCE) {
			forceColor = DOCS.COLORS.DEV;
		}
		const queryString = qs.stringify({ src: source, q: q.join(' '), force, includePrivate });
		const res = await fetch(`${DOCS.API.BASE_URL}${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return message.answer(MESSAGES.COMMANDS.DOCS.ERRORS.NONE_FOUND(query));
		}
		if (forceColor) {
			embed.color = forceColor;
		}
		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild!.me!)!.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.answer('', new Embed(embed));
		}
		const msg = await message.answer('', new Embed(embed));
		msg.react(DOCS.EMOJI.DELETE);
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user): boolean => reaction.emoji.name === DOCS.EMOJI.DELETE && user.id === message.author.id,
				{ max: 1, time: DOCS.REACTION_TIMEOUT, errors: ['time'] }
			);
		} catch {
			await msg.reactions.removeAll();
			return message;
		}
		react.first()!.message.delete();
		return message;
	}
}
