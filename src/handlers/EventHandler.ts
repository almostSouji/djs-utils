import { UtilsClient } from '../structures/Client';
import { readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { EventEmitter } from 'events';
import { Event } from '../structures/Event';
import { Collection } from 'discord.js';

export default class EventHandler {
	private readonly events = new Collection<string, Event>();
	public readonly client: UtilsClient;
	public readonly emitters = new Collection<string, EventEmitter>();
	public constructor(client: UtilsClient) {
		this.client = client;
		this.emitters.set('client', client);
		this.emitters.set('command', client.commands);
	}

	public async read(folder: string): Promise<number> {
		const eventFiles = readdirSync(join(folder))
			.filter(file => ['.js', '.ts'].some((ending: string) => file.endsWith(ending)));

		for (const file of eventFiles) {
			const mod = await import(join(folder, file));
			const eventClass = Object.values(mod).find((d: any) => d.prototype instanceof Event) as any;
			const event = new eventClass(this);
			const emitter = this.emitters.get(event.emitter);

			if (!emitter) {
				this.client.logger.error(`Missing emitter: ${event.emitter}`);
				return this.events.size;
			}

			this.events.set(event.name, event.execute.bind(event));
			emitter.on(event.name, event.execute.bind(event));
			this.client.logger.info(`event: ${event.name} ${chalk.green('❯')} ${emitter.constructor.name}`);
		}
		return this.events.size;
	}
}
