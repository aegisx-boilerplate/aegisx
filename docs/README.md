# 📚 AegisX Documentation

Welcome to the AegisX documentation center. Here you'll find comprehensive guides for development, deployment, and architecture.

## 🚀 Getting Started

### For Developers
- **[Docker Compose Development Guide](./docker-compose-development.md)** - Complete setup guide with Docker Compose and Makefile commands
- **[Development Workflow](./development-workflow.md)** - Daily development practices and workflows
- **[Testing Guide](./testing-guide.md)** - How to run and write tests

### For DevOps/Deployment
- **[Docker Deployment](./docker-deployment.md)** - Production deployment with Docker
- **[Semantic Release](./semantic-release.md)** - Automated versioning and releases

## 🏗️ Architecture & Features

### Core Concepts
- **[Event-Driven Architecture](./event-driven-architecture.md)** - Overview of the event system
- **[Event Bus](./event-bus.md)** - RabbitMQ integration and message handling
- **[Event Analytics](./event-analytics.md)** - Analytics and monitoring system

### Detailed Guides

- **[Audit Logging](./audit-logging.md)** - Comprehensive audit system
- **[Audit Log Replay Automation](./audit-log-replay-automation.md)** - Offline audit log handling
- **[Event Analytics Quickstart](./event-analytics-quickstart.md)** - Quick setup for analytics

### 🔐 Authentication & Security

- **[Auth Testing Guide](./auth-testing-guide.md)** - Comprehensive auth system testing
- **[Auth Enhancement Summary](./auth/AUTH_ENHANCEMENT_SUMMARY.md)** - Complete auth module enhancement details
- **[Auth Routes Testing Guide](./auth/AUTH_ROUTES_TESTING.md)** - Testing authentication endpoints

## 🗺️ Roadmap & Planning

- **[Migration Strategy](./roadmap/migration-strategy.md)** - Migration planning and execution
- **[Universal Core Roadmap](./roadmap/UNIVERSAL_CORE_ROADMAP.md)** - Future architecture plans
- **[Universal Core Implementation](./roadmap/universal-core-implementation.md)** - Implementation details

## 🎯 Quick Navigation

### New to AegisX?
1. Start with [Docker Compose Development Guide](./docker-compose-development.md)
2. Follow the [Development Workflow](./development-workflow.md)
3. Read about [Event-Driven Architecture](./event-driven-architecture.md)

### Setting up Development Environment?
```bash
# Quick start commands
make setup-full    # Complete setup
make dev          # Start development
make help         # See all commands
```

See [Docker Compose Development Guide](./docker-compose-development.md) for detailed instructions.

### Working with Events?
1. [Event Bus](./event-bus.md) - Basic concepts
2. [Event Analytics](./event-analytics.md) - Monitoring and analytics  
3. [Audit Logging](./audit-logging.md) - Audit implementation

### Deploying to Production?
1. [Docker Deployment](./docker-deployment.md) - Production setup
2. [Semantic Release](./semantic-release.md) - Automated releases

## 📖 Documentation Guidelines

### Contributing to Documentation
- Keep guides practical with working examples
- Include both conceptual explanation and step-by-step instructions
- Use consistent formatting and structure
- Test all code examples before publishing

### Documentation Structure
```
docs/
├── README.md                           # This index (you are here)
├── docker-compose-development.md       # 🎯 Primary development guide
├── development-workflow.md             # Daily workflow practices
├── testing-guide.md                   # Testing approaches
├── docker-deployment.md               # Production deployment
├── event-driven-architecture.md       # Architecture overview
├── event-bus.md                       # Event system details
├── event-analytics.md                 # Analytics system
├── audit-logging.md                   # Audit system
├── audit-log-replay-automation.md     # Offline audit handling
├── event-analytics-quickstart.md      # Quick analytics setup
├── semantic-release.md                # Release automation
└── roadmap/                           # Future planning
    ├── migration-strategy.md
    ├── UNIVERSAL_CORE_ROADMAP.md
    ├── universal-core-concept-summary.md
    └── universal-core-implementation.md
```

---

🚀 **Quick Start**: New developers should begin with the [Docker Compose Development Guide](./docker-compose-development.md)!
