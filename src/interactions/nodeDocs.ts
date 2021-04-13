import { Response } from 'express';
import { logger } from '../util/logger';
import { duckSearch, DuckSearchSite } from '../util/duckSearch';
import * as TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import { ephemeralError } from '../util/ephemAnswer';

const API_BASE = 'https://nodejs.org';
const NODE_ICON = '<:node_js:818292297644245103>';
const td = new TurndownService({ codeBlockStyle: 'fenced' });

type QueryType = 'method' | 'class' | 'event' | 'classMethod';

function findRec(o: any, name: string, type: QueryType): any {
	name = name.toLowerCase();
	if (o?.name?.toLowerCase() === name.toLowerCase() && o?.type === type) return o;
	for (const prop of Object.keys(o)) {
		if (Array.isArray(o[prop])) {
			for (const entry of o[prop]) {
				const res = findRec(entry, name, type);
				if (res) return res;
			}
		}
	}
}

export async function nodeSearch(res: Response, query: string, target?: string): Promise<Response> {
	try {
		const page = await duckSearch(query, DuckSearchSite.node);
		if (!page) {
			return ephemeralError(res, 'No search result found. Maybe try later or try a different query!');
		}

		if (!page.data) {
			return res.send({
				type: 4,
				data: {
					content: `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}Unable to parse received data, but maybe this is useful: <${page.searchURL}>`,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					allowed_mentions: { parse: [], users: [target] }
				}
			});
		}

		const queryParts = query.split(/#|\.|\s/);
		const altQuery = queryParts[queryParts.length - 1];

		const result =
			findRec(page.data, query, 'class') ??
			findRec(page.data, query, 'classMethod') ??
			findRec(page.data, query, 'method') ??
			findRec(page.data, query, 'event') ??
			findRec(page.data, altQuery, 'class') ??
			findRec(page.data, altQuery, 'method') ??
			findRec(page.data, altQuery, 'event') ??
			findRec(page.data, altQuery, 'classMethod');

		if (!result) {
			if (page.searchURL.includes(query)) {
				return res.send({
					type: 4,
					data: {
						content: `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}Unable to parse received data, but maybe this is useful: <${page.searchURL}>`,
						// eslint-disable-next-line @typescript-eslint/naming-convention
						allowed_mentions: { parse: [], users: [target] }
					}
				});
			}
			return ephemeralError(res, 'No result found in input data.');
		}

		const heading = result.type === 'method' ? result.textRaw.replaceAll('`', '') : result.name;

		const $ = cheerio.load(page.htmlPage);
		const codeElement = $(`code:contains("${heading}")`);
		const elementId = codeElement.parent().find('span a').attr('id');

		const parts = [`${NODE_ICON} \ __[**${result.textRaw}**](<${page.searchURL}#${elementId}>)__`];

		const intro = td.turndown(result.desc ?? 'no intro').split('\n\n')[0];
		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

		parts.push(intro.replace(linkReplaceRegex, `[$1](<${API_BASE}/$2>)`).replace(boldCodeBlockRegex, '**`$1`**'));

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
