# AGENT.md — Billingo CLI for AI Agents

This document explains how to use the Billingo CLI as an AI agent.

## Overview

The `billingohu` CLI provides access to the Billingo API v3 (Hungarian invoicing platform). Use it to manage invoices, partners, products, bank accounts, and document blocks on behalf of users.

## Prerequisites

The CLI must be configured with an API key before use. Check status with:

```bash
billingohu config show
```

If not configured, the user must run:
```bash
billingohu config set --api-key <key>
```

API keys can be generated at: https://app.billingo.hu/api-key

## All Commands

### Config

```bash
billingohu config set --api-key <key>
billingohu config show
```

### Documents (Invoices)

```bash
# List documents
billingohu documents list
billingohu documents list --type invoice
billingohu documents list --type proforma
billingohu documents list --type receipt
billingohu documents list --status draft
billingohu documents list --status sent
billingohu documents list --page 2 --per-page 50

# Get single document
billingohu documents get <id>

# Create document
billingohu documents create --data '{"partner_id":1,"type":"invoice","items":[...]}'

# Download document PDF
billingohu documents download <id>

# Send document via email
billingohu documents send <id> --emails "client@example.com,copy@example.com"
```

### Partners (Clients)

```bash
# List partners
billingohu partners list
billingohu partners list --query "search term"
billingohu partners list --page 2 --per-page 50

# Get single partner
billingohu partners get <id>

# Create partner
billingohu partners create --data '{"name":"Company","email":"email@example.com"}'

# Update partner
billingohu partners update <id> --data '{"email":"newemail@example.com"}'

# Delete partner
billingohu partners delete <id>
```

### Products

```bash
# List products
billingohu products list
billingohu products list --page 2 --per-page 50

# Get single product
billingohu products get <id>

# Create product
billingohu products create --data '{"name":"Service","net_unit_price":10000,"currency":"HUF","vat":"27%"}'

# Update product
billingohu products update <id> --data '{"net_unit_price":12000}'

# Delete product
billingohu products delete <id>
```

### Bank Accounts

```bash
# List bank accounts
billingohu bank-accounts list
billingohu bank-accounts list --page 2 --per-page 50

# Get single bank account
billingohu bank-accounts get <id>

# Create bank account
billingohu bank-accounts create --data '{"name":"Primary","iban":"HU..."}'

# Update bank account
billingohu bank-accounts update <id> --data '{"name":"Updated Name"}'

# Delete bank account
billingohu bank-accounts delete <id>
```

### Document Blocks (Invoice Pads)

```bash
# List document blocks
billingohu document-blocks list
billingohu document-blocks list --page 2 --per-page 50

# Get single document block
billingohu document-blocks get <id>
```

## JSON Output

All list and get commands support `--json` for structured output. Always use `--json` when parsing results programmatically:

```bash
billingohu documents list --json
billingohu partners list --json
billingohu products list --json
billingohu bank-accounts list --json
billingohu document-blocks list --json
```

## Example Workflows

### Create and send an invoice

```bash
# Step 1: Find or create the partner
billingohu partners list --query "Client Name" --json

# Step 2: Create the invoice
billingohu documents create --data '{
  "partner_id": 123,
  "type": "invoice",
  "fulfillment_date": "2024-03-15",
  "due_date": "2024-03-30",
  "currency": "HUF",
  "payment_method": "wire_transfer",
  "items": [
    {
      "name": "Consulting Services",
      "quantity": 10,
      "unit_price": 15000,
      "vat": "27%"
    }
  ]
}' --json

# Step 3: Send the invoice
billingohu documents send <document-id> --emails "client@example.com"
```

### Manage products

```bash
# List all products
billingohu products list --json

# Create a new product
billingohu products create --data '{
  "name": "Monthly Subscription",
  "net_unit_price": 9900,
  "gross_unit_price": 12573,
  "currency": "HUF",
  "vat": "27%"
}' --json

# Update a product price
billingohu products update <id> --data '{"net_unit_price": 11900}' --json
```

## Data Formats

### Partner Data

```json
{
  "name": "Company Name",
  "email": "billing@example.com",
  "taxcode": "12345678-1-23",
  "iban": "HU42123456781234567812345678",
  "address": {
    "country_code": "HU",
    "post_code": "1234",
    "city": "Budapest",
    "address": "Street Name 123"
  }
}
```

### Document/Invoice Data

```json
{
  "partner_id": 123,
  "type": "invoice",
  "fulfillment_date": "2024-03-15",
  "due_date": "2024-03-30",
  "currency": "HUF",
  "payment_method": "wire_transfer",
  "items": [
    {
      "name": "Product/Service Name",
      "quantity": 1,
      "unit_price": 10000,
      "unit": "piece",
      "vat": "27%"
    }
  ]
}
```

### Product Data

```json
{
  "name": "Product Name",
  "net_unit_price": 10000,
  "gross_unit_price": 12700,
  "currency": "HUF",
  "vat": "27%",
  "unit": "piece"
}
```

## Hungarian VAT Rates

Common VAT rates in Hungary:
- `27%` — Standard rate (default)
- `18%` — Reduced rate (certain foods, services)
- `5%` — Super-reduced rate (specific items)
- `AAM` — Special agricultural scheme
- `TAM` — Tourism margin scheme
- `EU` — Intra-community supply
- `EUK` — Intra-community acquisition
- `MAA` — Reverse charge (margin scheme)

## Error Handling

The CLI exits with code 1 on error and prints an error message to stderr. Common errors:

- `API key not configured` — Run `billingohu config set --api-key <key>`
- `Authentication failed` — Check your API key is valid
- `Resource not found` — Check the ID is correct
- `Rate limit exceeded` — Wait before retrying

## Tips for Agents

1. Always use `--json` when you need to extract specific fields
2. Use `partners list --query` before creating new partners to avoid duplicates
3. When creating invoices, verify the partner ID exists first
4. Document types: `invoice`, `receipt`, `proforma`, `draft`, `cancellation`, etc.
5. Currency is typically `HUF` (Hungarian Forint) for Billingo users
6. Dates are in `YYYY-MM-DD` format
7. Use pagination (`--page`, `--per-page`) for large datasets
