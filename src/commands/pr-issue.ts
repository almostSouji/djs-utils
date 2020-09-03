import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message, DMChannel } from 'discord.js';
import fetch from 'node-fetch';
import { GITHUB } from '../util/constants';
import { Embed } from '../util/Embed';
import * as Lexure from 'lexure';

const { GITHUB_API_KEY } = process.env;
const { EMOJI, REACTION_TIMEOUT } = GITHUB;

interface Review {
	author: { login: string };
	url: string;
	state: string;
	authorAssociation: string;
	createdAt: string;
}

const ALIASES: Record<string, string> = {
	g: 'discord.js',
	c: 'collection',
	dapi: 'discord-api-docs',
	next: 'discord.js-next'
};

const STATE_COLORS: Record<string, string> = {
	OPEN: '#49A94D',
	CLOSED: '#BB3031',
	MERGED: '#6249A0',
	DRAFT: '#C5C5C5'
};

const TIMESTAMPS: Record<string, string> = {
	OPEN: 'publishedAt',
	CLOSED: 'closedAt',
	MERGED: 'mergedAt',
	DRAFT: 'publishedAt'
};

const ICONS: Record<string, Record<string, string>> = {
	PR: {
		OPEN: 'https://cdn.discordapp.com/emojis/751210109333405727.png',
		CLOSED: 'https://cdn.discordapp.com/emojis/751210080459817092.png',
		MERGED: 'https://cdn.discordapp.com/emojis/751210169609748481.png?v=1',
		DRAFT: 'https://cdn.discordapp.com/emojis/751210097463525377.png'
	},
	ISSUE: {
		OPEN: 'https://cdn.discordapp.com/emojis/751210140086042686.png?v=1',
		CLOSED: 'https://cdn.discordapp.com/emojis/751210129977901100.png'
	}
};

const LABEL_COLORS: Record<string, string> = {
	'1d637f': '<:1d637f:751210249721217155>',
	'4b1f8e': '<:4b1f8e:751210257811767297>',
	'7ef7ef': '<:7ef7ef:751210266217414768>',
	'027b69': '<:027b69:751210290846367825>',
	'0075ca': '<:0075ca:751210299394359316>',
	'276bd1': '<:276bd1:751210308500062310>',
	'7057ff': '<:7057ff:751210318385905724>',
	'aed5fc': '<:aed5fc:751210330020905003>',
	'b6b1f9': '<:b6b1f9:751210340577968199>',
	'c10f47': '<:c10f47:751210349918683249>',
	'c66037': '<:c66037:751210359477764126>',
	'cfd3d7': '<:cfd3d7:751210367430033489>',
	'd73a4a': '<:d73a4a:751210378981015565>',
	'd876e3': '<:d876e3:751210389143814274>',
	'e4e669': '<:e4e669:751210418999001128>',
	'e4f486': '<:e4f486:751210427777679362>',
	'e8be8b': '<:e8be8b:751210441707094036>',
	'ea8785': '<:ea8785:751210466033795274>',
	'f06dff': '<:f06dff:751210476523749487>',
	'fbca04': '<:fbca04:751210487508762675>',
	'fc1423': '<:fc1423:751210498950955048>',
	'fcf95a': '<:fcf95a:751210515203620928>',
	'ffccd7': '<:ffccd7:751210528021544991>',
	'ffffff': '<:ffffff:751210537597272076>',
	'default': '<:default:751211609430425611>'
};

const BADGES = {
	DJS: '<:DiscordJS:751202824804630539>'
};

