import { Message } from 'discord.js';
import { MESSAGES, GITHUB } from '../../util/constants';
import { GitHubAPIResult } from '../../interfaces/GitHub';
import { Embed } from '../../util/Embed';
const { COMMANDS } = MESSAGES;
import fetch from 'node-fetch';

function buildQuery(owner: string, repository: string, expression: string) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				object(expression: "${expression}") {
					... on Commit {
						messageHeadline
						abbreviatedOid
						changedFiles
						commitUrl
						pushedDate
						author {
							avatarUrl
							name
							user {
								login
								avatarUrl
								url
							}
						}
					}
				}
			}
		}`;
}


export async function commit(
	owner: string,
	repository: string,
	expressions: string,
	isPrefixed: boolean,
	message: Message
) {
	console.log('commit');
	try {
		const query = buildQuery(owner, repository, expressions);
		const res: GitHubAPIResult = await fetch(GITHUB.BASE, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_API_KEY!}`
			},
			body: JSON.stringify({ query })
		}).then(res => res.json());

		if (!res.data) {
			message.answer(COMMANDS.GITHUB.ERRORS.FETCH);
			return;
		}

		if (res.errors?.some(e => e.type === 'NOT_FOUND')) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.COMMIT.ERRORS.NOT_FOUND(expressions, owner, repository));
			return;
		}

		const commit = res.data.repository?.object;

		if (!commit) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ERRORS.NO_RESULT);
			return;
		}

		const title = commit.messageHeadline
			? `\`${commit.abbreviatedOid}\` ${commit.messageHeadline}`
			: commit.abbreviatedOid;

		const embed = new Embed()
			.setAuthor(commit.author.user?.login ?? commit.author.name, commit.author.user?.avatarUrl ?? commit.author.avatarUrl, commit.author.user?.url ?? undefined)
			.setColor(GITHUB.GITHUB_COLOR_COMMIT)
			.setTitle(title)
			.setFooter(COMMANDS.GITHUB.COMMIT.FILES(commit.changedFiles), GITHUB.GITHUB_ICON_COMMIT)
			.setTimestamp(commit.pushedDate ? new Date(commit.pushedDate) : undefined);

		if (commit.commitUrl) {
			embed.setURL(commit.commitUrl);
		}

		await message.answer('', embed);
	} catch (error) {
		if (!isPrefixed) return;

		message.answer(COMMANDS.GITHUB.ERRORS.FETCH);
	}
}
