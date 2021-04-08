import { Response } from 'express';
import * as Doc from 'discord.js-docs';
import { PREFIXES } from '../util/constants';

const DJS_ICON = '<:djs:586438523796848640>';
const DJS_ICON_MASTER = '<:djsmaster:818953388305809430>';

function escapeMDLinks(s: string): string {
	return s.replace(/\[(.+?)\]\((.+?)\)/g, '[$1](<$2>)');
}

function formatInheritance(prefix: string, inherits: DocElement[], doc: Doc): string {
	const res = inherits.map((element: any) => element.flat(5));
	return ` (${prefix} ${res.map(element => escapeMDLinks(doc.formatType(element))).join(' and ')})`;
}

function resolveElementString(element: DocElement, doc: Doc): string {
	const parts = [];
	if (element?.docType === 'event') parts.push('**(event)** ');
	if (element?.static) parts.push('**(static)** ');
	parts.push(`__**${escapeMDLinks(element?.link ?? '')}**__`);
	if (element?.extends) parts.push(formatInheritance('extends', element.extends, doc));
	if (element?.implements) parts.push(formatInheritance('implements', element.implements, doc));
	if (element?.access === 'private') parts.push(' **PRIVATE**');
	if (element?.deprecated) parts.push(' **DEPRECATED**');

	const s = (element?.formattedDescription ?? element?.description ?? '').split('\n');
	const description = s.length > 1 ? `${s[0]} [(more...)](<${element?.url ?? ''}>)` : s[0];

	return `${parts.join('')}\n${description}`;
}

function resolveResultString(results: DocElement[]): string {
	const res = [`No match. Here are some search results:`, ...results.map(res => `• **${escapeMDLinks(res?.link ?? '')}**`)];
	return res.join('\n');
}

export async function djsDocs(res: Response, source: string, query: string, target?: string): Promise<Response> {
	const doc = await Doc.fetch(source, { force: true });
	const element = doc.get(...query.split(/\.|#/));
	const icon = source === 'master' ? DJS_ICON_MASTER : DJS_ICON;

	if (element) {
		return res.send({
			data: {
				content: `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}${icon} ${resolveElementString(element, doc)}`,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [], users: [target] }
			},
			type: 4
		});
	}

	const results = doc.search(query);
	if (results?.length) {
		return res.send({
			data: {
				content: resolveResultString(results),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [] },
				flags: 64
			},
			type: 4
		});
	}

	return res.send({
		data: {
			content: `${PREFIXES.FAIL} Nothing found with provided parameters.`,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			allowed_mentions: { parse: [] },
			flags: 64
		},
		type: 4
	});
}
