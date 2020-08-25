import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message } from 'discord.js';
import { safeLoad } from 'js-yaml';
import { MESSAGES } from '../util/constants';
import fetch from 'node-fetch';
import * as Lexure from 'lexure';

const { COMMANDS } = MESSAGES;

interface TagData {
	name: string;
	content: string;
	aliases: string[];
	user: string;
	templated: boolean;
	hoisted?: boolean;
	createdAt: string;
	updatedAt: string;
}

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('load', handler, {
			aliases: ['load', 'loadbackup', 'loadtags'],
			description: {
				content: 'Load tags from a backup YAML file (file-command)',
				usage: '',
				flags: {
					'`-r`, `--reset`': 'reset tag database before loading'
				}
			},
			ownerOnly: true
		});
	}

	public async execute(message: Message, args: Lexure.Args): Promise<Message|void> {
		const { client } = this.handler;
		const reset = args.flag('r', 'reset');
		const url = message.attachments.first()?.url;
		if (!url?.toLocaleLowerCase().endsWith('.yaml')) {
			message.answer(COMMANDS.LOAD.NO_YAML);
			return;
		}
		const status = [];
		if (reset) {
			try {
				await client.sql`
					delete from tags
					where True
				`;
				status.push(COMMANDS.LOAD.RESET);
			} catch (err) {
				status.push(COMMANDS.LOAD.RESET_FAIL);
			}
			await this.update(message, status);
		}
		try {
			const text = await fetch(url).then(r => r.text());
			const data: TagData[] = safeLoad(text) as any;
			let ok = 0;
			let fail = 0;
			for (const raw of data) {
				try {
					const tag = {
						...raw,
						aliases: raw.aliases.join(','),
						hoisted: raw.hoisted || false,
						author: raw.user
					};
					await client.sql`
						insert into tags ${client.sql(tag, 'name', 'content', 'aliases', 'author', 'templated', 'hoisted', 'createdAt', 'updatedAt')}
					`;
					ok++;
				} catch {
					fail++;
				}
			}
			status.push(COMMANDS.LOAD.FINISHED);
			await this.update(message, status);

			if (!ok && !fail) {
				status.push('', COMMANDS.LOAD.NO_TAGS);
				return this.update(message, status);
			}
			status.push('', COMMANDS.LOAD.REPORT(ok, fail));
			await this.update(message, status);
		} catch (err) {
			client.logger.error('TAG_LOAD', err);
			status.push(COMMANDS.LOAD.FAIL);
			await this.update(message, status);
		}
	}

	private update(message: Message, states: string[]): Promise<Message> {
		return message.answer(states.join('\n'));
	}
}
