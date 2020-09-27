export const EMBED_LIMITS = {
	TITLE: 256,
	DESCRIPTION: 2048,
	FOOTER: 2048,
	AUTHOR: 256,
	FIELDS: 25,
	FIELD_NAME: 256,
	FIELD_VALUE: 1024
};

export const MESSAGE_CONTENT_LIMIT = 2000;
export const CONFIRMATION_TIMEOUT = 30000;

export const CHANNELS_PATTERN = /<?#?(\d{17,19})>?/g;
export const ROLES_PATTERN = /<?@?&?(\d{17,19})>?/g;
export const USERS_PATTERN = /<?@?!?(\d{17,19})>?/g;
export const SNOWFLAKE_PATTERN = /\d{17, 19}/g;

export const TAG = {
	TRUNCATE_THRESHOLD: 30
};

export const LOAD = {
	WAIT_DURATION: 3000
};

export const GITHUB = {
	BASE: 'https://api.github.com/graphql',
	EMOJI: {
		DELETE: '🗑'
	},
	REACTION_TIMEOUT: 5000,
	GITHUB_BASE_URL: 'https://api.github.com/graphql',
	GITHUB_ICON_PR_OPEN: 'https://cdn.discordapp.com/emojis/759112631508008960.png',
	GITHUB_ICON_PR_CLOSED: 'https://cdn.discordapp.com/emojis/759110235574370305.png',
	GITHUB_ICON_PR_MERGED: 'https://cdn.discordapp.com/emojis/759113184509558884.png',
	GITHUB_ICON_PR_DRAFT: 'https://cdn.discordapp.com/emojis/759111607711563797.png',
	GITHUB_ICON_ISSUE_OPEN: 'https://cdn.discordapp.com/emojis/759114372491902976.png',
	GITHUB_ICON_ISSUE_CLOSED: 'https://cdn.discordapp.com/emojis/759114382101184532.png',
	GITHUB_ICON_COMMIT: 'https://cdn.discordapp.com/emojis/759112647383056384.png',
	GITHUB_COLOR_OPEN: 4491332,
	GITHUB_COLOR_CLOSED: 14166056,
	GITHUB_COLOR_MERGED: 7559322,
	GITHUB_COLOR_DRAFT: 13421772,
	GITHUB_COLOR_COMMIT: 1668818
};

export const COLORS = {
	SUCCESS: '#03b581',
	FAIL: '#d04949',
	DEFAULT: 3092790
};

export const PREFIXES = {
	FAIL: '',
	ERROR: '',
	SUCCESS: '',
	COMMAND_USAGE: {
		BLOCKED: '❌',
		ALLOWED: '✅',
		UNKNOWN: '❔'
	}
};

export const SUFFIXES = {
	CONFIRM: '[**Y**es | **N**o]'
};

export const DOCS = {
	API: {
		BASE_URL: 'https://djsdocs.sorta.moe/v2/embed?',
		DOCS_URL: 'https://raw.githubusercontent.com/discordjs/discord.js/docs/'
	},
	COLLECTION_SOURCE: 'collection',
	COLORS: {
		COLLECTION: 29439,
		DEV: 13650249,
		STABLE_DEV: 16426522
	},
	DEV_SOURCE: 'master',
	EMOJI: {
		DELETE: '🗑'
	},
	SOURCES: ['stable', 'master', 'rpc', 'commando', 'collection'],
	REACTION_TIMEOUT: 5000
};

export const HELP = {
	TRUNCATE_THRESHOLD: 50
};

