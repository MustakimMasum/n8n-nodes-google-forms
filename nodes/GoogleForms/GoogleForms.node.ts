import type {
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class GoogleForms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Forms',
		name: 'googleForms',
		icon: 'file:googleForms.svg',
		group: ['input'],
		version: 1,
		description: 'Work with Google Forms via the official Forms API',
		defaults: { name: 'Google Forms' },
		inputs: ['main'],
		outputs: ['main'],

		credentials: [
			// Reuse n8n's built-in Google OAuth2 credential
			{ name: 'googleOAuth2Api', required: true },
		],

		requestDefaults: {
			baseURL: 'https://forms.googleapis.com/v1',
			returnFullResponse: false,
		},

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'form',
				options: [
					{ name: 'Form', value: 'form' },
					{ name: 'Response', value: 'response' },
				],
			},

			// ---------- FORM OPERATIONS ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['form'] } },
				default: 'create',
				options: [
					{ name: 'Create', value: 'create', action: 'Create a form' },
					{ name: 'Get', value: 'get', action: 'Get a form' },
					{ name: 'Batch Update', value: 'batchUpdate', action: 'Update form items/questions' },
					{ name: 'Set Publish State', value: 'setPublish', action: 'Publish/unpublish a form' },
				],
			},

			// Create
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				description: 'Form title',
				displayOptions: { show: { resource: ['form'], operation: ['create'] } },
				routing: {
					request: {
						method: 'POST',
						url: '/forms',
						body: {
							info: {
								title: '={{ $parameter.title }}',
							},
						},
					},
				},
			},

			// Get
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['form'], operation: ['get', 'batchUpdate', 'setPublish'] } },
			},

			// Batch Update
			{
				displayName: 'Requests (JSON)',
				name: 'requests',
				type: 'json',
				default: [],
				typeOptions: { rows: 6 },
				description: 'Array of batchUpdate requests as JSON',
				displayOptions: { show: { resource: ['form'], operation: ['batchUpdate'] } },
				routing: {
					request: {
						method: 'POST',
						url: '=/forms/{{$parameter.formId}}:batchUpdate',
						body: {
							requests: '={{ $parameter.requests }}',
						},
					},
				},
			},

			// Set Publish State
			{
				displayName: 'Publish State',
				name: 'publishState',
				type: 'options',
				default: 'PUBLISHED',
				options: [
					{ name: 'Published', value: 'PUBLISHED' },
					{ name: 'Unpublished', value: 'UNPUBLISHED' },
				],
				displayOptions: { show: { resource: ['form'], operation: ['setPublish'] } },
				routing: {
					request: {
						method: 'POST',
						url: '=/forms/{{$parameter.formId}}:setPublishSettings',
						body: {
							publishSettings: {
								publishState: '={{ $parameter.publishState }}',
							},
							updateMask: 'publishState',
						},
					},
				},
			},

			// ---------- RESPONSE OPERATIONS ----------
			{
				displayName: 'Operation',
				name: 'operationResp',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['response'] } },
				default: 'list',
				options: [
					{ name: 'List', value: 'list', action: 'List responses' },
					{ name: 'Get', value: 'get', action: 'Get a response by ID' },
				],
			},

			// List
			{
				displayName: 'Form ID',
				name: 'formIdResp',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['response'], operationResp: ['list'] } },
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: 'timestamp > 2024-01-01T00:00:00Z',
				description: 'Use e.g. timestamp &gt; ISO-8601 to fetch incrementally',
				displayOptions: { show: { resource: ['response'], operationResp: ['list'] } },
				routing: {
					request: {
						method: 'GET',
						url: '=/forms/{{$parameter.formIdResp}}/responses',
						qs: {
							filter: '={{ $parameter.filter || undefined }}',
							pageSize: 1000,
						},
					},
				},
			},

			// Get single response
			{
				displayName: 'Form ID',
				name: 'formIdResp2',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['response'], operationResp: ['get'] } },
			},
			{
				displayName: 'Response ID',
				name: 'responseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['response'], operationResp: ['get'] } },
				routing: {
					request: {
						method: 'GET',
						url: '=/forms/{{$parameter.formIdResp2}}/responses/{{$parameter.responseId}}',
					},
				},
			},
		],
	};
}
