import { Message } from 'discord.js';
import { MESSAGES, GITHUB } from '../../util/constants';
const { COMMANDS } = MESSAGES;
import { GitHubAPIResult, GitHubReviewDecision, GitHubReviewState, isPR } from '../../interfaces/GitHub';
import { Embed } from '../../util/Embed';
import fetch from 'node-fetch';

enum ResultStatePR {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	MERGED = 'MERGED',
	DRAFT = 'DRAFT',
}

enum ResultStateIssue {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
}

enum InstallableState {
	OPEN = 'OPEN',
	DRAFT = 'DRAFT',
}

const Timestamps = {
	OPEN: 'publishedAt',
	CLOSED: 'closedAt',
	MERGED: 'mergedAt',
	DRAFT: 'publishedAt'
} as const;

type TimestampsWithoutMerged = Omit<typeof Timestamps, 'MERGED'>;

type TimestampsWithoutMergedKey = TimestampsWithoutMerged[keyof TimestampsWithoutMerged];

function buildQuery(owner: string, repository: string, issueID: number) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				name
				issueOrPullRequest(number: ${issueID}) {
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
						closedAt
						comments {
							totalCount
						}
						reviewDecision
						latestOpinionatedReviews(last: 99) {
							nodes {
								author {
									login
								}
								state
								url
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
						comments {
							totalCount
						}
					}
				}
			}
		}`;
}

export async function issuePR(
	owner: string,
	repository: string,
	num: number,
	isPrefixed: boolean,
	message: Message
) {
	try {
		const query = buildQuery(owner, repository, num);
		const res: GitHubAPIResult = await fetch(GITHUB.GITHUB_BASE_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN!}`
			},
			body: JSON.stringify({ query })
		}).then(res => res.json());

		if (!res.data) {
			message.answer(COMMANDS.GITHUB.ERRORS.FETCH);
			return;
		}

		if (res.errors?.some(e => e.type === 'NOT_FOUND')) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ISSUE_PR.ERRORS.NOT_FOUND(num, owner, repository));
			return;
		}

		const issue = res.data.repository?.issueOrPullRequest;

		if (!issue) {
			if (!isPrefixed) return;

			message.answer(COMMANDS.GITHUB.ERRORS.NO_RESULT);
			return;
		}

		const resultState = isPR(issue)
			? issue.merged
				? ResultStatePR.MERGED
				: issue.isDraft
					? ResultStatePR.DRAFT
					: issue.closed
						? ResultStatePR.CLOSED
						: ResultStatePR.OPEN
			: issue.closed
				? ResultStateIssue.CLOSED
				: ResultStateIssue.OPEN;

		// footer icon
		const icon_url = isPR(issue)
			? resultState === ResultStatePR['OPEN']
				? GITHUB.GITHUB_ICON_PR_OPEN
				: resultState === ResultStatePR['CLOSED']
					? GITHUB.GITHUB_ICON_PR_CLOSED
					: resultState === ResultStatePR['MERGED']
						? GITHUB.GITHUB_ICON_PR_MERGED
						: GITHUB.GITHUB_ICON_PR_DRAFT
			: resultState === ResultStateIssue['OPEN']
				? GITHUB.GITHUB_ICON_ISSUE_OPEN
				: GITHUB.GITHUB_ICON_ISSUE_CLOSED;

		// footer text
		const comments = issue.comments.totalCount
			? `(${COMMANDS.GITHUB.ISSUE_PR.COMMENTS(issue.comments.totalCount)})`
			: '';

		const isMerge = isPR(issue) && resultState === 'MERGED';
		const user = isPR(issue) && resultState === 'MERGED' ? issue.mergedBy?.login : undefined;
		const commit = isPR(issue) && resultState === 'MERGED' ? issue.mergeCommit?.abbreviatedOid : undefined;

		const action = isMerge
			? user && commit
				? COMMANDS.GITHUB.ISSUE_PR.ACTION.MERGED_BY_IN(user, commit)
				: user
					? COMMANDS.GITHUB.ISSUE_PR.ACTION.MERGED_BY(user)
					: commit
						? COMMANDS.GITHUB.ISSUE_PR.ACTION.MERGED_IN(commit)
						: COMMANDS.GITHUB.ISSUE_PR.ACTION.MERGE
			: resultState === 'CLOSED'
				? COMMANDS.GITHUB.ISSUE_PR.ACTION.CLOSE
				: resultState === 'DRAFT'
					? COMMANDS.GITHUB.ISSUE_PR.ACTION.DRAFT
					: COMMANDS.GITHUB.ISSUE_PR.ACTION.OPEN;

		const footerText = `${comments} ${action}`;

		// timestamp
		const timestampProperty = Timestamps[resultState];

		// color
		const color = isPR(issue)
			? resultState === ResultStatePR['OPEN']
				? GITHUB.GITHUB_COLOR_OPEN
				: resultState === ResultStatePR['CLOSED']
					? GITHUB.GITHUB_COLOR_CLOSED
					: resultState === ResultStatePR['MERGED']
						? GITHUB.GITHUB_COLOR_MERGED
						: GITHUB.GITHUB_COLOR_DRAFT
			: resultState === ResultStateIssue['OPEN']
				? GITHUB.GITHUB_COLOR_OPEN
				: GITHUB.GITHUB_COLOR_CLOSED;

		const timestamp = isPR(issue) ? new Date(issue[timestampProperty]!) : new Date(issue[timestampProperty as TimestampsWithoutMergedKey]!);

		const embed = new Embed()
			.setAuthor(issue.author.login, `${issue.author.avatarUrl}?anticache=${Date.now()}`, issue.author.url)
			.setTitle(`#${issue.number} ${issue.title}`)
			.setURL(issue.url)
			.setFooter(footerText, icon_url)
			.setColor(color)
			.setTimestamp(timestamp);

		// install with
		const installable = Reflect.has(InstallableState, resultState);

		if (isPR(issue) && installable) {
			embed.addField(COMMANDS.GITHUB.ISSUE_PR.HEADING.INSTALL, `\`npm i ${issue.headRepository.nameWithOwner}#${issue.headRef?.name ?? COMMANDS.GITHUB.UNKNOWN
			}\``);
		}

		// reviews
		const reviews = isPR(issue) ? issue.latestOpinionatedReviews?.nodes ?? [] : [];
		const reviewBody = reviews
			.map(r => {
				const decision = isPR(issue)
					? r.state === GitHubReviewState['CHANGES_REQUESTED']
						? COMMANDS.GITHUB.ISSUE_PR.REVIEW_STATE.CHANGES_REQUESTED
						: r.state === GitHubReviewState['APPROVED']
							? COMMANDS.GITHUB.ISSUE_PR.REVIEW_STATE.APPROVED
							: r.state === GitHubReviewState['COMMENTED']
								? COMMANDS.GITHUB.ISSUE_PR.REVIEW_STATE.COMMENTED
								: r.state === GitHubReviewState['DISMISSED']
									? COMMANDS.GITHUB.ISSUE_PR.REVIEW_STATE.DISMISSED
									: COMMANDS.GITHUB.ISSUE_PR.REVIEW_STATE.PENDING
					: '';
				return `${r.author.login} [${decision}](${r.url})`;
			})
			.join(', ');

		const reviewTitle = isPR(issue)
			? issue.reviewDecision === GitHubReviewDecision['CHANGES_REQUESTED']
				? COMMANDS.GITHUB.ISSUE_PR.HEADING.REVIEWS.CHANGES_REQUESTED
				: issue.reviewDecision === GitHubReviewDecision['APPROVED']
					? COMMANDS.GITHUB.ISSUE_PR.HEADING.REVIEWS.APPROVED
					: COMMANDS.GITHUB.ISSUE_PR.HEADING.REVIEWS.REVIEW_REQUIRED
			: '';

		if (reviews.length) {
			embed.addField(reviewTitle, reviewBody);
		}

		await message.answer('', embed.shorten());
	} catch (error) {
		if (!isPrefixed) return;
		message.answer(COMMANDS.GITHUB.ERRORS.FETCH);
	}
}

