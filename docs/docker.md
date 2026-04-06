# Guia Docker - NexusHub

## Visão Geral

O NexusHub utiliza Docker e Docker Compose para orquestrar todos os serviços da plataforma. Todos os serviços são definidos no arquivo `docker-compose.yml` na raiz do projeto.

## Serviços

| Serviço | Imagem | Porta Interna | Porta Externa | Descrição |
|---------|--------|---------------|---------------|-----------|
| backend | Build local (NestJS) | 3001 | 3001 | API REST |
| frontend | Build local (Next.js) | 3000 | 3000 | Aplicação web |
| postgres | postgres:16-alpine | 5432 | 5432 | Banco de dados principal |
| redis | redis:7-alpine | 6379 | 6379 | Cache e filas |
| minio | minio/minio:latest | 9000 / 9001 | 9000 / 9001 | Armazenamento S3 |
| nginx | nginx:alpine | 8080 | 8080 | Reverse proxy |
| prometheus | prom/prometheus:latest | 9090 | 9090 | Coleta de métricas |
| grafana | grafana/grafana:latest | 3000 | 3002 | Dashboards |

## Comandos Essenciais

```bash
# Subir todos os serviços (com build)
docker compose up --build

# Subir em background
docker compose up -d --build

# Parar todos os serviços
docker compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker compose down -v

# Ver logs de um serviço específico
docker compose logs -f backend

# Executar comando dentro do container
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# Rebuild de um serviço específico
docker compose up --build backend

# Ver status dos containers
docker compose ps
```

## Volumes Persistentes

| Volume | Serviço | Caminho no Container | Descrição |
|--------|---------|---------------------|-----------|
| postgres_data | postgres | /var/lib/postgresql/data | Dados do PostgreSQL |
| redis_data | redis | /data | Dados do Redis |
| minio_data | minio | /data | Arquivos do MinIO |
| grafana_data | grafana | /var/lib/grafana | Configurações do Grafana |

Os volumes garantem que os dados persistam entre reinicializações dos containers.

## Rede

Todos os serviços compartilham a rede Docker `nexushub-network` (bridge). A comunicação interna usa os nomes dos serviços como hostname:

```
backend → postgres:5432    (banco de dados)
backend → redis:6379       (cache)
backend → minio:9000       (armazenamento)
nginx   → frontend:3000    (aplicação web)
nginx   → backend:3001     (API)
prometheus → backend:3001  (métricas)
grafana → prometheus:9090  (fonte de dados)
```

## Variáveis de Ambiente

O arquivo `.env` na raiz do projeto define todas as variáveis. Use `.env.example` como template:

```bash
# Banco de Dados
DATABASE_URL=postgresql://nexushub:nexushub_secret@postgres:5432/nexushub
POSTGRES_USER=nexushub
POSTGRES_PASSWORD=nexushub_secret
POSTGRES_DB=nexushub

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRATION=24h

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=nexushub_minio
MINIO_SECRET_KEY=nexushub_minio_secret
MINIO_BUCKET=nexushub

# Aplicação
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
```

## Nginx - Configuração do Reverse Proxy

O Nginx atua como ponto de entrada único na porta 8080, roteando:

| Rota | Destino | Descrição |
|------|---------|-----------|
| `/api/*` | backend:3001 | Requisições da API |
| `/api/docs` | backend:3001 | Swagger UI |
| `/*` | frontend:3000 | Aplicação Next.js |

Configuração localizada em `infra/nginx/nginx.conf`.

## Prometheus

Configuração em `infra/prometheus/prometheus.yml`. Coleta métricas de:

- **Backend NestJS**: endpoint `/api/health/metrics` (métricas HTTP, latência, erros)
- **PostgreSQL**: via exporter (opcional)
- **Redis**: via exporter (opcional)

Intervalo de scrape padrão: 15 segundos.

## Grafana

Provisionamento automático em `infra/grafana/`:

- **Datasources**: Prometheus configurado automaticamente
- **Dashboards**: Painéis pré-configurados para HTTP, banco de dados e negócio
- **Acesso**: http://localhost:3002 (admin / admin)

## Dockerfile do Backend

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

## Dockerfile do Frontend

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Porta já em uso | Verificar com `lsof -i :PORTA` e encerrar processo |
| Backend não conecta ao banco | Aguardar healthcheck do PostgreSQL (depends_on) |
| Migrations falhando | Executar `docker compose exec backend npx prisma migrate reset` |
| MinIO sem bucket | O seed cria o bucket automaticamente na primeira execução |
| Grafana sem dados | Verificar se Prometheus está coletando em http://localhost:9090/targets |
