# What's For Dinner - Development Makefile
# Common aliases for development tasks

.PHONY: help install dev build test lint clean doctor a11y perf security

# Default target
help:
	@echo "What's For Dinner - Development Commands"
	@echo "========================================"
	@echo ""
	@echo "Setup:"
	@echo "  install     Install all dependencies"
	@echo "  setup       Complete development setup"
	@echo ""
	@echo "Development:"
	@echo "  dev         Start development servers"
	@echo "  dev:web     Start web development server"
	@echo "  dev:mobile  Start mobile development server"
	@echo ""
	@echo "Quality:"
	@echo "  test        Run all tests"
	@echo "  lint        Lint all code"
	@echo "  type-check  TypeScript type checking"
	@echo "  doctor      Run environment health checks"
	@echo "  a11y        Run accessibility tests"
	@echo "  perf        Run performance analysis"
	@echo "  security    Run security scans"
	@echo ""
	@echo "Build:"
	@echo "  build       Build all packages and apps"
	@echo "  clean       Clean all build artifacts"
	@echo ""
	@echo "Release:"
	@echo "  release     Create release"
	@echo "  format      Format all code"

# Setup
install:
	pnpm install

setup: install
	@echo "Setting up development environment..."
	@if [ ! -f .env.local ]; then cp .env.example .env.local; echo "Created .env.local from .env.example"; fi
	@echo "Please edit .env.local with your configuration"
	@pnpm run dev:doctor

# Development
dev:
	pnpm run dev

dev:web:
	pnpm run dev:web

dev:mobile:
	pnpm run dev:mobile

# Quality checks
test:
	pnpm run test

test:watch:
	pnpm run test:watch

test:coverage:
	pnpm run test:coverage

lint:
	pnpm run lint

lint:fix:
	pnpm run lint:fix

type-check:
	pnpm run type-check

doctor:
	pnpm run dev:doctor

a11y:
	pnpm run a11y

perf:
	pnpm run perf:analyze

security:
	pnpm run security:audit

# Build
build:
	pnpm run build

clean:
	pnpm run clean

# Release
release:
	pnpm run release

format:
	pnpm run format

format:check:
	pnpm run format:check

# CI/CD helpers
ci:test:
	pnpm run test:ci

ci:build:
	pnpm run build

ci:lint:
	pnpm run lint

ci:type-check:
	pnpm run type-check

ci:all: ci:lint ci:type-check ci:test ci:build

# Database
db:start:
	pnpm run supabase:start

db:stop:
	pnpm run supabase:stop

db:reset:
	pnpm run supabase:reset

# Quick development start
quick: install dev
	@echo "Quick start complete! Development servers running."

# Full quality check
quality: doctor lint type-check test a11y perf security
	@echo "All quality checks completed!"

# Emergency reset
reset: clean
	rm -rf node_modules
	pnpm install
	@echo "Complete reset completed!"