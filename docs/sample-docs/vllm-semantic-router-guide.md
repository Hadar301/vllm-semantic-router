# vLLM Semantic Router Guide

## What is the Semantic Router?

The vLLM Semantic Router is a signal-driven intelligent routing system for LLM inference. It sits between client applications and model backends, classifying incoming requests and routing them to the most appropriate model based on configurable signals and decision rules.

The router operates as an OpenAI-compatible proxy: applications send standard chat completion requests, and the router transparently selects the best model backend.

## Core Concepts

### Signals

Signals are classifiers that analyze incoming requests and produce scores. Each signal detects a specific attribute of the query:

- **Domain**: Classifies the topic (research, general, business, engineering, etc.)
- **Complexity**: Measures whether a query requires simple or complex reasoning
- **Jailbreak**: Detects prompt injection and adversarial attacks
- **PII**: Identifies personally identifiable information
- **Keyword**: Matches specific terms or phrases
- **Language**: Detects the language of the query
- **Modality**: Identifies if the query involves text, images, or other modalities
- **Context**: Analyzes conversation context for multi-turn routing
- **Fact-check**: Determines if a response needs fact verification

### Decisions

Decisions are routing rules that compose signals into model selection logic. Each decision has:

- **Priority**: Higher priority decisions are evaluated first
- **Rules**: Boolean expressions over signals (AND, OR, NOT)
- **Model References**: Which model(s) to route to when the decision matches
- **Plugins**: Optional transformations (system prompt injection, reasoning mode)

### Model Backends

The router can route to multiple model backends:

- On-cluster vLLM instances
- Remote API endpoints (OpenAI, Anthropic, etc.)
- Llamastack for agent-augmented responses (RAG, tool use)

Each backend is configured with an endpoint, weight (for load balancing), and protocol.

## Configuration

The router is configured via a YAML file with three main sections:

### Providers (Models)

```yaml
providers:
  models:
    - name: research-agent
      reasoning_family: qwen3
      backend_refs:
        - name: research-vllm
          endpoint: llm-service:8000
          weight: 100
```

### Routing (Decisions + Signals)

```yaml
routing:
  decisions:
    - name: research
      priority: 20
      rules:
        operator: OR
        conditions:
          - type: complexity
            name: high
          - type: domain
            name: research
      modelRefs:
        - model: research-agent
          use_reasoning: true
  signals:
    domains:
      - name: research
      - name: general
```

### Global Settings

```yaml
global:
  router:
    auto_model_name: auto
  services:
    observability:
      metrics:
        enabled: true
        port: 9190
  stores:
    semantic_cache:
      enabled: true
      similarity_threshold: 0.8
```

## Safety Features

### Jailbreak Detection

The router includes a built-in jailbreak detection signal that identifies:

- Prompt injection attempts ("ignore previous instructions")
- Role-play manipulation ("you are now DAN")
- Encoding-based attacks (base64, ROT13 encoded prompts)
- Multi-turn context manipulation

When a jailbreak is detected, the decision can block the request entirely (empty modelRefs) or route to a safety-focused model.

### PII Detection

The PII signal identifies personal information:

- Names, addresses, phone numbers
- Social Security numbers, credit card numbers
- Email addresses, IP addresses

Detected PII can trigger redaction plugins or route to models configured with PII-safe system prompts.

## Deployment on OpenShift

The semantic router deploys as a pod with two containers:

1. **ExtProc**: The Go-based routing engine that classifies requests
2. **Envoy**: HTTP proxy that intercepts requests and calls ExtProc for routing decisions

The router requires no GPU resources. It runs on CPU with 3-6 GB RAM.

## API Endpoints

- `POST /v1/chat/completions` (via Envoy): OpenAI-compatible chat with automatic routing
- `POST /api/v1/eval`: Evaluate all signals for a text input
- `POST /api/v1/classify/intent`: Classify intent/domain
- `POST /api/v1/classify/combined`: Combined intent + PII + security classification
- `GET /health`: Health check
- `GET /metrics/classification`: Classification statistics
