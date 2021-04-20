import { config } from 'dotenv';
import { resolve } from 'path';
import { verifyKey } from 'discord-interactions';
import { inspect } from 'util';
import { logger } from './util/logger';
import { Runvariables } from '.';
import { djsGuide } from './interactions/djsGuide';
import { djsDocs } from './interactions/djsDocs';
import { mdnSearch } from './interactions/mdnDocs';
import { nodeSearch } from './interactions/nodeDocs';
import polka, { NextHandler, Request, Response } from 'polka';
import { jsonParser } from './util/jsonParser';
import { prepareAck, prepareResponse } from './util/respond';
import chalk from 'chalk';


config({ path: resolve(__dirname, '../.env') });

function verify(req: Request, res: Response, next: NextHandler) {
	const signature = req.headers['x-signature-ed25519'];
	const timestamp = req.headers['x-signature-timestamp'];

	if (!signature || !timestamp) {
		res.writeHead(401);
		return res.end();
	}
	const isValid = verifyKey(req.rawBody, signature as string, timestamp as string, process.env.PUB!);
	if (!isValid) {
		res.statusCode = 401;
		return res.end();
	}
	void next();
}

export async function start(vars: Runvariables) {
	polka()
		.use(jsonParser(), verify)
		.post('/interactions', async (req, res) => {
			const message = req.body;
			logger.log('explore', `${chalk.blue(inspect(message, { depth: null }))}`);
			if (message.type === 2) {
				const { data: { name, id, options }, member } = message;

				logger.log('explore', `${name} (${id}) by ${chalk.blue(`${member.user.username}#${member.user.discriminator}`)}`);

				if (options?.length) {
					const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

					if (name === 'docs') {
						return (await djsDocs(res, args.source ?? 'stable', args.query, args.target)).end();
					}

					if (name === 'guide') {
						return (await djsGuide(res, args.query, args.results, args.target)).end();
					}

					if (name === 'mdn') {
						return (await mdnSearch(res, args.query, args.target)).end();
					}

					if (name === 'node') {
						return (await nodeSearch(res, args.query, args.target)).end();
					}
				}

				if (name === 'invite') {
					prepareResponse(res, `Add the discord.js interaction to your server: [(click here)](<https://discord.com/api/oauth2/authorize?client_id=${vars.clientID}&scope=applications.commands>)`, true);
					return res.end();
				}

				logger.warn(`Unknown interaction received: ${name}`);
				prepareAck(res);
				res.end();
			}
		})
		.listen(vars.port);
	logger.log('ok', `Listening for interactions on port ${chalk.green(vars.port)}`);
}
