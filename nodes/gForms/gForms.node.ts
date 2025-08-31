import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class gForms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'gForms',
		name: 'gForms',
		icon: 'file:gForms.svg',
		group: ['input'], // or ['transform'] if you prefer
		version: 1,
		description: 'Work with Google Forms via the official Forms API',
		defaults: { name: 'gForms' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],

		credentials: [{ name: 'googleOAuth2Api', required: true }],

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
						body: { info: { title: '={{ $parameter.title }}' } },
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
				displayOptions: { show: { resource: ['form'], operation: ['get'] } },
				routing: {
					request: {
						method: 'GET',
						url: '=/forms/{{$parameter.formId}}',
					},
				},
			},

			// Batch Update
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['form'], operation: ['batchUpdate'] } },
			},
			{
				displayName: 'Requests (JSON)',
				name: 'requests',
				type: 'json',
				default: [],
				typeOptions: { rows: 6 },
				description:
					'Array of batchUpdate requests. See the Google Forms API for supported request shapes.',
				displayOptions: { show: { resource: ['form'], operation: ['batchUpdate'] } },
				routing: {
					request: {
						method: 'POST',
						url: '=/forms/{{$parameter.formId}}:batchUpdate',
						body: { requests: '={{ $parameter.requests }}' },
					},
				},
			},

			// ---------- RESPONSE OPERATIONS ----------
			{
				displayName: 'Operation',
				name: 'responseOperation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['response'] } },
				default: 'list',
				options: [
					{ name: 'List', value: 'list', action: 'List responses' },
					{ name: 'Get', value: 'get', action: 'Get a response by ID' },
				],
			},

			// Shared (Response)
			{
				displayName: 'Form ID',
				name: 'formIdResp',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['response'] } },
			},

			// List
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: 'timestamp > 2025-01-01T00:00:00Z',
				description: 'Use a timestamp filter for incremental syncs',
				displayOptions: { show: { resource: ['response'], responseOperation: ['list'] } },
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

			// Get
			{
				displayName: 'Response ID',
				name: 'responseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['response'], responseOperation: ['get'] } },
				routing: {
					request: {
						method: 'GET',
						url: '=/forms/{{$parameter.formIdResp}}/responses/{{$parameter.responseId}}',
					},
				},
			},
		],
	};
}
