import { Response } from 'polka';
import { logger } from '../util/logger';
import { duckSearch, DuckSearchSite } from '../util/duckSearch';
import TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import { prepareErrorResponse, prepareResponse } from '../util/respond';

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
			prepareErrorResponse(res, 'No search result found. Maybe try later or try a different query!');
			return res;
		}

		if (!page.data) {
			prepareResponse(res, `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}Unable to parse received data, but maybe this is useful: <${page.searchURL}>`, false, target ? [target] : []);
			return res;
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
				prepareResponse(res, `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}Unable to parse received data, but maybe this is useful: <${page.searchURL}>`, false, target ? [target] : []);
				return res;
			}
			prepareErrorResponse(res, 'No result found in input data.');
			return res;
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

		prepareResponse(res, `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}${parts.join('\n')}`, false, target ? [target] : []);
		return res;
	} catch (error) {
		logger.error(error);
		prepareErrorResponse(res, 'Something went wrong.');
		return res;
	}
}
