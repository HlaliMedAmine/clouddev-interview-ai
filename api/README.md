# Azure AI Coach API

Azure Functions v4 API for Azure AI Foundry. The React application calls these routes through
`/api`; it never receives the Foundry endpoint or credential.

## Configuration

Create `api/local.settings.json` from `local.settings.json.example` for local development. In the
deployed Function App, configure the same values as application settings:

- `AZURE_AI_FOUNDRY_ENDPOINT`: the Azure OpenAI resource base URL or full chat-completions URL.
- `AZURE_AI_FOUNDRY_API_KEY`: the Azure AI Foundry resource key.

Deploy a model named `gpt-4.1-mini` in the Azure AI Foundry resource. Store production secrets in
Function App settings or Key Vault references; never place them in Vite variables.

## Local development

Install Azure Functions Core Tools v4, then run:

```powershell
Copy-Item local.settings.json.example local.settings.json
npm install
npm start
```

The Vite development server proxies `/api` to `http://localhost:7071`.
