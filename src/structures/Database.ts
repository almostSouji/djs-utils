import * as postgres from 'postgres';
import { UtilsClient } from './Client';

export interface Tag {
	name: string;
	content: string;
	aliases: string[];
	user: string;
	templated: boolean;
	hoisted: boolean;
	createdAt: string;
	updatedAt: string;
}

export default class PG {
	public sql: postgres.Sql<{}>;
	public client: UtilsClient;
	public constructor(client: UtilsClient) {
		this.sql = postgres({
			onnotice: client.logger.info
		});
		this.client = client;
	}

	public async init() {
		await this.sql.begin(async sql => {
			await sql`
				create table if not exists tags(
					id			serial primary key,
					name		varchar,
					content		varchar,
					aliases		varchar,
					author		varchar(19),
					templated 	boolean,
					hoisted		boolean,
					createdAt	timestamp,
					updatedAt	timestamp
				);
			`;

			await sql`
				create table if not exists repository_aliases(
					guild	varchar(19) primary key,
					aliases	text[]
				)
			`;
		});

		const settingsRes = await this.sql`
			select * from tags
		`;
		for (const row of settingsRes) {
			const tag = {
				...row,
				aliases: row.aliases.split(',')
			};
			this.client.tagCache.set(row.name, (tag as Tag));
		}
	}
}
