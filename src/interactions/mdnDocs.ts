import fetch from 'node-fetch';
import { Response } from 'polka';
import { logger } from '../util/logger';
import { prepareErrorResponse, prepareResponse } from '../util/respond';
import { encode } from 'querystring';

const API_BASE = 'https://developer.mozilla.org';
const MDN_ICON = '<:mdn:818272565419573308>';

const cache = new Map<string, any>();

export async function mdnSearch(res: Response, query: string, target?: string): Promise<Response> {
	try {
		const qString = `${API_BASE}/api/v1/search?${encode({ q: query })}`;
		let hit = cache.get(qString);
		if (!hit) {
			const result = await fetch(qString).then(r => r.json());
			hit = result.documents?.[0];
			cache.set(qString, hit);
		}

		if (!hit) {
			prepareErrorResponse(res, `No search result found for query \`${query}\``);
			return res;
		}

		const url = `${API_BASE}${hit.mdn_url}`;

		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;
		const intro = hit.summary.replace(/\s+/g, ' ')
			.replace(linkReplaceRegex, `[$1](${API_BASE}<$2>)`)
			.replace(boldCodeBlockRegex, '**`$1`**');

		const parts = [`${MDN_ICON} \ __[**${hit.title}**](<${url}>)__`, intro];

		prepareResponse(res, `${target ? `*Documentation suggestion for <@${target}>:*\n` : ''}${parts.join('\n')}`, false, target ? [target] : []);
		return res;
	} catch (error) {
		logger.error(error);
		prepareErrorResponse(res, 'Something went wrong');
		return res;
	}
}
