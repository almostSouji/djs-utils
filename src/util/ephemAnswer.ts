import { Response } from 'express';
import { PREFIXES } from './constants';

export function ephemeralError(res: Response, message: string, ephemeral = true) {
	return res.send({
		type: 4,
		data: {
			content: `${PREFIXES.ERROR}${message}`,
			flags: ephemeral ? 64 : 0,
			allowed_mentions: { parse: [] }
		}
	});
}