export const MESSAGES = {
	COMMANDS: {
		COMMON: {
			FAIL: {
				NO_SUB_COMMAND: (commands: string[]) => `${PREFIXES.FAIL}Please provide a valid sub command out of: \`${commands.join(', ')}\`.`,
				MISSING_ARGUMENT: (arg: string) => `${PREFIXES.FAIL}Missing argument: \`${arg}\`.`,
				USAGE: (usage: string) => `${PREFIXES.FAIL}Command usage: \`${usage}\`.`,
				RESOLVE: (query: string, type: string) => `${PREFIXES.FAIL}I can not resolve \`${query}\` to a \`${type}\`.`
			}
		},
		GITHUB: {
			ALIAS: {
				ERRORS: {
					NO_GUILD: `${PREFIXES.FAIL}Please use this command in the server you want to edit settings for`,
					NO_SUB: (validCommands: string) => `${PREFIXES.FAIL}Missing sub-command, valid arguments are ${validCommands}.`,
					INVALID_SUB: (command: string, validCommands: string) => `${PREFIXES.FAIL}Invalid sub-command \`${command}\`. Valid arguments are: ${validCommands}`,
					PERMISSIONS: `${PREFIXES.FAIL}You need the permission "ADMINISTRATOR" or "MANAGE_GUILD" in order to modify GitHub aliases.`
				},
				ALIAS_FORMAT: '`alias:owner/repository`',
				ADD: {
					NO_ARGS: 'Please provide valid repository aliases to add. Valid format: `alias:owner/repository`. Also make sure the desired alias does not already exist.',
					NO_ADD: 'No new repository aliases were added.',
					TITLE: 'The following repository aliases have been enabled on this  server:'
				},
				REMOVE: {
					NO_ARGS: 'Please provide valid repository aliases to remove. Valid format: `alias:owner/repository`.',
					NO_CURRENT: 'This server does not have any repository aliases enabled at this time.',
					NO_REMOVE: 'No repository aliases have been removed.',
					TITLE: 'The following repository aliases have been disabled on this server:'
				},
				LIST: {
					NO_CURRENT: 'This server does not have any repository aliases at this time.',
					TITLE: 'The following repository aliases are enabled on this server:'
				}
			},
			COMMIT: {
				ERRORS: {
					NOT_FOUND: (expression: string, owner: string, repository: string) => `Could not find a commit based on ${expression} on the repository ${owner}/${repository}.`
				},
				FILES: (count: number) => `${count} file${count > 1 ? 's' : ''} changed.`
			},
			ERRORS: {
				FETCH: `${PREFIXES.FAIL}Error while trying to fetch GitHub API information.`,
				NO_RESULT: `${PREFIXES.FAIL}Could not find any results.`,
				ARGS_MISSING: `${PREFIXES.FAIL}Missing arguments, correct usage: \n• \`github <owner> <repository> <issue>\` \n• \`github <alias> <issue>\`\n• \`github alias <add|remove> <...alias>\`\n• \`github alias list\``,
				NO_TOKEN: 'Could not access GitHub token to use.',
				INVALID_OWNER: `${PREFIXES.FAIL}Please provide a valid GitHub repository owner.`,
				INVALID_REPOSITORY: `${PREFIXES.FAIL}Please provide a valid GitHub repository.`,
				INVALID_ISSUE: `${PREFIXES.FAIL}Please provide a valid issue number.`
			},
			ISSUE_PR: {
				ACTION: {
					CLOSE: 'closed',
					DRAFT: 'draft opened',
					MERGED_BY_IN: (user: string, commit: string) => `merged by ${user} in ${commit}`,
					MERGED_BY: (user: string) => `merged by ${user}`,
					MERGED_IN: (commit: string) => `merged in ${commit}`,
					MERGE: 'merged',
					OPEN: 'opened'
				},
				COMMENTS: (count: number) => `${count} comment${count > 1 ? 's' : ''}`,
				ERRORS: {
					NOT_FOUND: (issue: number, owner: string, repository: string) => `${PREFIXES.FAIL}Could not find issue ${issue} on the repository ${owner}/${repository}.`
				},
				HEADING: {
					INSTALL: 'Install with',
					REVIEWS: {
						APPROVED: 'Reviews (status: approved)',
						REVIEW_REQUIRED: 'Reviews (status: review required)',
						CHANGES_REQUESTED: `Reviews (status: changes requested)`
					}
				},
				REVIEW_STATE: {
					APPROVED: 'approved',
					REVIEW_REQUIRED: 'review required',
					CHANGES_REQUESTED: 'changes requested',
					COMMENTED: 'commented',
					DISMISSED: 'dismissed',
					PENDING: 'pending'
				}
			},
			UNKNOWN: 'unknown'
		},
		HELP: {
			AVAILABLE: 'Your available commands are',
			BLOCKED: {
				DM_ONLY: 'direct message only',
				GUILD_ONLY: 'in servers only',
				OWNER_ONLY: 'owner only'
			},
			MORE_INFO: (prefix: string, cmd: string) => `You can use \`${prefix}${cmd} <command>\` to get more information about a specific command`,
			FILTERED_INFO: 'These are only the commands you can use in this channel, if you want to see all commands use the --all flag!',
			ALL: 'These are all commands!'
		},
		PING: {
			WAITING: 'waiting for API response...',
			SUCCESS: (heartbeat: number, latency: number) => `${PREFIXES.SUCCESS}pong! Api latency is ${latency}ms. Average websocket heartbeat: ${heartbeat}ms.`
		},
		LOAD: {
			FAIL: `${PREFIXES.FAIL}Something went wrong, check console.`,
			NO_TAGS: 'No tags inserted.',
			NO_YAML: `${PREFIXES.FAIL}No .yaml file provided.`,
			RESET: '`[✔]` Database cleared.',
			RESET_FAIL: '`[✘]` Databse could not be cleared.',
			FINISHED: '`[✔]` Tag insertion finished.',
			REPORT: (ok: number, fail: number) => `**Report:**\nOK: ${ok}\nFail: ${fail}`
		},
		RELOAD: {
			FAIL: `${PREFIXES.FAIL}Something went wrong, check console.`,
			SUCCESS: `${PREFIXES.SUCCESS} Reloaded tags.`
		},
		TAG: {
			NO_QUERY: `${PREFIXES.FAIL}No query provided`,
			NO_TAG: (tag: string) => `${PREFIXES.FAIL}There is no tag with the name \`${tag}\``,
			NOTICE: 'Tags are occasionally synchronized with discord.js official and may not be up to date',
			TRUNCATE_NOTICE: `The response only includes ${TAG.TRUNCATE_THRESHOLD} tags, try to be more specific if that's not enough.`
		},
		DOCS: {
			ERRORS: {
				NONE_FOUND: (query: string) => `${PREFIXES.ERROR}Could not find the requested information for \`${query}\`.`
			}
		}
	}
};
