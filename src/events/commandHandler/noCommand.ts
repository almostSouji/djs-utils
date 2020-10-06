import EventHandler from '../../handlers/EventHandler';
import { Event } from '../../structures/Event';
import { Message, TextChannel, Guild } from 'discord.js';
import { Args, Token, ParserOutput } from 'lexure';
import { ExecutionContext } from '../../structures/Command';
import { PREFIXES } from '../../util/constants';

export default class extends Event {
	public constructor(handler: EventHandler) {
		super(handler, {
			emitter: 'command',
			name: 'noCommand'
		});
	}

	private allowPrefixless(channelID: string, guild?: Guild | null) {
		if (!guild) return true;
		const allowed = this.handler.client.guildSettings.get(guild.id)?.prefixless_allowed_channels ?? [];
		return allowed.includes(channelID);
	}

	public async execute(message: Message): Promise<boolean> {
		const { client } = this.handler;

		if (message.channel instanceof TextChannel && !message.channel.permissionsFor(message.client.user!)?.has(['SEND_MESSAGES'])) {
			return false;
		}

		if (this.allowPrefixless(message.channel.id, message.guild)) {
			for (const command of client.commands.commands.values()) {
				if (!command.regExp) continue;
				const match = command.regExp.exec(message.content);
				if (!match) continue;

				const [, ...args] = match;
				const tokens: Token[] = args.filter(v => v).map(s => ({ raw: s, trailing: '', value: s }));
				const out: ParserOutput = {
					ordered: tokens,
					flags: new Set(),
					options: new Map()
				};

				try {
					if (message.channel instanceof TextChannel && !message.channel.permissionsFor(message.client.user!)?.has(command?.clientPermissions)) {
						return false;
					}

					await command.execute(message, new Args(out), '', ExecutionContext['REGEXP']);
				} catch (error) {
					message.answer(`${PREFIXES.FAIL}${error.message}`);
				}

				break;
			}
		}

		const match = client.commands.prefixRegExp(message.guild).exec(message.content)?.[0] ?? null;
		if (match) {
			const command = this.handler.client.commands.resolve('tag');
				command?.execute(message, undefined, message.content.replace(match, ''), ExecutionContext['TAG_MATCH']);
				return true;
		}
		return false;
	}
}
