import { Response } from 'express';
import { logger } from '../util/logger';
import * as TurndownService from 'turndown';
import { ephemeralError } from '../util/ephemAnswer';
import { duckSearch, DuckSearchSite } from '../util/duckSearch';

const API_BASE = 'https://developer.mozilla.org';
const MDN_ICON = '<:mdn:818272565419573308>';
const td = new TurndownService();

export async function mdnSearch(res: Response, query: string, target?: string): Promise<Response> {
	try {
		const searchResult = await duckSearch(query, DuckSearchSite.mdn);
		if (!searchResult) {
			return ephemeralError(res, 'No search result found. Maybe try later or try a different query!');
		}

		if (!searchResult.data) {
			return res.send({
				type: 4,
				data: {
					content: `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}Unable to parse received data, but maybe this is useful: <${searchResult.searchURL}>`,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					allowed_mentions: { parse: [], users: [target] }
				}
			});
		}

		const url = `${API_BASE}${searchResult.data.doc.mdn_url}`;

		const parts = [`${MDN_ICON} \ __[**${searchResult.data.doc.title}**](<${url}>)__`];

		const intro = td.turndown(searchResult.data.doc.body[0].value.content ?? 'no intro').split('\n\n')[0];
		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

		parts.push(intro.replace(linkReplaceRegex, `[$1](${API_BASE}<$2>)`).replace(boldCodeBlockRegex, '**`$1`**'));

		return res.send({
			type: 4,
			data: {
				content: `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}${parts.join('\n')}`,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [], users: [target] }
			}
		});
	} catch (error) {
		logger.error(error);
		return ephemeralError(res, 'Something went wrong');
	}
}
