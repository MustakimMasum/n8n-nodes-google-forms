import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class GForms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'gForms',
		name: 'gForms',
		icon: 'file:gForms.svg',
		group: ['input'],
		version: 1,
		subtitle:
			'={{ $parameter.resource === "form" ? $parameter.operation : $parameter.responseOperation }}',
		description: 'Work with Google Forms via the official Forms API',
		defaults: { name: 'gForms' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,

		// OAuth2 only (Google)
		credentials: [
			{
				name: 'googleFormsOAuth2Api',
				required: true,
			},
		],

		requestDefaults: {
			baseURL: 'https://forms.googleapis.com/v1',
			returnFullResponse: false,
		},

		properties: [
			// Keep this so n8n binds the OAuth2 credential reliably
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [{ name: 'OAuth2', value: 'oAuth2' }],
				default: 'oAuth2',
				description: 'Uses a Google OAuth2 credential',
			},

			// -------- Resource --------
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

			// ===================== FORM =====================
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
					{ name: 'Batch Update', value: 'batchUpdate', action: 'Update form items questions' },
					{ name: 'Publish', value: 'publish', action: 'Publish or unpublish a form' },
				],
			},

			// ---- Create ----
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				description: 'Form title',
				displayOptions: { show: { resource: ['form'], operation: ['create'] } },
			},
			{
				displayName: 'Create Unpublished',
				name: 'unpublished',
				type: 'boolean',
				default: false,
				description: 'Whether its true, create the form in an unpublished state',
				displayOptions: { show: { resource: ['form'], operation: ['create'] } },
				routing: {
					request: {
						method: 'POST',
						url: '/forms',
						qs: { unpublished: '={{ $parameter.unpublished || undefined }}' },
						body: { info: { title: '={{ $parameter.title }}' } },
					},
				},
			},

			// ---- Get ----
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

			// ---- Batch Update ----
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
				default: '[]',
				typeOptions: { rows: 6 },
				description:
					'Array of batchUpdate requests. See the Google Forms API for supported request shapes.',
				displayOptions: { show: { resource: ['form'], operation: ['batchUpdate'] } },
				routing: {
					request: {
						method: 'POST',
						url: '=/forms/{{$parameter.formId}}:batchUpdate',
						body: { requests: '={{ JSON.parse($parameter.requests) }}' },
					},
				},
			},

			// ---- Publish / Unpublish (setPublishSettings) ----
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['form'], operation: ['publish'] } },
			},
			{
				displayName: 'Publish State',
				name: 'publishState',
				type: 'options',
				options: [
					{ name: 'Published', value: 'PUBLISHED' },
					{ name: 'Unpublished', value: 'UNPUBLISHED' },
				],
				default: 'PUBLISHED',
				displayOptions: { show: { resource: ['form'], operation: ['publish'] } },
				routing: {
					request: {
						method: 'POST',
						url: '=/forms/{{$parameter.formId}}:setPublishSettings',
						body: {
							publishSettings: { publishState: '={{ $parameter.publishState }}' },
							updateMask: 'publishState',
						},
					},
				},
			},

			// ===================== RESPONSE =====================
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

			// ---- Responses: List ----
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: 'timestamp > 2025-01-01T00:00:00Z',
				description: 'Use a timestamp filter for incremental syncs',
				displayOptions: { show: { resource: ['response'], responseOperation: ['list'] } },
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 5000 },
				default: 1000,
				description: 'Max responses to return (API allows up to 5000)',
				displayOptions: { show: { resource: ['response'], responseOperation: ['list'] } },
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Use the token from a previous list response to fetch the next page',
				displayOptions: { show: { resource: ['response'], responseOperation: ['list'] } },
				routing: {
					request: {
						method: 'GET',
						url: '=/forms/{{$parameter.formIdResp}}/responses',
						qs: {
							filter: '={{ $parameter.filter || undefined }}',
							pageSize: '={{ $parameter.pageSize || undefined }}',
							pageToken: '={{ $parameter.pageToken || undefined }}',
						},
					},
				},
			},

			// ---- Responses: Get ----
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
