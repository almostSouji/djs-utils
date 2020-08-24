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
	author: {login: string};
	url: string;
	state: string;
	authorAssociation: string;
	createdAt: string;
}

const ALIASES: Record<string, string> = {
	g: 'discord.js',
	c: 'collection',
	dapi: 'discord-api-docs'

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
		OPEN: 'https://cdn.discordapp.com/emojis/475626078384160768.png',
		CLOSED: 'https://cdn.discordapp.com/emojis/618558804107329569.png',
		MERGED: 'https://cdn.discordapp.com/emojis/477529099347165235.png',
		DRAFT: 'https://cdn.discordapp.com/emojis/747149855381520425.png'
	},
	ISSUE: {
		OPEN: 'https://cdn.discordapp.com/emojis/475626077897621537.png',
		CLOSED: 'https://cdn.discordapp.com/emojis/475626078296211456.png'
	}
};

const LABEL_COLORS: Record<string, string> = {
	'159818': '<:159818:747336812154060811>',
	'006b75': '<:006b75:747336776556871725>',
	'31e097': '<:31e097:747336784626581554>',
	'84b6eb': '<:84b6eb:747336791308238938>',
	'7289DA': '<:7289DA:747336800661536768>',
	'af310e': '<:af310e:747336823335944193>',
	'b60205': '<:b60205:747336832748093500>',
	'c5def5': '<:c5def5:747336844211126352>',
	'cc317c': '<:cc317c:747336853891448862>',
	'd11f1f': '<:d11f1f:747336863060066385>',
	'd93f0b': '<:d93f0b:747336873705472144>',
	'eebcff': '<:eebcff:747336882521767946>',
	'ef6556': '<:ef6556:747336891891843072>',
	'f8f8f8': '<:f8f8f8:747336919138172998>',
	'fc9d2f': '<:fc9d2f:747336931276488815>',
	'ff8800': '<:ff8800:747336941250281563>',
	'ffb766': '<:ffb766:747336953170755635>',
	'ffc9c9': '<:ffc9c9:747336964143054919>',
	'ffe900': '<:ffe900:747336974331019265>',
	'fff0db': '<:fff0db:747336984175050812>',
	'0e8a16': '<:0e8a16:747352912077914133>',
	'128A0C': '<:128A0C:747352932650975232>',
	'5319e7': '<:5319e7:747352942335492176>',
	'061282': '<:061282:747352951802298448>',
	'bfdadc': '<:bfdadc:747352959528206416>',
	'cccccc': '<:cccccc:747352967140737037>',
	'd4c5f9': '<:d4c5f9:747352975491465326>',
	'e6e6e6': '<:e6e6e6:747352984366743612>',
	'e99695': '<:e99695:747352992658882632>',
	'ee0701': '<:ee0701:747353006617395211>',
	'fbca04': '<:fbca04:747353015891263598>',
	'ffffff': '<:ffffff:747353024145653762>',
	'def': '<:def:747337447834386493>'
};

const REVIEW_STATES: Record<string, Record<string, string>> = {
	MEMBER: {
		APPROVED: '<:check:747365034069327922>',
		PENDING: '<:review:747431363774251098>',
		COMMENTED: '<:eye:747384374168780841>',
		CHANGES_REQUESTED: '<:diff:747362834572116018>'
	},
	GUEST: {
		APPROVED: '<:check_grey:747425995048484925>',
		PENDING: '<:review_grey:747431373383401594>',
		COMMENTED: '<:eye:747384374168780841>',
		CHANGES_REQUESTED: '<:diff_grey:747425985598717984>'
	}
};

const TICK_STATES = {
	TICK: '<:tick:747502128003809332>',
	NO_TICK: '<:notick:747502148815814881>'
};
export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('pr-issue', handler, {
			aliases: ['pr', 'issue'],
			description: {
				content: 'Retrieve information about the provided issue or pull request. Supported repositories are every repository owned by discord.js and the discord-api-docs respository. Aliases: "g" - "discord.js", "c" - "collection", "dapi" - "discord-api-docs" ',
				usage: 'repository#issue',
				flags: {
					'`-v`, `--verbose`': 'display more information'
				}
			},
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
		});
	}

	public async execute(message: Message, args?: Lexure.Args): Promise<Message|void> {
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
				console.log('no such thing', body);
				return;
			}
			const d = body.data.repository.issueOrPullRequest;
			console.log(d); // <- DEBUG

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
			const unique = this.uniqueReviews(d.reviews.nodes, d.author.login);
			if (unique.length) {
				let reviewString = '';
				for (const review of unique) {
					if (useEmoji) {
						const icon = this.state(review.state, review.authorAssociation);
						reviewString += `${icon} `;
					}
					reviewString += `[${review.author.login}](${review.url})`;
					if (!useEmoji) {
						reviewString += ` ${review.state.toLowerCase().replace(/_/g, ' ')}`;
						if (['MEMBER', 'OWNER', 'COLLABORATOR'].includes(review.authorAssociation)) {
							reviewString += ' 📌';
						}
					}
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
				embed.addField('Labels', d.labels.nodes.map((l: {name: string; color: string; url: string}) => `${useEmoji ? `${this.label(l.color)} ` : ''}[${l.name}](${l.url})`).join(' '));
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
			if (message.channel instanceof DMChannel || !message.channel.permissionsFor(message.guild!.me!)!.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
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
			console.log('oops...', e); // <-- DEBUG:
		}
	}

	private label(color: string): string {
		return LABEL_COLORS[color] ?? LABEL_COLORS.def;
	}

	private state(state: string, assoc: string): string {
		const reviewer = ['MEMBER', 'OWNER', 'COLLABORATOR'].includes(assoc) ? 'MEMBER' : 'GUEST';
		return REVIEW_STATES[reviewer][state];
	}

	private formatBody(body: string, useEmoji: boolean): string {
		const commentRegex = /<!--[\s\S]*?-->/gi;
		const boxRegex = /- \[x\]/gi;
		const emptyBoxRegex = /- \[ \]/gi;
		const multiLinebreakRegex = /\n(?:\s*\n)+/gmi;
		console.log(body);
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

	private uniqueReviews(reviews: Review[], author: string): Review[] {
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
