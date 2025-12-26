.PHONY: run-dev

run-dev:
	@echo "Starting Amplify Sandbox and Next.js Dev Server..."
	(npx ampx sandbox --profile amplify-policy-075701661574) & (pnpm run dev)
