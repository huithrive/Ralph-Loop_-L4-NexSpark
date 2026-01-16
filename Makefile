# NexSpark Development Makefile
# Common commands for building, running, and deploying the application

.PHONY: help build dev dev-db stop clean migrate-local migrate-remote db-create db-delete deploy deploy-prod test logs

# Default target - show help
help:
	@echo "NexSpark Development Commands"
	@echo "=============================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start Vite dev server (no D1, fast hot-reload)"
	@echo "  make dev-db       - Start dev server with D1 database"
	@echo "  make build        - Build the application"
	@echo "  make stop         - Stop all dev servers"
	@echo "  make clean        - Clean build artifacts and node_modules"
	@echo ""
	@echo "Database (Local):"
	@echo "  make migrate-local      - Apply migrations to local D1 database"
	@echo "  make db-reset-local     - Delete and recreate local database"
	@echo "  make db-query-local     - Query local database tables"
	@echo "  make db-shell-local     - Open SQLite shell for local database"
	@echo ""
	@echo "Database (Remote/Production):"
	@echo "  make migrate-remote     - Apply migrations to remote Cloudflare D1"
	@echo "  make db-create-remote   - Create new remote D1 database"
	@echo "  make db-query-remote    - Query remote database tables"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy             - Deploy to Cloudflare Pages (staging)"
	@echo "  make deploy-prod        - Deploy to production"
	@echo ""
	@echo "Testing & Debugging:"
	@echo "  make test               - Test local server"
	@echo "  make logs               - View PM2 logs"
	@echo ""

# ==============================================
# BUILD COMMANDS
# ==============================================

build:
	@echo "Building application..."
	npm run build

install:
	@echo "Installing dependencies..."
	npm install

# ==============================================
# DEVELOPMENT SERVERS
# ==============================================

dev:
	@echo "Starting Vite dev server (no D1)..."
	@echo "Visit: http://localhost:5173"
	npm run dev

dev-db: build
	@echo "Starting dev server with D1 database..."
	@echo "Visit: http://localhost:3000"
	npx wrangler pages dev dist --local --port 3000

dev-pm2: build
	@echo "Starting with PM2..."
	pm2 start ecosystem.config.cjs
	@echo "Visit: http://localhost:3000"
	@echo "Logs: make logs"

stop:
	@echo "Stopping all dev servers..."
	-pkill -f "wrangler pages dev"
	-pm2 stop nexspark-landing
	-lsof -ti:3000 | xargs kill -9 2>/dev/null
	-lsof -ti:5173 | xargs kill -9 2>/dev/null
	@echo "All servers stopped"

# ==============================================
# DATABASE - LOCAL
# ==============================================

migrate-local:
	@echo "Applying migrations to local database..."
	npx wrangler d1 migrations apply nexspark-interviews --local

db-reset-local:
	@echo "Resetting local database (delete + recreate)..."
	rm -rf .wrangler/state/
	npx wrangler d1 migrations apply nexspark-interviews --local
	@echo "Local database recreated!"

db-query-local:
	@echo "Tables in local database:"
	npx wrangler d1 execute nexspark-interviews --local \
		--command "SELECT name FROM sqlite_master WHERE type='table' OR type='view'"

db-shell-local:
	@echo "Opening local database shell..."
	@echo "Database location: .wrangler/state/v3/d1/"
	npx wrangler d1 execute nexspark-interviews --local --command ".tables"

db-users-local:
	@echo "Users in local database:"
	npx wrangler d1 execute nexspark-interviews --local \
		--command "SELECT id, email, name, type FROM users"

db-auth-providers-local:
	@echo "Auth providers in local database:"
	npx wrangler d1 execute nexspark-interviews --local \
		--command "SELECT user_id, provider, email, is_primary FROM auth_providers"

# ==============================================
# DATABASE - REMOTE (CLOUDFLARE)
# ==============================================

migrate-remote:
	@echo "Applying migrations to remote Cloudflare database..."
	npx wrangler d1 migrations apply nexspark-interviews --remote

db-create-remote:
	@echo "Creating new remote D1 database..."
	npx wrangler d1 create nexspark-interviews
	@echo ""
	@echo "IMPORTANT: Copy the database_id and update wrangler.jsonc!"

db-delete-remote:
	@echo "Deleting remote database..."
	npx wrangler d1 delete nexspark-interviews

db-reset-remote: db-delete-remote db-create-remote migrate-remote
	@echo "Remote database recreated and migrations applied!"
	@echo "Don't forget to update database_id in wrangler.jsonc if it changed!"

db-query-remote:
	@echo "Tables in remote database:"
	npx wrangler d1 execute nexspark-interviews --remote \
		--command "SELECT name FROM sqlite_master WHERE type='table' OR type='view'"

db-users-remote:
	@echo "Users in remote database:"
	npx wrangler d1 execute nexspark-interviews --remote \
		--command "SELECT id, email, name, type FROM users LIMIT 10"

# ==============================================
# DEPLOYMENT
# ==============================================

deploy: build
	@echo "Deploying to Cloudflare Pages..."
	npx wrangler pages deploy dist

deploy-prod: build
	@echo "Deploying to production..."
	npm run deploy:prod
	@echo ""
	@echo "Deployed! Check your Cloudflare dashboard for the URL"

# ==============================================
# TESTING & DEBUGGING
# ==============================================

test:
	@echo "Testing local server..."
	curl -I http://localhost:3000

test-auth:
	@echo "Testing authentication endpoints..."
	@echo "POST /api/auth/register:"
	curl -X POST http://localhost:3000/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"test@example.com","password":"testpass123","name":"Test User"}' \
		| jq
	@echo ""
	@echo "POST /api/auth/login:"
	curl -X POST http://localhost:3000/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email":"test@example.com","password":"testpass123"}' \
		| jq

logs:
	@echo "PM2 logs:"
	pm2 logs nexspark-landing --nostream --lines 50

logs-live:
	@echo "Live PM2 logs (Ctrl+C to exit):"
	pm2 logs nexspark-landing

# ==============================================
# CLEANUP
# ==============================================

clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf .wrangler/
	@echo "Clean complete!"

clean-all: clean
	@echo "Removing node_modules..."
	rm -rf node_modules/
	@echo "Run 'make install' to reinstall dependencies"

clean-db-local:
	@echo "Deleting local database..."
	rm -rf .wrangler/state/
	@echo "Local database deleted. Run 'make migrate-local' to recreate"

# ==============================================
# GIT HELPERS
# ==============================================

git-status:
	git status

git-log:
	git log --oneline -10

# ==============================================
# QUICK WORKFLOWS
# ==============================================

# Quick start for development (with database)
start: build migrate-local dev-db

# Reset everything and start fresh
reset: stop clean-db-local migrate-local
	@echo "Environment reset! Ready for development"

# Full deployment workflow
deploy-full: build migrate-remote deploy-prod
	@echo "Full deployment complete!"

# Local testing workflow
test-local: build migrate-local
	@echo "Starting test server..."
	npx wrangler pages dev dist --local --port 3000 &
	sleep 3
	make test
	make test-auth
