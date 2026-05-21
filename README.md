# API Gateway

A centralized API gateway and monitoring platform that manages, secures and tracks API traffic between clients and backend services.

## Features

**Core Gateway**
- Reverse proxy — forwards requests to configurable upstream services
- API key authentication — keys stored in PostgreSQL, validated on every request
- Rate limiting — sliding window algorithm, per API key, backed by Redis sorted sets
- Response caching — GET responses cached in Redis with configurable TTL
- Request logging — every request logged to PostgreSQL with latency tracking

**Monitoring Dashboard**
- Requests per minute graph
- Average and p95 latency
- Error rate with 4xx/5xx breakdown
- Top endpoints by request count
- Live request feed via WebSocket — new requests appear instantly

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │         API Gateway          │
                    │         (Port 3000)          │
                    │                              │
Client ────────────►│  Auth → RateLimit → Cache   │────────► Mock Service
                    │         → Proxy              │          (Port 4000)
                    │                              │
                    │  /gateway/metrics/*          │
Dashboard ─────────►│  WebSocket: ws://...         │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   PostgreSQL    │   Redis     │
                    │   (Logs +       │   (Cache +  │
                    │    API Keys)    │  RateLimit) │
                    └─────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js + TypeScript | Type safety across the entire codebase |
| Framework | Express | Middleware chain maps naturally to gateway pipeline |
| Database | PostgreSQL + Prisma | Structured logs, queryable for metrics |
| Cache/Queue | Redis (ioredis) | In-memory speed for rate limiting and caching |
| Proxy | http-proxy-middleware | Handles stream forwarding correctly |
| Dashboard | React + Recharts | Fast to build, recharts handles time-series well |
| Real-time | WebSocket (ws) | Push-based updates, no polling overhead |
| Infrastructure | Docker Compose | Redis + Postgres with one command |


## Getting Started

### Prerequisites
- Node.js v20+
- Docker

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/api-gateway
cd api-gateway

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start PostgreSQL and Redis
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Generate an API key
npm run generate:key "my-app"
```

### Running

```bash
# Terminal 1 — mock backend service
npm run dev:mock

# Terminal 2 — API gateway
npm run dev

# Terminal 3 — dashboard
cd dashboard && npm run dev
```

- Gateway: `http://localhost:3000`
- Dashboard: `http://localhost:5173`
- Prisma Studio: `npx prisma studio`