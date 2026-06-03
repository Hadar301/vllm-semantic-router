# vLLM Semantic Router Quickstart

Intelligent semantic routing layer for multi-agent AI applications on Red Hat OpenShift AI, powered by [vLLM Semantic Router](https://github.com/vllm-project/semantic-router).

> **Status:** Scaffold -- implementation in progress.

## What this demonstrates

- **Semantic routing** across three specialized agents (research, RAG, general conversation)
- **Safety guardrails** via jailbreak detection and PII filtering
- **Config-first integration** -- add routing to any agentic app with YAML, no code changes
- **Full observability** via the SR Dashboard, Prometheus, and Grafana

## Architecture

```
User -> Chat UI -> Semantic Router -> [Research Agent | RAG Agent | General Agent]
                        |
                   SR Dashboard (routing analytics)
```

## Quick Start

```bash
cp .env.example .env
# Set HF_TOKEN in .env
make dev
```

## Development

```bash
make setup    # Install dependencies
make lint     # Run linters
make test     # Run unit tests
make dev      # Start all services locally
```

## Project Structure

```
packages/
  chat-ui/       React chat interface with routing visualization
  api/           FastAPI backend (proxy layer)
  db/            PostgreSQL + pgvector models
  ingestion/     Document ingestion pipeline
config/
  semantic-router/  SR routing configuration (config.yaml, signals, decisions)
deploy/
  helm/          Umbrella Helm chart
  openshift/     OpenShift-specific manifests
```

## License

Apache-2.0
