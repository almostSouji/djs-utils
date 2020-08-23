import * as Lexure from 'lexure';
import CommandHandler from '../handlers/CommandHandler';
import { Message, BitFieldResolvable, PermissionString } from 'discord.js';

interface CommandFlags {
	[key: string]: string;
}

interface CommandDescription {
	content: string;
	usage: string;
	flags: CommandFlags;
}

interface CommandOptions {
	aliases?: string[];
	ownerOnly?: boolean;
	guildOnly?: boolean;
	dmOnly?: boolean;
	description: CommandDescription;
	clientPermissions?: BitFieldResolvable<PermissionString>;
	userPermissions?: BitFieldResolvable<PermissionString>;
}

export abstract class Command {
	public id: string;
	public aliases: string[];
	public ownerOnly: boolean;
	public guildOnly: boolean;
	public dmOnly: boolean;
	public description: CommandDescription;
	public clientPermissions: BitFieldResolvable<PermissionString>;
	public userPermissions: BitFieldResolvable<PermissionString>;
	public handler: CommandHandler;
	public constructor(id: string, handler: CommandHandler, data: CommandOptions) {
		this.id = id;
		this.aliases = data?.aliases ?? [];
		this.description = data?.description;
		this.ownerOnly = data.ownerOnly ?? false;
		this.guildOnly = data.guildOnly ?? false;
		this.dmOnly = data.dmOnly ?? false;
		this.clientPermissions = data.clientPermissions ?? 0;
		this.userPermissions = data.userPermissions ?? 0;
		this.handler = handler;
	}

	public abstract async execute(message: Message, args: Lexure.Args): Promise<Message|void>;
}
