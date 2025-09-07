// credentials/GoogleFormsOAuth2Api.credentials.ts
import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const scopes = [
	'https://www.googleapis.com/auth/forms.body',
	'https://www.googleapis.com/auth/forms.responses.readonly',
];

export class GoogleFormsOAuth2Api implements ICredentialType {
	// This string is what your node will reference
	name = 'googleFormsOAuth2Api';
	displayName = 'Google Forms OAuth2 API';
	extends = ['googleOAuth2Api'];
	icon = 'file:gForms.svg';
	documentationUrl = 'https://developers.google.com/workspace/forms';

	properties: INodeProperties[] = [
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: scopes.join(' '),
			description:
				'OAuth scopes (space-separated). Defaults cover creating forms and reading responses.',
		},
	];
}
