# AGENT.md — Billingo API v3 CLI for AI Agents

This document explains how to use the Billingo API v3 CLI as an AI agent.

## Overview

The `billingohu` CLI provides access to the Billingo API v3 API.

## Prerequisites

```bash
billingohu config set --api-key <key>
```

## All Commands

### Config

```bash
billingohu config set --api-key <key>
billingohu config set --base-url <url>
billingohu config show
```

### API Calls

```bash
billingohu call            # Make API call
billingohu call --json     # JSON output for parsing
```

## Tips for Agents

1. Always use `--json` when parsing results programmatically
2. Check `billingohu --help` for all available commands
3. Configure API key before making calls
