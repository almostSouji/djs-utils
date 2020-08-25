import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message, DMChannel, TextChannel, Permissions, User } from 'discord.js';
import * as Lexure from 'lexure';
import { Embed } from '../util/Embed';
import { MESSAGES, PREFIXES, HELP } from '../util/constants';
import { ellipsis } from '../util';

const { COMMANDS } = MESSAGES;

interface HelpData {
	infoData: string[];
	aboutData: string[];
	flagData: string[];
	restrictionData: string[];
}

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('help', handler, {
			aliases: ['h', 'hlp'],
			description: {
				content: 'Shows command information',
				usage: '[command]',
				flags: {
					'`-a`, `--all`': 'display all commands, regardless of restrictions'
				}
			}
		});
	}

	public async execute(message: Message, args: Lexure.Args): Promise<Message|void> {
		const useEmbed = message.useEmbed;
		const rest = Lexure.joinTokens(args.many(), null, true);

		const command = this.handler.resolve(rest);
		const hide = command?.ownerOnly && !this.handler.isOwner(message.author);
		if (command && !hide) {
			// single cmd
			const infoData = [`Name: \`${command.id}\``];

			if (command.aliases.length) {
				infoData.push(`Aliases: ${command.aliases.map(alias => `\`${alias}\``)}`);
			}
			const aboutData = [];
			const flagData = [];
			if (command.description) {
				const { content, usage, flags } = command.description;
				if (content && content.length) {
					aboutData.push(`Description: ${content}`);
				}
				if (usage && usage.length) {
					aboutData.push(`Usage: \`${command.id} ${usage}\``);
				}
				if (flags) {
					for (const key in flags) {
						if (flags.hasOwnProperty(key)) {
							flagData.push(`${key}: ${flags[key]}`);
						}
					}
				}
			}

			const restrictionData = [];
			if (command.userPermissions || command.clientPermissions) {
				if (command.clientPermissions) {
					const clientPerms = new Permissions(command.clientPermissions);
					restrictionData.push(`${this.missingIndicator(clientPerms, message, message.client.user!)} Bot permissions: ${clientPerms.toArray().map(flag => `\`${flag}\``).join(', ')}`);
				}
				if (command.userPermissions) {
					const userPerms = new Permissions(command.userPermissions);
					restrictionData.push(`${this.missingIndicator(userPerms, message, message.author)} User permissions: ${userPerms.toArray().map(flag => `\`${flag}\``).join(', ')}`);
				}
			}
			if (command.dmOnly) {
				const symbol = message.channel instanceof DMChannel ? `\`${PREFIXES.COMMAND_USAGE.ALLOWED}\` ` : `\`${PREFIXES.COMMAND_USAGE.BLOCKED}\` `;
				restrictionData.push(`${symbol} ${COMMANDS.HELP.BLOCKED.DM_ONLY}`);
			}
			if (command.guildOnly) {
				const symbol = message.channel instanceof TextChannel ? `\`${PREFIXES.COMMAND_USAGE.ALLOWED}\` ` : `\`${PREFIXES.COMMAND_USAGE.BLOCKED}\` `;
				restrictionData.push(`${symbol} ${COMMANDS.HELP.BLOCKED.GUILD_ONLY}`);
			}
			if (command.ownerOnly) {
				const symbol = this.handler.isOwner(message.author) ? `\`${PREFIXES.COMMAND_USAGE.ALLOWED}\` ` : `\`${PREFIXES.COMMAND_USAGE.BLOCKED}\` `;
				restrictionData.push(`${symbol} ${COMMANDS.HELP.BLOCKED.OWNER_ONLY}`);
			}
			const helpData = {
				infoData,
				aboutData,
				flagData,
				restrictionData
			};

			if (useEmbed) {
				return message.answer('', this.buildInfoEmbed(helpData));
			}
			return message.answer(this.buildInfoString(helpData));
		}
		const displayAll = args.flag('a', 'all');
		// command overview
		const filtered = this.handler.commands.filter(command => {
			if (command.ownerOnly && !this.handler.isOwner(message.author)) {
				return false;
			}
			if (displayAll) {
				return true;
			}
			if (command.userPermissions && !(message.channel instanceof DMChannel)) {
				if (message.channel.permissionsFor(message.author)?.has(command.userPermissions)) {
					return true;
				}
				return false;
			}
			if (command.guildOnly && message.channel instanceof DMChannel) {
				return false;
			}
			if (command.dmOnly && message.channel instanceof TextChannel) {
				return false;
			}
			return true;
		}).map(command => `• \`${command.id}\` ${ellipsis(command.description.content, HELP.TRUNCATE_THRESHOLD)}`);

		if (useEmbed) {
			return message.answer('', this.buildOverviewEmbed(filtered, displayAll));
		}
		return message.answer(this.buildOverviewString(filtered, displayAll));
	}

	private missingIndicator(perms: Permissions, message: Message, user: User): string {
		if (message.channel instanceof DMChannel) {
			return '';
		}
		const missing = message.channel.permissionsFor(user)?.missing(perms);
		if (!missing) {
			return `\`${PREFIXES.COMMAND_USAGE.UNKNOWN}\` `;
		}
		if (missing.length) {
			return `\`${PREFIXES.COMMAND_USAGE.BLOCKED}\` `;
		}
		return `\`${PREFIXES.COMMAND_USAGE.ALLOWED}\` `;
	}

	private buildInfoEmbed(data: HelpData): Embed {
		const embed = new Embed();
		const { infoData, aboutData, restrictionData, flagData } = data;
		if (infoData.length) {
			embed.addField('Command information', infoData.join('\n'));
		}
		if (aboutData.length) {
			embed.addField('About', aboutData.join('\n'));
		}
		if (flagData.length) {
			embed.addField('Options', flagData.join('\n'));
		}
		if (restrictionData.length) {
			embed.addField('Restrictions', restrictionData.join('\n'));
		}
		return embed.shorten();
	}

	private buildInfoString(data: HelpData): string {
		const responseData = [];
		const { infoData, aboutData, restrictionData, flagData } = data;
		if (infoData.length) {
			responseData.push(
				'**Command information:**',
				infoData.join('\n')
			);
		}
		if (aboutData.length) {
			responseData.push(
				'**About:**',
				aboutData.join('\n')
			);
		}
		if (flagData.length) {
			responseData.push(
				'**Options:**',
				flagData.join('\n')
			);
		}
		if (restrictionData.length) {
			responseData.push(
				'**Restrictions:**',
				restrictionData.join('\n')
			);
		}
		return responseData.join('\n');
	}

	private buildOverviewEmbed(commands: string[], all: boolean): Embed {
		const prefix = this.handler.client.config.prefix;
		const footer = all ? COMMANDS.HELP.ALL : COMMANDS.HELP.FILTERED_INFO;
		return new Embed()
			.setTitle(COMMANDS.HELP.AVAILABLE)
			.setDescription(commands.join('\n'))
			.addField('Specific commands', COMMANDS.HELP.MORE_INFO(prefix, this.id))
			.setFooter(footer, this.handler.client.user!.displayAvatarURL({ dynamic: true }))
			.shorten();
	}

	private buildOverviewString(commands: string[], all: boolean): string {
		const note = all ? COMMANDS.HELP.ALL : COMMANDS.HELP.FILTERED_INFO;
		const prefix = this.handler.client.config.prefix;
		const data = [`**${COMMANDS.HELP.AVAILABLE}:**`, ...commands, ''];
		data.push(COMMANDS.HELP.MORE_INFO(prefix, this.id));
		data.push(`*Note: ${note}*`);
		return data.join('\n');
	}
}
