const ALGOLIA_APP = process.env.ALGOLIA_APP;
const ALGOLIA_KEY = process.env.ALGOLIA_KEY;

import * as qs from 'querystring';
import { Response } from 'polka';
import fetch from 'node-fetch';
import { prepareErrorResponse, prepareResponse } from '../util/respond';

const base = `${ALGOLIA_APP}.algolia.net`;
const GUIDE_ICON = `<:djsguide:814216203466965052>`;

export async function djsGuide(response: Response, search: string, target?: string): Promise<Response> {
	const query = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'X-Algolia-Application-Id': ALGOLIA_APP,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'X-Algolia-API-Key': ALGOLIA_KEY
	};
	const full = `http://${base}/1/indexes/discordjs/query?${qs.stringify(query)}`;
	const res: AlgoliaSearchResult = await fetch(full, {
		method: 'post',
		body: JSON.stringify({
			query: search
		})
	}).then(res => res.json());

	if (!res.hits.length) {
		prepareErrorResponse(response, 'Nothing found.');
		return response;
	}
	const relevant = res.hits.slice(0, 4);
	const result = relevant.map(({ hierarchy, url }) => `• ${hierarchy.lvl0 ?? hierarchy.lvl1 ?? ''}: [${hierarchy.lvl2 ?? hierarchy.lvl1 ?? 'click here'}](<${url}>)${hierarchy.lvl3 ? ` - ${hierarchy.lvl3}` : ''}`);

	prepareResponse(response, `${target ? `*Guide suggestion for <@${target}>:*\n` : ''}${GUIDE_ICON} **discordjs.guide results:**\n${result.join('\n')}`, false, target ? [target] : []);
	return response;
}

interface AlgoliaSearchResult {
	hits: AlgoliaHit[];
	query: string;
}

interface AlgoliaHit {
	anchor: string;
	content: string | null;
	hierarchy: AlgoliaHitHierarchy;
	url: string;
}

interface AlgoliaHitHierarchy {
	lvl0: string | null;
	lvl1: string | null;
	lvl2: string | null;
	lvl3: string | null;
	lvl4: string | null;
	lvl5: string | null;
	lvl6: string | null;
}
