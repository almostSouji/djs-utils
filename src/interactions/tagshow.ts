import { Response } from 'express';
import { loadTags, TagData } from '../util/loadTags';
import { ephemeralError } from '../util/ephemAnswer';
import { logger } from '../util/logger';
import { distance } from 'fastest-levenshtein';
import { PREFIXES } from '../util/constants';

function mapper(entry: { word: string; lev: number; name: string }): string {
	return entry.name === entry.word ? `\`${entry.word}\`` : `\`${entry.word} (${entry.name})\``;
}

export async function tagShow(res: Response, query: string): Promise<Response> {
	if (!query) {
		return res.send({
			type: 4,
			data: {
				content: `${PREFIXES.ERROR}Query is a required parameter`,
				allowed_mentions: { parse: [] },
				flags: 64
			}
		});
	}

	query = query.toLowerCase();
	try {
		const tags = await loadTags();
		const tag = tags.find((t: TagData) => t.name.toLowerCase() === query || t.aliases.find(s => s.toLowerCase() === query));
		if (!tag) {
			const similar = tags
				.map(t => {
					const possible = [{ word: t.name, lev: distance(query, t.name.toLowerCase()), name: t.name }];
					t.aliases.forEach(a => possible.push({ word: a, lev: distance(query, a.toLowerCase()), name: t.name }));
					return possible.sort((a, b) => a.lev - b.lev)[0];
				})
				.sort((a, b) => a.lev - b.lev)
				.slice(0, 5);
			if (similar.length) {
				return ephemeralError(res, `Could not find a tag with name or alias \`${query}\`. Maybe you mean one of ${similar.map(mapper).join(', ')}?`);
			}
			return ephemeralError(res, `Could not find a tag with name or alias \`${query}\`.`);
		}
		return res.send({
			type: 4,
			data: {
				content: tag.content
			},
			allowed_mentions: { parse: [] }
		});
	} catch (error) {
		logger.error('something went wrong when loading tags:', error);
		return ephemeralError(res, 'Could not load tags.');
	}
}
