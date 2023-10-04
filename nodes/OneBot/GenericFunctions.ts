import { IAllExecuteFunctions, IHttpRequestMethods, IHttpRequestOptions } from 'n8n-workflow';

type OneBotCredentials = {
	server: string;
	accessToken: string;
};

export async function apiRequest(
	this: IAllExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IHttpRequestOptions['body'],
	query?: IHttpRequestOptions['qs'],
) {
	const credentials = (await this.getCredentials('oneBotApi')) as OneBotCredentials;
	const baseURL = credentials.server;

	if (!endpoint.startsWith('/')) {
		endpoint = '/' + endpoint;
	}

	const options: IHttpRequestOptions = {
		url: endpoint,
		baseURL,
		headers: {
			'User-Agent': 'n8n',
		},
		method,
		body,
		qs: query,
		json: true,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'oneBotApi', options);
}
