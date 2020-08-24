import EventHandler from '../../handlers/EventHandler';
import { Event } from '../../structures/Event';
import { Message, TextChannel } from 'discord.js';

export default class extends Event {
	public constructor(handler: EventHandler) {
		super(handler, {
			emitter: 'command',
			name: 'noCommand'
		});
	}

	public async execute(message: Message): Promise<boolean> {
		const regex = /(?<repo>\S+)#(?<num>\d+) ?(?<verbose>(--verbose|-v))?/i;
		const groups = regex.exec(message.content)?.groups;

		if (!groups) {
			return false;
		}
		const command = this.handler.client.commands.resolve('pr-issue');
		if (!command) {
			return false;
		}
		if (message.channel instanceof TextChannel && !message.channel.permissionsFor(message.client.user!)?.has(command?.clientPermissions)) {
			return false;
		}
		const res = command?.execute(message);
		if (!res) {
			return false;
		}
		return true;
	}
}
