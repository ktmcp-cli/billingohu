> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw  
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Billingo CLI

A production-ready command-line interface for the [Billingo](https://billingo.hu) API v3. Manage invoices, partners, products, bank accounts, and document blocks directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by Billingo.

## Features

- **Documents** — Create, list, and manage invoices and other billing documents
- **Partners** — Manage clients and suppliers
- **Products** — Maintain your product catalog
- **Bank Accounts** — Configure bank account information
- **Document Blocks** — Manage invoice pads and numbering sequences
- **API Key Auth** — Simple authentication with your Billingo API key
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output with chalk

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/billingohu
```

## Authentication Setup

### 1. Get your API key

1. Go to [app.billingo.hu/api-key](https://app.billingo.hu/api-key)
2. Generate a new API key
3. Copy the key

### 2. Configure the CLI

```bash
billingohu config set --api-key YOUR_API_KEY
```

### 3. Verify

```bash
billingohu config show
```

## Commands

### Configuration

```bash
# Set API key
billingohu config set --api-key <key>

# Show current config
billingohu config show
```

### Documents (Invoices)

```bash
# List all documents
billingohu documents list

# Filter by type
billingohu documents list --type invoice
billingohu documents list --type proforma

# Get a specific document
billingohu documents get <id>

# Create a document
billingohu documents create --data '{"partner_id":1,"items":[...]}'

# Download document PDF
billingohu documents download <id>

# Send document via email
billingohu documents send <id> --emails "client@example.com,accounting@example.com"
```

### Partners (Clients)

```bash
# List all partners
billingohu partners list

# Search partners
billingohu partners list --query "Acme Corp"

# Get a specific partner
billingohu partners get <id>

# Create a partner
billingohu partners create --data '{"name":"Acme Corp","email":"billing@acme.com"}'

# Update a partner
billingohu partners update <id> --data '{"email":"newemail@acme.com"}'

# Delete a partner
billingohu partners delete <id>
```

### Products

```bash
# List all products
billingohu products list

# Get a specific product
billingohu products get <id>

# Create a product
billingohu products create --data '{"name":"Consulting","net_unit_price":10000,"currency":"HUF","vat":"27%"}'

# Update a product
billingohu products update <id> --data '{"net_unit_price":12000}'

# Delete a product
billingohu products delete <id>
```

### Bank Accounts

```bash
# List all bank accounts
billingohu bank-accounts list

# Get a specific bank account
billingohu bank-accounts get <id>

# Create a bank account
billingohu bank-accounts create --data '{"name":"Primary Account","iban":"HU..."}'

# Update a bank account
billingohu bank-accounts update <id> --data '{"name":"Updated Name"}'

# Delete a bank account
billingohu bank-accounts delete <id>
```

### Document Blocks (Invoice Pads)

```bash
# List all document blocks
billingohu document-blocks list

# Get a specific document block
billingohu document-blocks get <id>
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all documents as JSON
billingohu documents list --json

# Get partner details
billingohu partners get <id> --json
```

## Examples

### Create and send an invoice

```bash
# First, find or create the partner
billingohu partners list --query "Client Name"

# Create a draft invoice
billingohu documents create --data '{
  "partner_id": 123,
  "type": "invoice",
  "fulfillment_date": "2024-03-15",
  "due_date": "2024-03-30",
  "currency": "HUF",
  "items": [
    {
      "name": "Consulting Services",
      "quantity": 10,
      "unit_price": 15000,
      "vat": "27%"
    }
  ]
}'

# Send the invoice via email
billingohu documents send <id> --emails "client@example.com"
```

### Manage your product catalog

```bash
# List all products
billingohu products list --json

# Create a new product
billingohu products create --data '{
  "name": "Monthly Subscription",
  "net_unit_price": 9900,
  "currency": "HUF",
  "vat": "27%"
}'
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/billingohu](https://github.com/ktmcp-cli/billingohu).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
