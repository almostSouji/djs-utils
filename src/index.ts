import { config } from 'dotenv';
import { UtilsClient } from './structures/Client';
import { resolve, extname, join } from 'path';
import { readdirSync } from 'fs';

config({ path: resolve(__dirname, '../.env') });

const { TOKEN, OWNER, PREFIX } = process.env;

async function init() {
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
}

init();
