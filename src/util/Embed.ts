import { MessageEmbed } from 'discord.js';
import { ellipsis } from './';
import { EMBED_LIMITS, COLORS } from './constants';

export class Embed extends MessageEmbed {
	private static readonly limits = {
		title: EMBED_LIMITS.TITLE,
		description: EMBED_LIMITS.DESCRIPTION,
		footer: EMBED_LIMITS.FOOTER,
		author: EMBED_LIMITS.AUTHOR,
		fields: EMBED_LIMITS.FIELDS,
		fieldName: EMBED_LIMITS.FIELD_NAME,
		fieldValue: EMBED_LIMITS.FIELD_VALUE
	};

	public constructor(data = { color: COLORS.DEFAULT }) {
		super(data);
	}

	public shorten(): Embed {
		if (this.description && this.description.length > Embed.limits.description) {
			this.description = ellipsis(this.description, Embed.limits.description);
		}
		if (this.title && this.title.length > Embed.limits.title) {
			this.title = ellipsis(this.title, Embed.limits.title);
		}
		if (this.fields.length > Embed.limits.fields) {
			this.fields = this.fields.slice(0, Embed.limits.fields);
		}
		if (this.author && this.author.name) {
			this.author.name = ellipsis(this.author.name, Embed.limits.author);
		}
		if (this.footer && this.footer.text) {
			this.footer.text = ellipsis(this.footer.text, Embed.limits.footer);
		}
		for (const field of this.fields) {
			field.name = ellipsis(field.name, Embed.limits.fieldName);
			field.value = ellipsis(field.value, Embed.limits.fieldValue);
		}
		return this;
	}
}
