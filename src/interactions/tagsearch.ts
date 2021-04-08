import { Response } from 'express';
import { loadTags } from '../util/loadTags';
import { logger } from '../util/logger';
import { ephemeralError } from '../util/ephemAnswer';
import { PREFIXES } from '../util/constants';

export async function tagSearch(res: Response, query: string): Promise<Response> {
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
		const result: string[] = [];

		for (const t of tags) {
			if (t.name.toLowerCase().includes(query) || t.content.toLowerCase().includes(query) || t.aliases.find(s => s.toLowerCase().includes(query))) {
				if (result.join(', ').length + t.name.length + 6 < 1950) {
					result.push(`\`${t.name}\``);
				}
			}
		}

		if (!result.length) {
			return ephemeralError(res, `No tags matching query \`${query}\` found.`);
		}

		return res.send({
			type: 4,
			data: {
				content: `**Found tags**: ${result.join(', ')}.`,
				flags: 64,
				allowed_mentions: { parse: [] }
			}
		});
	} catch (error) {
		logger.error('something went wrong when loading tags:', error);
		return ephemeralError(res, 'Could not load tags.');
	}
}
