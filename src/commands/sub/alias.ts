import { Message, DMChannel } from 'discord.js';
import { MESSAGES, MESSAGE_CONTENT_LIMIT } from '../../util/constants';
import { Sql } from 'postgres';
const { COMMANDS } = MESSAGES;
import { Args } from 'lexure';
import { ellipsis, uniqueValidatedValues } from '../../util';

const validSubCommands = ['`add`', '`remove`', '`list`'];
const regExp = /([A-Za-z0-9_.-]+):(?:https:\/\/github\.com\/|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;

async function add(message: Message, current: string[], cleaned: string[], sql: Sql<any>) {
	console.log('alias');
	if (!cleaned.length) {
		message.answer(COMMANDS.GITHUB.ALIAS.ADD.NO_ARGS);
		return;
	}

	const updated = uniqueValidatedValues([...current, ...cleaned]);

	if (updated.length === current.length) {
		message.answer(COMMANDS.GITHUB.ALIAS.ADD.NO_ADD);
		return;
	}

	await sql`
		insert into repository_aliases(guild, aliases)
		values(${message.guild!.id}, ${sql.array(updated)})
		on conflict (guild)
		do update set aliases = ${sql.array(updated)};`;

	const added = cleaned.filter(elem => !current.includes(elem));
	const content = `${COMMANDS.GITHUB.ALIAS.ADD.TITLE}\n${added
		.map(r => `• \`${r}\``)
		.join('\n')}`;

	message.answer(ellipsis(content, MESSAGE_CONTENT_LIMIT));
}

async function remove(
	message: Message,
	current: string[],
	cleaned: string[],
	sql: Sql<any>
) {
	if (!cleaned.length) {
		message.answer(COMMANDS.GITHUB.ALIAS.REMOVE.NO_ARGS);
		return;
	}

	if (!current.length) {
		message.answer(COMMANDS.GITHUB.ALIAS.REMOVE.NO_CURRENT);
		return;
	}

	const updated = uniqueValidatedValues(current.filter(elem => !cleaned.includes(elem)));

	if (updated.length === current.length) {
		message.answer(COMMANDS.GITHUB.ALIAS.REMOVE.NO_REMOVE);
		return;
	}

	await sql`
		update repository_aliases
		set aliases = ${sql.array(updated)}
		where guild = ${message.guild!.id};`;

	const removed = current.filter(elem => !updated.includes(elem));
	const content = `${COMMANDS.GITHUB.ALIAS.REMOVE.TITLE}\n${removed
		.map(r => `\`${r}\``)
		.join(', ')}`;

	message.answer(ellipsis(content, MESSAGE_CONTENT_LIMIT));
}

function list(message: Message, current: string[]) {
	if (!current.length) {
		message.answer(COMMANDS.GITHUB.ALIAS.LIST.NO_CURRENT);
		return;
	}

	const content = `${COMMANDS.GITHUB.ALIAS.LIST.TITLE}\n${current
		.map(r => `• \`${r}\``)
		.join('\n')}`;

	message.answer(ellipsis(content, MESSAGE_CONTENT_LIMIT));
}

async function fetchAliases(guild: string, sql: Sql<any>): Promise<string[]> {
	const [result] = await sql<{ aliases: string[] }>`
				select aliases
				from repository_aliases
				where guild = ${guild};`;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!result?.aliases?.length) {
		return [];
	}

	return result.aliases;
}

function resolveAlias(input: string): string | undefined {
	const regex = new RegExp(regExp);
	const match = regex.exec(input.trim());

	if (!match) {
		return undefined;
	}

	const [, alias, repository] = match;
	return `${alias.toLowerCase()}:${repository.toLowerCase()}`;
}

function cleanAliasCandidates(inputs: string[], predicate: (current: string) => boolean | undefined): string[] {
	return inputs.map(i => resolveAlias(i)).filter(e => e && predicate(e)) as string[];
}

function checkEditPermissions(message: Message, args: Args): boolean {
	if (args.flag('force', 'f') && message.client.commands.isOwner(message.author)) return true;
	if (message.channel instanceof DMChannel) return false;
	return message.channel.permissionsFor(message.author)?.any(['MANAGE_GUILD', 'ADMINISTRATOR']) ?? false;
}

export async function alias(message: Message, args: Args, sql: Sql<any>) {
	if (!message.guild) {
		message.answer(COMMANDS.GITHUB.ALIAS.ERRORS.NO_GUILD);
		return;
	}

	const current = await fetchAliases(message.guild.id, sql);

	const sub = args.single();
	const candidates = args.many().map(token => token.value);

	if (!sub) {
		message.answer(COMMANDS.GITHUB.ALIAS.ERRORS.NO_SUB(validSubCommands.join(', ')));
		return;
	}

	switch (sub) {
		case 'add': {
			if (!checkEditPermissions(message, args)) {
				message.answer(COMMANDS.GITHUB.ALIAS.ERRORS.PERMISSIONS);
				return;
			}

			const predicate = (s: string) => !current.some(c => {
				const [alias] = c.split(':');
				return alias === s;
			});
			const cleaned = cleanAliasCandidates(candidates, predicate);
			return add(message, current, cleaned, sql);
		}

		case 'remove':
		case 'delete': {
			if (!checkEditPermissions(message, args)) {
				message.answer(COMMANDS.GITHUB.ALIAS.ERRORS.PERMISSIONS);
				return;
			}

			const cleaned = cleanAliasCandidates(candidates, () => true);
			return remove(message, current, cleaned, sql);
		}

		case 'list': {
			return list(message, current);
		}

		case 'default': {
			message.answer(COMMANDS.GITHUB.ALIAS.ERRORS.INVALID_SUB(sub, validSubCommands.join(', ')));
		}
	}
}

