import { config } from 'dotenv';
import { resolve } from 'path';
import * as express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import * as chalk from 'chalk';
import { inspect } from 'util';
import { logger } from './util/logger';
import { Runvariables } from '.';
import { tagSearch } from './interactions/tagsearch';
import { tagShow } from './interactions/tagshow';
import { djsGuide } from './interactions/djsGuide';
import { djsDocs } from './interactions/djsDocs';
import { mdnSearch } from './interactions/mdnDocs';
import { nodeSearch } from './interactions/nodeDocs';

config({ path: resolve(__dirname, '../.env') });

const app = express();

export async function start(vars: Runvariables) {
	app.post('/interactions', verifyKeyMiddleware(vars.pubKey), (req, res) => {
		const message = req.body;
		logger.log('explore', chalk.blue(inspect(message, { depth: null })));
		if (message.type === 2) {
			const { data: { name, id, options }, member } = message;

			logger.log('ok', `${name} (${id}) by ${chalk.green(`${member.user.username}#${member.user.discriminator}`)}`);

			if (options?.length) {
				const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

				if (name === 'docs') {
					return djsDocs(res, args.source ?? 'stable', args.query, args.target);
				}

				if (name === 'tag') {
					return tagShow(res, args.name);
				}

				if (name === 'tagsearch') {
					return tagSearch(res, args.query);
				}

				if (name === 'guide') {
					return djsGuide(res, args.query, args.target);
				}

				if (name === 'mdn') {
					return mdnSearch(res, args.query, args.target);
				}

				if (name === 'node') {
					return nodeSearch(res, args.query, args.target);
				}
			}

			if (name === 'invite') {
				return res.send({
					type: 4,
					data: {
						content: `Add the discord.js interaction to your server: [(click here)](<https://discord.com/api/oauth2/authorize?client_id=${vars.clientID}&scope=applications.commands>)`,
						flags: 64
					}
				});
			}

			logger.warn(`Unknown interaction received: ${name}`);
		}
	});

	app.listen(vars.port, () => {
		logger.log('ok', `Listening for interactions on port ${vars.port}`);
	});
}
