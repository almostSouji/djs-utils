export interface MDNResponse {
	documents: Array<ResponseDocument>;
	metadata: any;
	suggestions: any;
}

export interface ResponseDocument {
	mdn_url: string;
	score: number;
	title: string;
	locale: string;
	slug: string;
	popularity: number;
	archived: boolean;
	summary: string;
	highlight: any;
}
