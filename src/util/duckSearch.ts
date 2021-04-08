
import fetch from 'node-fetch';
import { encode } from 'querystring';
import { logger } from './logger';

const API_SEARCH = 'https://api.duckduckgo.com/';

export enum DuckSearchSite {
	mdn,
	node
}

export interface DuckSearchResult {
	data: any;
	htmlPage: string;
	pageURL: string;
	searchURL: string;
}

const cache = new Map<string, DuckSearchResult>();

export async function duckSearch(q: string, site: DuckSearchSite): Promise<DuckSearchResult | null> {
	try {
		const qString = `${API_SEARCH}/?${encode({ q: `! site:${site === DuckSearchSite.mdn ? 'developer.mozilla.org/en-US' : 'https://nodejs.org'} ${q}`, format: 'json', pretty: '1', t: 'discord.js support interaction' })}`;
		const hit = cache.get(qString);
		if (hit) {
			logger.info(`Cache Hit: ${q}`);
			return hit;
		}
		logger.info(`Cache Miss: ${q}`);

		const search = await fetch(qString, {
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:27.0) 	Gecko/20100101 Firefox/27.0'
			},
			redirect: 'follow'
		});

		const htmlPage = await search.text();

		const pageURL = site === DuckSearchSite.mdn ? `${search.url}/index.json` : search.url.replace('.html', '.json');
		logger.info(`Requesting ${pageURL}`);
		const searchResult = await fetch(pageURL);
		let page: string;
		try {
			page = await searchResult.json();
		} catch {
			const relevant = !searchResult.url.startsWith(API_SEARCH);
			if (relevant) {
				const duckResult: DuckSearchResult = {
					data: null,
					pageURL,
					searchURL: search.url,
					htmlPage
				};

				logger.warn('[EXPERIMENTAL] inserting null-data into cache if #json fails and result is deemed relevant');
				return duckResult;
			}
			return null;
		}

		const duckResult = {
			data: page,
			pageURL,
			searchURL: search.url,
			htmlPage
		};

		cache.set(qString, duckResult);
		return duckResult;
	} catch (error) {
		logger.warn(error);
		return null;
	}
}
