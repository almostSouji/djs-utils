import { Structures, Message, Client, DMChannel, TextChannel, NewsChannel, MessageAdditions, MessageOptions, MessageEditOptions, MessageEmbed, MessageAttachment } from 'discord.js';

declare module 'discord.js' {
	export interface Message {
		response: Message | null;
		answer(content?: string, options?: MessageOptions | MessageAdditions): Promise<Message>;
		readonly useEmbed: boolean;
	}
}

export default Structures.extend(
	'Message',
	(Message): typeof Message => {
		class UtilMessage extends Message {
			public constructor(client: Client, data: object, channel: DMChannel | TextChannel | NewsChannel) {
				super(client, data, channel);
				this.response = null;
			}

			public async answer(content?: string, options?: MessageOptions & {split?: false} | MessageAdditions): Promise<Message> {
				if (this.response && !this.response.deleted) {
					return this.response.edit(content, this.transformOptions(options));
				}
				const answer = await this.channel.send(content, options ?? []);
				this.response = answer;
				return answer;
			}

			public get useEmbed(): boolean {
				if (this.channel instanceof DMChannel) return true;
				return this.channel.permissionsFor(this.client.user!)?.has('EMBED_LINKS') ?? false;
			}

			private transformOptions(options?: MessageOptions | MessageAdditions): MessageEditOptions {
				const transformedOptions: MessageEditOptions = {
					embed: null
				};
				if (!options) {
					return transformedOptions;
				}
				if (options instanceof Array) {
					for (const addition of options) {
						if (addition instanceof MessageEmbed) {
							transformedOptions.embed = addition;
						}
					}
					return transformedOptions;
				}
				if (options instanceof MessageEmbed) {
					transformedOptions.embed = options;
					return transformedOptions;
				}

				if (options instanceof MessageAttachment) {
					return transformedOptions;
				}

				if (!transformedOptions.embed) {
					transformedOptions.embed = null;
				}

				if (options.code) {
					transformedOptions.code = options.code;
				}

				if (options.content) {
					transformedOptions.content = options.content;
				}

				if (options.allowedMentions) {
					transformedOptions.allowedMentions = options.allowedMentions;
				}

				return transformedOptions;
			}
		}
		return UtilMessage;
	}
);
