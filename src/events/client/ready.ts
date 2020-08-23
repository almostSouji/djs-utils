import EventHandler from '../../handlers/EventHandler';
import { Event } from '../../structures/Event';

export default class extends Event {
	public constructor(handler: EventHandler) {
		super(handler, {
			emitter: 'client',
			name: 'ready'
		});
	}

	public async execute(): Promise<boolean> {
		const { client } = this.handler;
		client.logger.info(`Client ready on ${client.user!.tag} (${client.user!.id})`);
		return true;
	}
}
