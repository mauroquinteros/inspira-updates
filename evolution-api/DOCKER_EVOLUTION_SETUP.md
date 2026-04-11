# Evolution API Docker Setup (Pinned v2.3.7)

This repository currently contains planning docs. This setup runs the Evolution API stack needed by the MVP architecture.

## 1 Create runtime env file

```bash
cp .env.example .env
```

Update at minimum:

- `AUTHENTICATION_API_KEY`
- `POSTGRES_PASSWORD`

## 2 Start services

```bash
docker compose -f docker-compose.evolution.yml up -d
```

Services:

- `evolution-api` (`evoapicloud/evolution-api:v2.3.7`)
- `evolution-postgres` (`postgres:15-alpine`)
- `evolution-redis` (`redis:7-alpine`)

## 3 Verify status and logs

```bash
docker compose -f docker-compose.evolution.yml ps
docker logs evolution_api --tail 100
```

API base URL:

- `http://localhost:8080`

## 4 Test API reachability

```bash
curl -sS http://localhost:8080/ | head
```

For protected endpoints, send:

```text
apikey: <AUTHENTICATION_API_KEY>
```

## 5 Stop services

```bash
docker compose -f docker-compose.evolution.yml down
```

Remove services and volumes:

```bash
docker compose -f docker-compose.evolution.yml down -v
```

## Next.js integration rule (for implementation phase)

- Frontend must not call Evolution directly.
- Only server-side Next.js routes/actions should call Evolution API.
