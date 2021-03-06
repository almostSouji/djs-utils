
import { Client, ClientOptions, Guild, GuildChannel, Role, RoleResolvable, GuildChannelResolvable, BaseManager, User, Collection } from 'discord.js';
import CommandHandler from '../handlers/CommandHandler';
import { logger } from '../util/logger';
import { Logger } from 'winston';
import EventHandler from '../handlers/EventHandler';
import { CHANNELS_PATTERN, ROLES_PATTERN, USERS_PATTERN } from '../util/constants';
import { Sql } from 'postgres';
import Database, { Tag } from '../structures/Database';

interface UtilConfig {
	prefix: string;
	owner: string[];
}

export interface GuildSettings {
	guild: string;
	repository_aliases?: string[];
	prefixless_allowed_channels?: string[];
	prefix?: string;
}

declare module 'discord.js' {
	export interface Client {
		readonly commands: CommandHandler;
		readonly config: UtilConfig;
		readonly logger: Logger;
		readonly sql: Sql<{}>;
		readonly tagCache: Collection<string, Tag>;
		readonly guildSettings: Collection<string, GuildSettings>;
		resolveRole(guild: Guild, query?: string): Role | undefined;
		resolveChannel(guild: Guild, types: GuildChannelType[], query?: string): GuildChannel | undefined;
	}
}

type GuildChannelType = 'text' | 'news' | 'voice' | 'category' | 'store';

export class UtilsClient extends Client {
	public readonly commands = new CommandHandler(this);
	public readonly events = new EventHandler(this);
	public readonly config: UtilConfig;
	public readonly logger = logger;
	public readonly sql: Sql<{}>;
	private readonly db: Database;
	public readonly tagCache = new Collection<string, Tag>();
	public readonly guildSettings = new Collection<string, GuildSettings>();
	public constructor(config: UtilConfig, clientOptions: ClientOptions = {}) {
		super(clientOptions);
		this.config = config;
		this.db = new Database(this);
		this.sql = this.db.sql;
	}

	private resolveFromManager<T extends GuildChannel | Role, S extends GuildChannelResolvable | RoleResolvable>(query: string, reg: RegExp, manager: BaseManager<string, T, S>, predicate?: (p1: T) => boolean): T | undefined {
		reg = new RegExp(reg);
		const match = reg.exec(query);
		if (match) {
			query = match[1];
			const res = manager.resolve(query as S);
			if (!res) return undefined;
			if (predicate && predicate(res)) {
				return res;
			}
			return res;
		}

		query = query.toLowerCase();
		const results = new Array(3);
		const base = predicate ? manager.cache.filter(predicate) : manager.cache;
		for (const element of base.values()) {
			const name = element.name.toLowerCase();
			if (name === query) results[0] = element;
			if (name.startsWith(query)) results[1] = element;
			if (name.includes(query)) results[2] = element;
		}
		return results.filter(e => e)[0];
	}

	public resolveChannel(guild: Guild, types: GuildChannelType[], query?: string): GuildChannel | undefined {
		if (!query) return undefined;
		return this.resolveFromManager(query, CHANNELS_PATTERN, guild.channels, c => types.includes(c.type));
	}

	public resolveRole(guild: Guild, query?: string): Role | undefined {
		if (!query) return undefined;
		return this.resolveFromManager(query, ROLES_PATTERN, guild.roles);
	}

	public async resolveUser(query?: string, guild?: Guild): Promise<User | undefined> {
		if (!query) return undefined;
		const reg = new RegExp(USERS_PATTERN);
		const match = reg.exec(query);
		if (match) {
			query = match[1];
			try {
				const res = await this.users.fetch(query);
				return res;
			} catch {
				return undefined;
			}
		}
		query = query.toLowerCase();
		if (guild) {
			try {
				const res = await guild.members.fetch({ query, time: 1000, limit: 1 }).then(col => col.first());
				if (res) {
					return res.user;
				}
				return undefined;
			} catch {
				return undefined;
			}
		}
	}

	public async initSettings() {
		const res = await this.sql<GuildSettings[]>`
			select * from guild_settings
		`;
		for (const row of res) {
			this.guildSettings.set(row.guild, row);
		}
	}

	public async init(token: string) {
		await this.db.init();
		await this.initSettings();
		await this.login(token);
	}
}
