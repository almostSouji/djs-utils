import EventHandler from '../../handlers/EventHandler';
import { Event } from '../../structures/Event';
import { Message } from 'discord.js';

export default class extends Event {
	public constructor(handler: EventHandler) {
		super(handler, {
			emitter: 'client',
			name: 'message'
		});
	}

	public async execute(message: Message): Promise<boolean> {
		const { client } = this.handler;

		await client.commands.handle(message);
		return true;
	}
}
