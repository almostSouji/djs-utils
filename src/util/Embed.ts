import { MessageEmbed } from 'discord.js';
import { ellipsis } from './';
import { EMBED_LIMITS, COLORS } from './constants';

export class Embed extends MessageEmbed {
	private readonly limits = {
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
		if (this.description && this.description.length > this.limits.description) {
			this.description = ellipsis(this.description, this.limits.description);
		}
		if (this.title && this.title.length > this.limits.title) {
			this.title = ellipsis(this.title, this.limits.title);
		}
		if (this.fields.length > this.limits.fields) {
			this.fields = this.fields.slice(0, this.limits.fields);
		}
		if (this.author && this.author.name) {
			this.author.name = ellipsis(this.author.name, this.limits.author);
		}
		if (this.footer && this.footer.text) {
			this.footer.text = ellipsis(this.footer.text, this.limits.footer);
		}
		for (const field of this.fields) {
			field.name = ellipsis(field.name, this.limits.fieldName);
			field.value = ellipsis(field.value, this.limits.fieldValue);
		}
		return this;
	}
}
