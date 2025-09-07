# n8n-nodes-google-forms

This is an n8n community node. It lets you use Google Forms in your n8n workflows.

Google Forms is part of Google Workspace. The Google Forms API allows you to create and edit forms/quizzes, manage publish settings, read responses.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)
[Compatibility](#compatibility)  
[Usage](#usage)
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. You can install from the nodes panel (verified packages), via GUI using the npm package name, or manually from the command line on self-hosted instances.

## Operations

### Form
Create Form — POST /v1/forms (creates an empty form with a title). 

Get Form — GET /v1/forms/{formId}. 

Batch Update — POST /v1/forms/{formId}:batchUpdate (add/move/update items, turn on quiz settings, etc.). 

Set Publish Settings — POST /v1/forms/{formId}:setPublishSettings (publish/unpublish; legacy forms don’t support this).

### Response
List Responses — GET /v1/forms/{formId}/responses (supports filters timestamp > N and timestamp >= N for incremental pulls).

Get Response — GET /v1/forms/{formId}/responses/{responseId}.

## Credentials

### Prerequisites

Google Cloud project.

Enable Google Forms API (and Pub/Sub only if you plan to use Watches later).

### Set up OAuth
In Google Cloud, create an OAuth 2.0 Client ID (Application type: Web application).

In n8n, create a Google OAuth2 credential (Generic or Single-service). Copy the redirect URI shown by n8n into your OAuth client’s Authorized redirect URIs. 

Scopes:

https://www.googleapis.com/auth/forms.body (create/edit via batchUpdate) 
Google for Developers

https://www.googleapis.com/auth/forms.responses.readonly (read responses) 
Google for Developers

Tip: If you’re self-hosting and see redirect_uri_mismatch, ensure the exact n8n callback URL is whitelisted in Google Cloud.

## Compatibility

n8n: Tested on n8n v1.94.0 and newer. (Community nodes are installable via GUI on modern 1.x builds; Cloud supports verified community nodes from 1.94.0.) 

Node.js (for building locally): ≥ 18.17.0.

## Usage

Install the package via n8n’s Community Nodes UI (GUI install) and restart if prompted. 

Create a credential: Add a Google OAuth2 credential in n8n and complete the consent flow. 

Create a form: Use Form → Create to get a formId. 

Add items: Use Form → Batch Update with a requests[] array (e.g., createItem, updateItem, moveItem). 

Publish: Use Form → Set Publish Settings to make the form available to respondents. 

Read responses: Use Responses → List with a timestamp >= ... filter for incremental syncs; or Get a specific response. 

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Google Forms API](https://developers.google.com/workspace/forms/api/reference)
* [Google OAuth in n8n](https://docs.n8n.io/integrations/builtin/credentials/google)
* [Install community nodes](https://docs.n8n.io/integrations/community-nodes/installation)

## Version history

v1.0 — Initial release: Create Form, Get Form, Batch Update, Set Publish Settings, List Responses, Get Response (OAuth2).
