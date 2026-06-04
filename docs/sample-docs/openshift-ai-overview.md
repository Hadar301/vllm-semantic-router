# Red Hat OpenShift AI Overview

## What is OpenShift AI?

Red Hat OpenShift AI is a flexible, scalable MLOps platform built on Red Hat OpenShift. It provides tools for data scientists, developers, and IT operations teams to build, deploy, and manage AI/ML models and intelligent applications at scale.

OpenShift AI integrates open-source AI/ML tools into a single, enterprise-ready platform that runs on hybrid cloud infrastructure.

## Key Features

### Model Serving

OpenShift AI supports multiple model serving runtimes:

- **vLLM**: High-throughput LLM inference engine with PagedAttention, continuous batching, and tensor parallelism. Supports models from Hugging Face, GGUF, and custom formats.
- **KServe**: Kubernetes-native model serving with autoscaling, canary rollouts, and multi-model serving.
- **Caikit**: Red Hat's model runtime supporting text generation, classification, and embedding models.

### Data Science Pipelines

Kubeflow-based pipelines for automating ML workflows:

- Data preprocessing and feature engineering
- Model training and hyperparameter tuning
- Model validation and evaluation
- Deployment automation

### Workbenches

JupyterLab-based development environments with:

- Pre-installed ML frameworks (PyTorch, TensorFlow, scikit-learn)
- GPU access for training and experimentation
- Git integration for version control
- Custom container images for specialized environments

### Model Registry

Centralized model management:

- Model versioning and lifecycle tracking
- Metadata and artifact storage
- Deployment history and rollback capability

### TrustyAI

AI model explainability and fairness:

- Model bias detection and monitoring
- Feature importance analysis
- Prediction explainability (LIME, SHAP)

## Architecture

OpenShift AI runs as an operator on OpenShift, managing:

- **Data Science Projects**: Namespace-based isolation for teams
- **Model Serving Endpoints**: KServe InferenceServices with autoscaling
- **Pipeline Runs**: Argo-based workflow execution
- **Storage**: S3-compatible object storage for models and data

## Supported Models

OpenShift AI supports serving a wide range of models:

- **Large Language Models**: Llama, Granite, Mistral, Qwen families
- **Embedding Models**: all-MiniLM-L6-v2, BGE, E5
- **Vision Models**: LLaVA, CLIP
- **Custom Models**: Any model compatible with vLLM, KServe, or Caikit runtimes

## Integration with AI Architecture Charts

The rh-ai-quickstart project provides Helm charts for common AI infrastructure components:

- `llm-service`: vLLM-based model serving with GPU scheduling
- `llama-stack`: Agent orchestration with RAG and tool use
- `pgvector`: PostgreSQL with vector similarity search
- `minio`: S3-compatible object storage
- `ingestion-pipeline`: Document processing for RAG applications
- `mcp-servers`: Model Context Protocol servers for agent tools

These charts can be composed as Helm dependencies to build complete AI applications on OpenShift AI.
