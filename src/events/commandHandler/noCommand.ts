import EventHandler from '../../handlers/EventHandler';
import { Event } from '../../structures/Event';
import { Message, TextChannel } from 'discord.js';
import TagCommand from '../../commands/tag';

export default class extends Event {
	public constructor(handler: EventHandler) {
		super(handler, {
			emitter: 'command',
			name: 'noCommand'
		});
	}

	public async execute(message: Message): Promise<boolean> {
		const { client } = this.handler;

		if (message.channel instanceof TextChannel && !message.channel.permissionsFor(message.client.user!)?.has(['SEND_MESSAGES'])) {
			return false;
		}

		const match = client.commands.prefixRegExp(message.guild).exec(message.content)?.[0] ?? null;
		if (match) {
			const command = this.handler.client.commands.resolve('tag') as TagCommand;
			const str = message.content.replace(match, '');
			if (!str) return false;
			command.executeFromRegExp(message, str);

			return true;
		}
		return false;
	}
}
