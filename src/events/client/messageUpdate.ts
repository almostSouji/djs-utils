import EventHandler from '../../handlers/EventHandler';
import { Event } from '../../structures/Event';
import { Message } from 'discord.js';

export default class extends Event {
	public constructor(handler: EventHandler) {
		super(handler, {
			emitter: 'client',
			name: 'messageUpdate'
		});
	}

	public async execute(oldMessage: Message, newMessage: Message): Promise<boolean> {
		const { client } = this.handler;

		if (oldMessage.content === newMessage.content) return false;

		await client.commands.handle(newMessage);
		return true;
	}
}
