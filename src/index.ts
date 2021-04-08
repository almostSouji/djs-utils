import { config } from 'dotenv';
import { UtilsClient } from './structures/Client';
import { resolve, extname, join } from 'path';
import { readdirSync } from 'fs';
import { start } from './server';

config({ path: resolve(__dirname, '../.env') });

export interface Runvariables {
	token: string;
	clientID: string;
	pubKey: string;
	owners: string[];
	devGuild: string;
	port: number;
}

const { TOKEN, CLIENT, OWNER, PUB, PREFIX, DEV_GUILD, INTERACTION_PORT } = process.env;

async function init() {
	const vars: Runvariables = {
		token: TOKEN!,
		clientID: CLIENT!,
		pubKey: PUB!,
		owners: OWNER?.split(',')!,
		devGuild: DEV_GUILD!,
		port: Number(INTERACTION_PORT!)
	};

	const client = new UtilsClient({
		prefix: PREFIX!,
		owner: OWNER?.split(',')!
	});

	await client.commands.read(resolve(__dirname, './commands'));
	await client.events.read(resolve(__dirname, './events/client'));
	await client.events.read(resolve(__dirname, './events/commandHandler'));

	const extensions = readdirSync(join(__dirname, './extensions'));
	for (const ext of extensions.filter(file => ['.js', '.ts'].includes(extname(file)))) {
		await import(join(__dirname, './extensions', ext));
	}
	await client.init(TOKEN!);

	start(vars);
}

init();
