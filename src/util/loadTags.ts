import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

const TAG_DATA_PATH = join(__dirname, '..', '..', '..', './data/tags.yaml');

export interface TagData {
	name: string;
	content: string;
	aliases: string[];
	user: string;
	templated: boolean;
	hoisted?: boolean;
	createdAt: string;
	updatedAt: string;
}

export async function loadTags(): Promise<TagData[]> {
	return new Promise(resolve => {
		const data = safeLoad(readFileSync(TAG_DATA_PATH, 'utf8')) as TagData[];
		// const withoutChannels = data.filter(d => !RegExp(/<#(\d{17,19})>/).exec(d.content));
		resolve(data);
	});
}
