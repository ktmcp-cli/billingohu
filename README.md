![Banner](https://raw.githubusercontent.com/ktmcp-cli/billingohu/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Billingo API v3 CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with Billingo API v3.

A production-ready command-line interface for Billingo API v3 — This is a Billingo API v3 documentation. Our API based on REST software architectural style. API has resource-oriented URLs, accepts JSON-encoded request bodies and returns JSON-encoded responses. To use this API you have to generate a new API key on our [site](https://app.billingo.hu/api-key). Afte

## Features

- **Full API Access** — All endpoints accessible via CLI
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk
- **Configuration management** — Store API keys securely

## Installation

```bash
npm install -g @ktmcp-cli/billingohu
```

## Quick Start

```bash
# Configure API key
billingohu config set --api-key YOUR_API_KEY

# Make an API call
billingohu call

# Get help
billingohu --help
```

## Commands

### Config

```bash
billingohu config set --api-key <key>
billingohu config set --base-url <url>
billingohu config show
```

### API Calls

```bash
billingohu call            # Make API call
billingohu call --json     # JSON output
```

## JSON Output

All commands support `--json` for structured output.

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.

## API Documentation

Base URL: `https://api.billingo.hu/v3`

For full API documentation, visit the official docs.

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.