const TICK_STATES = {
	TICK: '<:tick:747502128003809332>',
	NO_TICK: '<:notick:751200038323093521>'
};
export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('pr-issue', handler, {
			aliases: ['pr', 'issue'],
			description: {
				content: 'Retrieve information about the provided issue or pull request. Supports every repository owned by discord.js and the discord-api-docs repository.',
				usage: '<repository>#<issue> [--verbose]',
				flags: {
					'`-v`, `--verbose`': 'display more information'
				}
			},
			clientPermissions: ['EMBED_LINKS']
		});
	}

	public async execute(message: Message, args?: Lexure.Args): Promise<Message | void> {
		const rest = args ? Lexure.joinTokens(args.many()) : message.content;
		const useEmoji = message.channel instanceof DMChannel ? true : (message.channel.permissionsFor(message.client.user!)?.has('USE_EXTERNAL_EMOJIS') ?? false);
		const regex = /(?<repo>\S+)#(?<num>\d+) ?(?<verbose>(--verbose|-verbose|--v|-v))?/i;
		const groups = regex.exec(rest)?.groups;

		if (!groups) {
			return;
		}

		const verbose = args ? args.flag('v', 'verbose') : Boolean(groups.verbose);
		let repo = groups.repo.toLowerCase();
		const num = groups.num;
		const alias = ALIASES[repo];
		if (alias) {
			repo = alias;
		}
		const owner = repo === 'discord-api-docs' ? 'discord' : 'discordjs';

		if (!GITHUB.SOURCES.includes(repo.toLowerCase())) {
			return;
		}

		const query = `
			{
				repository(owner: "${owner}", name: "${repo}") {
					name
					issueOrPullRequest(number: ${num}) {
						... on PullRequest {
							commits(last: 1) {
								nodes {
									commit {
										abbreviatedOid
									}
								}
							}
							author {
								avatarUrl
								login
								url
							}
							body
							merged
							mergeCommit {
								abbreviatedOid
							}
							headRef {
								name
							}
							headRepository {
								nameWithOwner
							}
							mergedAt
							mergedBy {
								login
							}
							isDraft
							number
							publishedAt
							title
							url
							closed
							labels(first: 10) {
								nodes {
									name
									color
									url
								}
							}
							comments {
								totalCount
							}
							reviewDecision
							reviews(first: 99) {
								nodes {
									author {
										login
									},
									state
									url
									authorAssociation
									createdAt
								}
							}
						}
						... on Issue {
							author {
								avatarUrl
								login
								url
							}
							body
							number
							publishedAt
							title
							url
							closed
							closedAt
							labels(first: 10) {
								nodes {
									name
									color
									url
								}
							}
							comments {
								totalCount
							}
						}
					}
				}
			}`;
		try {
			const res = await fetch(`${GITHUB.BASE}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${GITHUB_API_KEY}` },
				body: JSON.stringify({ query })
			});
			const body = await res.json();
			if (!body?.data?.repository?.issueOrPullRequest) {
				return;
			}
			const d = body.data.repository.issueOrPullRequest;
			const embed = new Embed();

			// header
			embed.setAuthor(d.author.login, `${d.author.avatarUrl}?anticache=${Date.now()}`, d.author.url);
			embed.setTitle(`#${d.number} ${d.title}`);
			embed.setURL(d.url);

			// determine types
			const resultType = d.commits ? 'PR' : 'ISSUE';
			const resultState = d.merged ? 'MERGED' : d.isDraft ? 'DRAFT' : d.closed ? 'CLOSED' : 'OPEN';

			// color
			embed.setColor(STATE_COLORS[resultState]);

			// timestamp
			const timestampProperty = TIMESTAMPS[resultState];
			embed.setTimestamp(d[timestampProperty]);

			// install with
			if (resultType === 'PR' && !['MERGED', 'CLOSED'].includes(resultState) && verbose) {
				embed.addField('Install with', `\`npm i ${d.headRepository?.nameWithOwner}#${d.headRef?.name}\``);
			}

			// reviews
			const unique = this.uniqueReviews(d.author.login, d.reviews?.nodes);
			if (unique.length) {
				let reviewString = '';
				for (const review of unique) {
					if (owner === 'discordjs' && ['MEMBER', 'OWNER', 'COLLABORATOR'].includes(review.authorAssociation)) {
						reviewString += useEmoji ? `${BADGES.DJS} ` : '(Discord.js) ';
					}
					reviewString += `[${review.author.login}](${review.url})`;
					reviewString += ` ${review.state.toLowerCase().replace(/_/g, ' ')}`;
					reviewString += `\n`;
				}
				let reviewHeading = 'Reviews';
				if (d.reviewDecision) {
					reviewHeading += ` (state: ${d.reviewDecision.toLowerCase().replace(/_/g, ' ')})`;
				}
				embed.addField(reviewHeading, reviewString);
			}

			// labels
			if (d.labels?.nodes?.length) {
				if (useEmoji) {
					embed.addField('Labels', d.labels.nodes.map((l: { name: string; color: string; url: string }) => `${this.label(l.color)}[${l.name}](${l.url})`).join(' '));
				} else {
					embed.addField('Labels', d.labels.nodes.map((l: { name: string; color: string; url: string }) => `[${l.name}](${l.url})`).join(', '));
				}
			}

			// icon
			const icon = resultType === `PR` ? ICONS.PR[resultState] : ICONS.ISSUE[resultState];

			// footer
			let footerString = '';
			if (d.comments.totalCount) {
				footerString += `(${d.comments.totalCount} comments)`;
			}
			if (resultState === 'MERGED') {
				footerString += ` merged`;
				if (d.mergedBy?.login) {
					footerString += ` by ${d.mergedBy.login}`;
				}
				if (d.mergeCommit?.abbreviatedOid) {
					footerString += ` in ${d.mergeCommit.abbreviatedOid}`;
				}
			} else if (resultState === 'DRAFT') {
				footerString += ' draft opened';
			} else if (resultState === 'CLOSED') {
				footerString += ' closed';
			} else if (resultState === 'OPEN') {
				footerString += ' opened';
			}

			embed.setFooter(footerString, icon);

			// description
			if (verbose) {
				embed.setDescription(this.formatBody(d.body, useEmoji));
			}

			// resolve image
			if (verbose) {
				const imageRegex = /!\[(?<alt>.*)\]\((?<url>.*?(\.png|\.gif|\.jpg))\)/i;
				const groups = imageRegex.exec(d.body)?.groups;
				if (groups) {
					const url = groups.url;
					embed.setImage(url);
				}
			}

			// delete reaction handling
			if (message.channel instanceof DMChannel || !message.channel.permissionsFor(message.guild!.me!)!.has(['ADD_REACTIONS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'], false)) {
				return message.answer('', embed.shorten());
			}
			const msg = await message.answer('', embed.shorten());
			msg.react(EMOJI.DELETE);
			let react;
			try {
				react = await msg.awaitReactions(
					(reaction, user): boolean => reaction.emoji.name === EMOJI.DELETE && user.id === message.author.id,
					{ max: 1, time: REACTION_TIMEOUT, errors: ['time'] }
				);
			} catch {
				await msg.reactions.removeAll();
				return;
			}
			react.first()!.message.delete();
			return;
		} catch (e) {
			this.handler.client.logger.error(`[${this.id}]`, e);
		}
	}

	private label(color: string): string {
		return LABEL_COLORS[color] ?? LABEL_COLORS.default;
	}

	private formatBody(body: string, useEmoji: boolean): string {
		const commentRegex = /<!--[\s\S]*?-->/gi;
		const boxRegex = /- \[x\]/gi;
		const emptyBoxRegex = /- \[ \]/gi;
		const multiLinebreakRegex = /\n(?:\s*\n)+/gmi;

		let formatted = body
			.replace(commentRegex, '')
			.replace(multiLinebreakRegex, '\n\n');
		if (useEmoji) {
			formatted = formatted
				.replace(boxRegex, TICK_STATES.TICK)
				.replace(emptyBoxRegex, TICK_STATES.NO_TICK);
		}
		return formatted;
	}

	private uniqueReviews(author: string, reviews?: Review[]): Review[] {
		if (!reviews) return [];
		const uniqueReviews: Record<string, Review[]> = {};
		for (const review of reviews) {
			if (review.author.login === author) {
				continue;
			}
			const entry = uniqueReviews[review.author.login];
			entry ? entry.push(review) : uniqueReviews[review.author.login] = [review];
		}
		return Object.values(uniqueReviews).map((v: Review[]): Review => v.sort((a: Review, b: Review) => {
			if (a.state === 'COMMENTED') {
				return -1;
			}
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		})[0]);
	}
}
