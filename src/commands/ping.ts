import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { MESSAGES } from '../util/constants';

const { COMMANDS: { PING } } = MESSAGES;

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('ping', handler, {
			aliases: ['pong'],
			description: {
				content: 'Respond with websocket heartbeat and API latency',
				usage: '',
				flags: {}
			}
		});
	}

	public async execute(message: Message): Promise<Message|void> {
		const { client } = this.handler;
		const sent = await message.answer(PING.WAITING);
		const heartbeat = Math.round(client.ws.ping);
		const latency = sent.createdTimestamp - message.createdTimestamp;
		return sent.edit(PING.SUCCESS(heartbeat, latency));
	}
}
