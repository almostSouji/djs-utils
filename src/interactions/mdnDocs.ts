import { Response } from 'polka';
import { logger } from '../util/logger';
import TurndownService from 'turndown';
import { duckSearch, DuckSearchSite } from '../util/duckSearch';
import { prepareErrorResponse, prepareResponse } from '../util/respond';

const API_BASE = 'https://developer.mozilla.org';
const MDN_ICON = '<:mdn:818272565419573308>';
const td = new TurndownService();

export async function mdnSearch(res: Response, query: string, target?: string): Promise<Response> {
	try {
		const searchResult = await duckSearch(query, DuckSearchSite.mdn);
		if (!searchResult) {
			prepareErrorResponse(res, 'No search result found. Maybe try later or try a different query!');
			return res;
		}

		if (!searchResult.data) {
			prepareResponse(res, `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}Unable to parse received data, but maybe this is useful: <${searchResult.searchURL}>`, false, target ? [target] : []);
			return res;
		}

		const url = `${API_BASE}${searchResult.data.doc.mdn_url}`;

		const parts = [`${MDN_ICON} \ __[**${searchResult.data.doc.title}**](<${url}>)__`];

		const intro = td.turndown(searchResult.data.doc.body[0].value.content ?? 'no intro').split('\n\n')[0];
		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

		parts.push(intro.replace(linkReplaceRegex, `[$1](${API_BASE}<$2>)`).replace(boldCodeBlockRegex, '**`$1`**'));

		prepareResponse(res, `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}${parts.join('\n')}`, false, target ? [target] : []);
		return res;
	} catch (error) {
		logger.error(error);
		prepareErrorResponse(res, 'Something went wrong');
		return res;
	}
}
