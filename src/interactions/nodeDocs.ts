import { Response } from 'polka';
import fetch from 'node-fetch';
import { logger } from '../util/logger';
import TurndownService from 'turndown';
import { prepareErrorResponse, prepareResponse } from '../util/respond';

const API_BASE = 'https://nodejs.org';
const NODE_ICON = '<:node_js:818292297644245103>';
const td = new TurndownService({ codeBlockStyle: 'fenced' });

type QueryType = 'method' | 'class' | 'event' | 'classMethod' | 'module';

function findRec(o: any, name: string, type: QueryType, module?: string): any {
	name = name.toLowerCase();
	if (!module) module = o?.type === 'module' ? o?.name.toLowerCase() : undefined;
	if (o?.name?.toLowerCase() === name.toLowerCase() && o?.type === type) {
		o.module = module;
		return o;
	}
	for (const prop of Object.keys(o)) {
		if (Array.isArray(o[prop])) {
			for (const entry of o[prop]) {
				const res = findRec(entry, name, type, module);
				if (res) {
					o.module = module;
					return res;
				}
			}
		}
	}
}

let data: any = null;

function anchor(text: string, module: string): string {
	const method = text
		.toLowerCase()
		.replace(/ |`|\[|\]|\)/g, '')
		.replace(/\.|\(|,|:/g, '_');
	return `${module}_${method}`;
}

export async function nodeSearch(res: Response, query: string, target?: string): Promise<Response> {
	try {
		if (!data) {
			data = await fetch(`${API_BASE}/dist/latest/docs/api/all.json`).then(r => r.json());
		}

		const queryParts = query.split(/#|\.|\s/);
		const altQuery = queryParts[queryParts.length - 1];

		const result =
			findRec(data, query, 'class') ??
			findRec(data, query, 'classMethod') ??
			findRec(data, query, 'method') ??
			findRec(data, query, 'event') ??
			findRec(data, altQuery, 'class') ??
			findRec(data, altQuery, 'method') ??
			findRec(data, altQuery, 'event') ??
			findRec(data, altQuery, 'classMethod') ??
			findRec(data, query, 'module') ??
			findRec(data, altQuery, 'module');

		if (!result) {
			prepareErrorResponse(res, `No result found for query \`${query}\`.`);
			return res;
		}

		const moduleURL = `${API_BASE}/api/${result.module as string}`;
		const fullURL = `${moduleURL}.html${result.type === 'module' ? '' : `#${anchor(result.textRaw, result.module)}`}`;
		const parts = [`${NODE_ICON} \ __[**${result.textRaw as string}**](<${fullURL}>)__`];

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
