import { Args } from 'lexure';
import { Message } from 'discord.js';
import { Command, ExecutionContext } from '../structures/Command';
import { alias } from './sub/alias';
import { issuePR } from './sub/issue-pr';
import { commit } from './sub/commit';
import { MESSAGES } from '../util/constants';
import CommandHandler from '../handlers/CommandHandler';
const { COMMANDS } = MESSAGES;

interface RepositoryEntry {
	owner: string;
	repository: string;
}

export default class GitHub extends Command {
	public readonly regExp = /(?:([A-Za-z0-9_.-]+)\/)?([A-Za-z0-9_.-]+)#([A-Za-z0-9_.-]+)/;
	public readonly aliases = ['gh'];

	public constructor(handler: CommandHandler) {
		super('github', handler, {
			aliases: ['github', 'gh'],
			description: {
				content: 'Retrieves information about provided pull request, issue or commit',
				usage: '<owner> <repository> <commit>|<alias> <commit>|alias <add|remove> <...alias>|alias list',
				flags: {}
			},
			clientPermissions: ['EMBED_LINKS']
		});
	}

	public async execute(message: Message, args: Args, _: string, executionContext: ExecutionContext) {
		const isPrefixed = executionContext === ExecutionContext['PREFIXED'];

		if (!message.guild) return;

		const githubToken = process.env.GITHUB_API_KEY;

		if (!githubToken) {
			if (!isPrefixed) return;
			return;
		}

		console.log(isPrefixed);

		const first = args.single();

		if (first === 'alias' && isPrefixed) {
			return alias(message, args, this.handler.client.sql);
		}

		const second = args.single();
		const third = args.single();

		console.log('123:', first, second, third);

		if (!first) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ERRORS.ARGS_MISSING);
			return;
		}

		const repositoryAliases = await this.fetchAliases(message.guild.id);
		const aliasEntry = repositoryAliases.get(first);

		const owner = third ? first : aliasEntry?.owner;
		const repository = third ? second : aliasEntry?.repository;
		const issueOrExpression = third ? third : second;

		console.log('alias', aliasEntry);
		console.log('aliases', repositoryAliases);
		console.log('ori', owner, repository, issueOrExpression);

		if (!owner || !repository || !issueOrExpression) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ERRORS.ARGS_MISSING);
			return;
		}

		if (!GitHub.validateGitHubName(owner)) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ERRORS.INVALID_OWNER);
			return;
		}

		if (!GitHub.validateGitHubName(repository)) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ERRORS.INVALID_REPOSITORY);
			return;
		}

		const parsed = Number(issueOrExpression);
		if (isNaN(parsed)) {
			return commit(owner, repository, issueOrExpression, isPrefixed, message);
		}

		return issuePR(owner, repository, parsed, isPrefixed, message);
	}

	private static validateGitHubName(name: string): boolean {
		const reg = /[A-Za-z0-9_.-]+/;
		const match = reg.exec(name);
		return name.length === match?.[0].length;
	}

	private async fetchAliases(guild: string): Promise<Map<string, RepositoryEntry>> {
		const [result] = await this.handler.client.sql<{ aliases: string[] }>`
			select aliases
			from repository_aliases
			where guild = ${guild}
		`;

		console.log('res', result);
		const mapping: Map<string, RepositoryEntry> = new Map();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!result?.aliases?.length) {
			return mapping;
		}

		for (const r of result.aliases) {
			const [alias, rest] = r.split(':');
			const [owner, repository] = rest.split('/');
			console.log('aror', alias, rest, owner, repository);
			mapping.set(alias, { owner, repository });
		}

		return mapping;
	}
}
