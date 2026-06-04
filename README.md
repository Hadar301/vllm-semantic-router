# vLLM Semantic Router for Agentic Apps

Add intelligent, config-driven routing to any multi-agent AI application on Red Hat OpenShift AI.

This quickstart deploys [vLLM Semantic Router](https://github.com/vllm-project/semantic-router) as an OpenAI-compatible proxy in front of three on-cluster agents (research/reasoning, RAG, general conversation). A chat UI makes routing decisions visible -- showing which agent was selected, which signals fired, and why. The primary takeaway: you can add semantic routing, jailbreak guardrails, and cost optimization to any agentic app through YAML configuration alone, with no application code changes.

## Architecture

```mermaid
graph TB
    User[User] --> ChatUI[Chat UI<br/>React]
    Admin[Admin] --> SRDASH[SR Dashboard<br/>Routing Analytics]

    ChatUI --> API[FastAPI Backend]
    API -->|classify| SR_API[SR Classify API :8080]
    API -->|chat| SR_ENVOY[SR Envoy Proxy :8801]

    SR_ENVOY --> SD{Signal-Decision<br/>Engine}

    SD -->|research| VLLM1[vLLM: Qwen3-8B<br/>reasoning enabled]
    SD -->|rag| LS[Llamastack<br/>RAG Agent]
    SD -->|general| VLLM3[vLLM: Granite 3.1-2B]
    SD -->|jailbreak/pii| BLOCK[Blocked]

    LS --> VLLM2[vLLM: Granite 3.1-8B]
    LS --> PGV[(pgvector)]
    LS --> MINIO[(MinIO)]
```

### Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Semantic Router | vLLM SR ExtProc + Envoy | Signal-driven request classification and model routing |
| SR Dashboard | vLLM SR Dashboard (React + Go) | Routing analytics, signal inspection, metrics |
| Chat UI | React 19 + TypeScript | User-facing chat with inline routing visualization |
| Backend API | Python 3.12 + FastAPI | Proxies chat through SR, surfaces routing metadata via SSE |
| Research Agent | Qwen3-8B via vLLM | Complex reasoning queries (thinking mode enabled) |
| RAG Agent | Granite 3.1-8B via Llamastack | Knowledge base queries with document retrieval |
| General Agent | Granite 3.1-2B via vLLM | Casual conversation, simple questions |
| Vector DB | PostgreSQL + pgvector | Stores document embeddings for RAG |
| Object Storage | MinIO | Stores RAG source documents |
| Ingestion | Docling pipeline | Processes documents into embeddings |

## Requirements

### OpenShift Deployment

- Red Hat OpenShift 4.14+
- Red Hat OpenShift AI 2.9+
- `oc` CLI authenticated to the cluster
- `helm` 3.x
- **GPU:** 2-3 NVIDIA GPUs (T4, L4, or A10G) for model serving. All models are <=8B parameters.
  - 1 GPU for Qwen3-8B (research)
  - 1 GPU for Granite 3.1-8B (RAG)
  - 1 GPU for Granite 3.1-2B (general) -- can share with another model
- Hugging Face token with access to Qwen3-8B

### Local Development

- Python 3.12+
- Node.js 22+ with pnpm
- Podman + podman-compose
- NVIDIA GPU with CUDA (for vLLM model serving)

## Quick Start (Local)

```bash
git clone https://github.com/rh-ai-quickstart/vllm-semantic-router.git
cd vllm-semantic-router
cp .env.example .env
# Edit .env -- set HF_TOKEN for model downloads
make setup
make dev
```

| Service | URL |
|---------|-----|
| Chat UI | http://localhost:3000 |
| SR Dashboard | http://localhost:8700 |
| API docs | http://localhost:8000/docs |
| SR Classify API | http://localhost:8080/docs |
| MinIO Console | http://localhost:9001 |

### Ingest Sample Documents (for RAG)

```bash
python3 packages/ingestion/src/ingest.py
```

This uploads the bundled sample docs (OpenShift AI overview, SR guide) to MinIO and registers them in Llamastack's vector store.

## Deploy to OpenShift

### 1. Create namespace and set HF token

```bash
oc login <cluster-url>
oc new-project vllm-semantic-router
```

### 2. Install with Helm

```bash
helm dependency update deploy/helm/vllm-semantic-router
helm install vllm-semantic-router deploy/helm/vllm-semantic-router \
  -n vllm-semantic-router \
  --set llm-service-research.secret.hf_token=$HF_TOKEN \
  --set llm-service-rag.secret.hf_token=$HF_TOKEN \
  --set llm-service-general.secret.hf_token=$HF_TOKEN
```

### 3. Verify

```bash
oc get pods -n vllm-semantic-router
# Wait for all pods to be Running (model downloads take a few minutes)

# Get the chat UI URL
oc get route -n vllm-semantic-router -l app.kubernetes.io/name=chat-ui \
  -o jsonpath='{.items[0].spec.host}'

# Get the SR dashboard URL
oc get route -n vllm-semantic-router -l app.kubernetes.io/name=sr-dashboard \
  -o jsonpath='{.items[0].spec.host}'
```

## Delete / Cleanup

```bash
helm uninstall vllm-semantic-router -n vllm-semantic-router
oc delete project vllm-semantic-router
```

## How Routing Works

The semantic router classifies every incoming query using configurable **signals** and applies **decision rules** to select the right model:

| Signal | What it detects |
|--------|----------------|
| Domain | Topic classification (research, knowledge-base, general) |
| Complexity | Simple vs. multi-step reasoning queries |
| Jailbreak | Prompt injection and adversarial attacks |
| PII | Personal identifiable information |
| Keyword | Domain-specific terms (document, knowledge base, etc.) |

| Decision | Priority | Routes to | When |
|----------|----------|-----------|------|
| blocked | 100 | (none) | Jailbreak detected |
| pii-flagged | 90 | general-agent | PII detected (with safety prompt) |
| research | 20 | Qwen3-8B (reasoning) | Complex or research queries |
| rag | 15 | Llamastack RAG | Knowledge base or document queries |
| general | 1 | Granite 3.1-2B | Everything else |

Routing configuration lives in `config/semantic-router/config.yaml`. To customize routing for your own app, edit the `decisions` and `signals` sections -- no code changes needed.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HF_TOKEN` | Hugging Face token for model downloads | (required) |
| `SR_ENVOY_URL` | Semantic Router Envoy proxy | `http://envoy:8801` |
| `SR_API_URL` | Semantic Router classify API | `http://semantic-router:8080` |
| `LLAMA_STACK_URL` | Llamastack endpoint | `http://llamastack:8321` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:postgres@localhost:5432/semantic_router` |
| `MINIO_ENDPOINT` | MinIO S3 endpoint | `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |

## Development

```bash
make setup             # Install Python + Node dependencies, pre-commit hooks
make dev               # Start all services (podman-compose up --build)
make dev-down          # Stop all services
make lint              # Run ruff (Python) + eslint (TypeScript)
make test              # Run unit tests (pytest + vitest)
make test-integration  # Run integration tests against real DB
make helm-lint         # Validate Helm chart
make deploy            # helm dep update + helm upgrade --install
make undeploy          # helm uninstall
```

## Project Structure

```
config/semantic-router/     Routing configuration (config.yaml, signals, decisions)
deploy/
  helm/vllm-semantic-router/  Umbrella Helm chart (ai-architecture-charts deps)
  local/                      Local dev configs (Envoy)
docs/sample-docs/           Sample RAG documents
packages/
  api/                      FastAPI backend (chat proxy + routing metadata)
  chat-ui/                  React chat interface with routing visualization
  db/                       PostgreSQL + pgvector models (Alembic)
  ingestion/                Document ingestion pipeline (Docling + Llamastack)
tests/
  integration/              Integration tests
  e2e/                      Playwright E2E tests
```

## License

Apache-2.0

`vllm` `semantic-router` `multi-agent` `openshift-ai` `rag` `guardrails` `routing`
