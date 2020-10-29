import { Command } from '../structures/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Message, version as djsVersion, PermissionResolvable, Permissions } from 'discord.js';
import { version as botVersion, name } from '../../package.json';
import { Embed } from '../util/Embed';
import { stripIndents } from 'common-tags';
import { formatDistanceToNowStrict } from 'date-fns';

export default class extends Command {
	public constructor(handler: CommandHandler) {
		super('about', handler, {
			aliases: ['about', 'info', 'i', 'invite', 'stats', 'statistics'],
			description: {
				content: 'Display information about the bot',
				usage: '',
				flags: {}
			}
		});
	}

	public async execute(message: Message): Promise<Message | void> {
		const { client } = this.handler;
		const owner = await client.users.fetch('83886770768314368');

		const maxPermissions = [...new Set(this.handler.commands.reduce((a: PermissionResolvable[], e: Command): PermissionResolvable[] => {
			const p = e.clientPermissions as PermissionResolvable[];
			return a.concat(p);
		}, []).filter(e => e))];
		const permissions = new Permissions(maxPermissions);
		const invite = await client.generateInvite(permissions);

		const embed = new Embed()
			.setTitle('Stats')
			.setDescription(stripIndents`
				• Project: ${name} [v${botVersion}](https://github.com/almostSouji/djs-utils/)
				• Invite: [(click) required permissions: ${permissions.toArray().join(', ')}](${invite})
			`)
			.addField('Technical', stripIndents`
				• Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
				• Uptime: ${formatDistanceToNowStrict(Date.now() - (client.uptime ?? 0))}
				• Discord.js: [v${djsVersion}](https://github.com/discordjs/discord.js/tree/${djsVersion})
				• Node.js: ${process.version}
			`, true)
			.addField('Misc', stripIndents`
				• Guilds: ${client.guilds.cache.size}
				• Users: ~${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}
				• Tags: ${client.tagCache.size}
			`, true)
			.setThumbnail(client.user?.displayAvatarURL()!)
			.setFooter(`Coded with 🍵 by ${owner.tag} | © 2020`, owner.displayAvatarURL({ dynamic: true }));

		message.answer('', embed);
	}
}
