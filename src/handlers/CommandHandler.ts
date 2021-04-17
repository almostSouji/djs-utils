import { Command, ExecutionContext } from '../structures/Command';
import { join } from 'path';
import { readdirSync } from 'fs';
import * as Lexure from 'lexure';
import { UtilsClient } from '../structures/Client';
import { Message, User, TextChannel, Permissions, Collection, Guild } from 'discord.js';
import { EventEmitter } from 'events';
import chalk from 'chalk';

export default class CommandHandler extends EventEmitter {
	public readonly commands = new Collection<string, Command>();
	public readonly client: UtilsClient;

	public constructor(client: UtilsClient) {
		super();
		this.client = client;
	}

	public async read(folder: string): Promise<number> {
		const commandFiles = readdirSync(join(folder))
			.filter(file => ['.js', '.ts'].some((ending: string) => file.endsWith(ending)));

		for (const file of commandFiles) {
			const mod = await import(join(folder, file));
			const cmdClass = Object.values(mod).find((d: any) => d.prototype instanceof Command) as any;
			const cmd = new cmdClass(this);

			this.commands.set(cmd.id, cmd);
			this.client.logger.info(`command: ${cmd.id} ${chalk.green('✓')}`);
		}
		return this.commands.size;
	}

	public resolve(query?: string): Command | undefined {
		if (!query) return undefined;
		for (const [k, v] of this.commands) {
			if (k === query || v.aliases?.includes(query)) {
				return v;
			}
		}
		return undefined;
	}

	public isOwner(user: User): boolean {
		return this.client.config.owner.includes(user.id);
	}

	public async handle(message: Message): Promise<Message | void> {
		const { content, guild, author: { tag }, channel } = message;
		const lexer = new Lexure.Lexer(content)
			.setQuotes([
				['"', '"'],
				['“', '”']
			]);

		const r = lexer.lexCommand(s => this.prefixRegExp(message.guild).exec(s)?.[0]?.length ?? null);
		const command = r ? this.resolve(r[0].value) : undefined;

		if (!command) {
			this.emit('noCommand', message);
			return;
		}

		if (command.ownerOnly && !(await this.isOwner(message.author))) {
			this.emit('blocked', 'ownerOnly', command, message);
			return;
		}

		if (command.dmOnly && guild) {
			this.emit('blocked', 'dmOnly', command, message);
			return;
		}

		if (command.guildOnly && !guild) {
			this.emit('blocked', 'guildOnly', command, message);
			return;
		}
		const base = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']);
		if (command.clientPermissions) {
			base.add(command.clientPermissions);
		}
		if (channel instanceof TextChannel && !channel.permissionsFor(this.client.user!)?.has(base)) {
			this.emit('blocked', 'clientPermissions', command, message);
			return;
		}

		const parser = new Lexure.Parser(r![1]())
			.setUnorderedStrategy(Lexure.longShortStrategy());

		const res = parser.parse();
		const args = new Lexure.Args(res);

		this.client.logger.info(`command: ${command.id} by ${tag}`);
		return command.execute(message, args, '', ExecutionContext['PREFIXED']);
	}

	private escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	public prefix(guild?: Guild | null): string {
		const defaultPrefix = this.client.config.prefix;
		if (!guild) return defaultPrefix;
		return this.client.guildSettings.get(guild.id)?.prefix || defaultPrefix;
	}

	public prefixRegExp(guild?: Guild | null): RegExp {
		const prefix = this.prefix(guild);
		return new RegExp(`^(<@!?${this.client.user!.id}>|${this.escapeRegex(prefix)})\\s*`);
	}
}
