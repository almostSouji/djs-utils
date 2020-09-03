export const EMBED_LIMITS = {
	TITLE: 256,
	DESCRIPTION: 2048,
	FOOTER: 2048,
	AUTHOR: 256,
	FIELDS: 25,
	FIELD_NAME: 256,
	FIELD_VALUE: 1024
};

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
	SOURCES: ['guide', 'discord.js', 'commando', 'discord-api-types', 'website', 'collection', 'rpc', 'opus', 'webhook-filter', 'node-pre-gyp', 'discord.js-next', 'form-data', 'action-webpack', 'action-docs', 'action-eslint', 'erlpack', 'discord-api-docs']
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
