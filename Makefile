.SILENT:
.DEFAULT_GOAL := help

help:
	echo "Please use \`make \033[36m<target>\033[0m\`"
	echo "\t where \033[36m<target>\033[0m is one of"
	grep -E '^\.PHONY: [a-zA-Z_-]+ .*?## .*$$' $(MAKEFILE_LIST) \
		| sort | awk 'BEGIN {FS = "(: |##)"}; {printf "• \033[36m%-30s\033[0m %s\n", $$2, $$3}'

.PHONY: install ## Install all dependencies including dev extras
install:
	uv sync --all-extras

.PHONY: run ## ▶️  Run the extractor demo on img/
run: install
	uv run python -m extractor.main

.PHONY: lint ## 🕵 Run lint and format
lint:
	uv run ruff check . --fix
	uv run ruff format .

.PHONY: check ## 🕵 Run lint check without fixing
check:
	uv run ruff check .

.PHONY: test ## 🧪 Run the pytest suite
test:
	uv run pytest

.PHONY: run-api ## 🚀 Run the agent FastAPI server on :8000
run-api:
	uv run uvicorn agent.api.main:app --reload --port 8000

.PHONY: plan-demo ## 📋 Run Pass 1 on the urology fixture
plan-demo:
	uv run python -m agent.api.cli fixtures/urologie_case.json

.PHONY: web-install ## 📦 Install frontend dependencies
web-install:
	cd web && npm install

.PHONY: web ## 🌐 Run the frontend dev server (mock mode)
web: web-install
	cd web && VITE_USE_MOCKS=true npm run dev

.PHONY: web-real ## 🌐 Run the frontend dev server (real API)
web-real: web-install
	cd web && npm run dev

.PHONY: web-build ## 📦 Build the frontend for production
web-build:
	cd web && npm run build
