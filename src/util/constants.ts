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

export const GITHUB = {
	TRUNCATE_THRESHOLD: 200,
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
	SUCCESS: ''
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
		PING: {
			WAITING: 'waiting for API response...',
			SUCCESS: (heartbeat: number, latency: number) => `${PREFIXES.SUCCESS}pong! Api latency is ${latency}ms. Average websocket heartbeat: ${heartbeat}ms.`
		},
		DOCS: {
			ERRORS: {
				MISSING_PERMISSIONS: (guild: string) => `${PREFIXES.ERROR}You are not authorized to set default logs for \`${guild}\``,
				INVALID_DOCS: (invalidDefault: string, sources: string[]) => `${PREFIXES.ERROR}Can not set default docs to \`${invalidDefault}\`. Please pick one of: ${sources.map(source => `\`${source}\``).join(', ')}.`,
				NONE_FOUND: (query: string) => `${PREFIXES.ERROR}Could not find the requested information for \`${query}\`.`
			},
			SUCESS: {
				SET_DEFAULT: (guild: string, newDefault: string) => `${PREFIXES.SUCCESS}Set the default docs for \`${guild}\` to \`${newDefault}\`.`

			}
		}
	}
};
