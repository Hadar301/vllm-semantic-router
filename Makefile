.DEFAULT_GOAL := help

HELM_CHART    := deploy/helm/vllm-semantic-router
HELM_RELEASE  := vllm-semantic-router
HELM_NS       := hacohen-vllm-semantic-router-qs

help:
	@echo "Targets: setup, dev, lint, test, test-integration, test-e2e, eval, benchmark, benchmark-results, deploy, deploy-gpu, deploy-cpu, undeploy"

setup:
	pnpm install
	pip install -e "packages/api[test]" -e "packages/db" -e "packages/ingestion[test]"
	pre-commit install

dev:
	podman-compose up --build

dev-down:
	podman-compose down

lint:
	ruff check packages/api/ packages/db/ packages/ingestion/
	ruff format --check packages/api/ packages/db/ packages/ingestion/
	pnpm --filter chat-ui lint

test:
	pytest packages/api/tests/unit/ -v
	pytest packages/ingestion/tests/ -v
	pnpm --filter chat-ui test

test-integration:
	podman-compose -f compose.yml up -d pgvector
	pytest tests/integration/ -v
	podman-compose down

test-e2e:
	pnpm exec playwright test

eval:
	uv run eval/eval.py $(ARGS)

benchmark:
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) -n $(HELM_NS) \
	  --set benchmark.enabled=true \
	  $(HELM_FLAGS)
	@echo "Waiting for benchmark job to complete (up to 30m)..."
	oc wait -n $(HELM_NS) job/$(HELM_RELEASE)-benchmark \
	  --for=condition=complete --timeout=30m

benchmark-results:
	$(eval BENCH_POD := $(shell oc get pod -n $(HELM_NS) \
	  -l job-name=$(HELM_RELEASE)-benchmark \
	  -o jsonpath='{.items[0].metadata.name}' 2>/dev/null))
	@test -n "$(BENCH_POD)" || (echo "No benchmark pod found. Run 'make benchmark' first."; exit 1)
	mkdir -p benchmark-results
	oc cp -n $(HELM_NS) $(BENCH_POD):/results ./benchmark-results/
	@echo "Results saved to ./benchmark-results/"
	@ls benchmark-results/*/report.html 2>/dev/null | sed 's/^/  /'

helm-lint:
	helm lint deploy/helm/vllm-semantic-router/

deploy: deploy-gpu

deploy-gpu:
	helm dependency update $(HELM_CHART)
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) -n $(HELM_NS)

deploy-cpu:
	helm dependency update $(HELM_CHART)
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) -n $(HELM_NS) \
	  -f $(HELM_CHART)/values-general-cpu.yaml

undeploy:
	helm uninstall $(HELM_RELEASE) -n $(HELM_NS)
