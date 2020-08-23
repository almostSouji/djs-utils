import EventHandler from '../handlers/EventHandler';

interface EventOptions {
	name: string;
	emitter: string;
}

export abstract class Event {
	public name: string;
	public emitter: string;
	public handler: EventHandler;
	public constructor(handler: EventHandler, options: EventOptions) {
		this.name = options.name;
		this.emitter = options.emitter;
		this.handler = handler;
	}

	public abstract async execute(...data: unknown[]): Promise<boolean>;
}
