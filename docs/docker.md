# Guia Docker - Vertix

## Visao Geral

O Vertix utiliza Docker e Docker Compose para orquestrar todos os servicos da plataforma. O arquivo `docker-compose.yml` na raiz do projeto define 8 servicos que trabalham juntos em uma rede Docker compartilhada.

## Servicos

| Servico | Imagem | Porta Interna | Porta Externa | Descricao |
|---------|--------|:-------------:|:-------------:|-----------|
| backend | Build local (NestJS) | 3001 | 3001 | API REST principal |
| frontend | Build local (Next.js) | 3000 | 3000 | Aplicacao web |
| postgres | postgres:16-alpine | 5432 | 5432 | Banco de dados principal |
| redis | redis:7-alpine | 6379 | 6379 | Cache e sessoes |
| minio | minio/minio:latest | 9000 / 9001 | 9000 / 9001 | Armazenamento S3-compativel |
| nginx | nginx:alpine | 80 | 8080 | Proxy reverso e load balancer |
| prometheus | prom/prometheus:latest | 9090 | 9090 | Coleta de metricas |
| grafana | grafana/grafana:latest | 3000 | 3002 | Dashboards de monitoramento |

## Dependencias entre Servicos

```
nginx
  +-- frontend (depende de backend healthy)
  +-- backend (depende de postgres healthy e redis healthy)
        +-- postgres (healthcheck: pg_isready)
        +-- redis (healthcheck: redis-cli ping)
        +-- minio (healthcheck: mc ready local)

grafana
  +-- prometheus
```

## Comandos Essenciais

### Inicializacao

```bash
# Subir todos os servicos com build (primeiro uso)
docker compose up --build

# Subir em background (modo daemon)
docker compose up -d --build

# Usar o script automatizado
npm run setup
# ou
bash scripts/setup.sh
```

### Operacoes do Dia a Dia

```bash
# Subir servicos (sem rebuild)
docker compose up -d

# Parar todos os servicos
docker compose down

# Reiniciar um servico especifico
docker compose restart backend

# Ver logs de todos os servicos
docker compose logs -f

# Ver logs de um servico especifico
docker compose logs -f backend
docker compose logs -f postgres

# Ver status dos containers
docker compose ps
```

### Banco de Dados e Migrations

```bash
# Executar migrations
docker compose exec backend npx prisma migrate deploy

# Executar seed (dados iniciais)
docker compose exec backend npx prisma db seed

# Abrir Prisma Studio (interface visual)
docker compose exec backend npx prisma studio

# Resetar banco (CUIDADO: apaga todos os dados)
docker compose exec backend npx prisma migrate reset

# Gerar cliente Prisma
docker compose exec backend npx prisma generate
```

### Build e Rebuild

```bash
# Rebuild de todos os servicos
docker compose build

# Rebuild de um servico especifico (sem cache)
docker compose build --no-cache backend

# Rebuild e subir
docker compose up --build backend
```

### Limpeza

```bash
# Parar e remover containers
docker compose down

# Parar, remover containers E volumes (CUIDADO: apaga todos os dados)
docker compose down -v

# Remover imagens nao utilizadas
docker image prune -f

# Limpeza completa (containers, volumes, imagens, redes)
docker system prune -a --volumes
```

## Volumes Persistentes

| Volume | Servico | Caminho no Container | Descricao |
|--------|---------|---------------------|-----------|
| postgres-data | postgres | /var/lib/postgresql/data | Dados do banco PostgreSQL |
| redis-data | redis | /data | Dados do Redis |
| minio-data | minio | /data | Arquivos e buckets do MinIO |
| prometheus-data | prometheus | /prometheus | Dados e series temporais |
| grafana-data | grafana | /var/lib/grafana | Dashboards e configuracoes |

Os volumes garantem que os dados persistam entre reinicializacoes dos containers. Para limpar os dados, use `docker compose down -v`.

### Volumes de Desenvolvimento (Bind Mounts)

O backend e frontend possuem bind mounts para hot reload em desenvolvimento:

```yaml
# Backend
volumes:
  - ./apps/backend:/app          # Codigo fonte
  - /app/node_modules            # Excluir node_modules do host
  - /app/dist                    # Excluir build do host

# Frontend
volumes:
  - ./apps/frontend:/app         # Codigo fonte
  - /app/node_modules            # Excluir node_modules do host
  - /app/.next                   # Excluir build do host
```

## Rede Docker

Todos os servicos compartilham a rede `vertix-network` (driver: bridge). A comunicacao interna entre containers usa os nomes dos servicos como hostname:

```
Comunicacao Interna:
  backend   --> postgres:5432     (banco de dados)
  backend   --> redis:6379        (cache)
  backend   --> minio:9000        (armazenamento de arquivos)
  nginx     --> frontend:3000     (aplicacao web)
  nginx     --> backend:3001      (API REST)
  prometheus --> backend:3001     (coleta de metricas)
  grafana   --> prometheus:9090   (fonte de dados)
```

Portas expostas ao host:

```
Host:
  :8080  --> nginx (ponto de entrada principal)
  :3000  --> frontend (acesso direto)
  :3001  --> backend (acesso direto)
  :5432  --> postgres (acesso direto ao banco)
  :6379  --> redis (acesso direto)
  :9000  --> minio API
  :9001  --> minio Console
  :9090  --> prometheus
  :3002  --> grafana
```

## Variaveis de Ambiente

O arquivo `.env` na raiz do projeto define todas as variaveis. Use `.env.example` como template:

```bash
cp .env.example .env
```

### Variaveis Principais

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| NODE_ENV | development | Ambiente de execucao |
| TZ | America/Sao_Paulo | Fuso horario |

### Banco de Dados

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| DATABASE_URL | postgresql://vertix:vertix_dev_pass@postgres:5432/vertix?schema=public | URL de conexao |
| POSTGRES_USER | vertix | Usuario do PostgreSQL |
| POSTGRES_PASSWORD | vertix_dev_pass | Senha do PostgreSQL |
| POSTGRES_DB | vertix | Nome do banco |
| POSTGRES_PORT | 5432 | Porta do PostgreSQL |

### Autenticacao

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| JWT_SECRET | vertix-dev-jwt-secret-change-in-production | Chave secreta JWT |
| JWT_EXPIRATION | 24h | Expiracao do access token |
| JWT_REFRESH_EXPIRATION | 7d | Expiracao do refresh token |
| BCRYPT_ROUNDS | 10 | Rounds do bcrypt para hash de senha |

### Redis

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| REDIS_HOST | redis | Hostname do Redis |
| REDIS_PORT | 6379 | Porta do Redis |
| REDIS_URL | redis://redis:6379 | URL completa de conexao |

### MinIO

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| MINIO_ROOT_USER | vertix_minio | Usuario root do MinIO |
| MINIO_ROOT_PASSWORD | vertix_minio_secret | Senha root do MinIO |
| MINIO_ENDPOINT | minio | Hostname do MinIO |
| MINIO_PORT | 9000 | Porta da API |
| MINIO_USE_SSL | false | SSL habilitado |
| MINIO_BUCKET | vertix-uploads | Nome do bucket |
| MINIO_ACCESS_KEY | vertix_minio | Access key |
| MINIO_SECRET_KEY | vertix_minio_secret | Secret key |

### Frontend

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| NEXT_PUBLIC_API_URL | http://localhost:8080/api | URL da API para o frontend |
| NEXT_PUBLIC_APP_NAME | Vertix | Nome da aplicacao |
| NEXT_PUBLIC_APP_URL | http://localhost:8080 | URL da aplicacao |

### Monitoramento

| Variavel | Valor Padrao | Descricao |
|----------|-------------|-----------|
| NGINX_PORT | 8080 | Porta do Nginx |
| PROMETHEUS_PORT | 9090 | Porta do Prometheus |
| GRAFANA_PORT | 3002 | Porta do Grafana |
| GF_SECURITY_ADMIN_USER | admin | Usuario admin do Grafana |
| GF_SECURITY_ADMIN_PASSWORD | admin | Senha admin do Grafana |

### Futuras Integracoes

| Variavel | Descricao |
|----------|-----------|
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS | Configuracao de email |
| STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET | Integracao de pagamento |
| AI_PROVIDER, AI_API_KEY | Integracao com IA |

## Configuracao do Nginx

O Nginx atua como ponto de entrada unico na porta 8080:

| Rota | Destino | Descricao |
|------|---------|-----------|
| `/api/*` | backend:3001 | Requisicoes da API REST |
| `/api/docs` | backend:3001 | Swagger UI |
| `/*` | frontend:3000 | Aplicacao Next.js |

Configuracao localizada em: `infra/nginx/nginx.conf`

## Prometheus

Configuracao em: `infra/prometheus/prometheus.yml`

Coleta metricas de:
- **Backend NestJS**: endpoint `/api/health/metrics`
- **Metricas HTTP**: latencia, throughput, status codes
- **Metricas customizadas**: business metrics por vertical

Intervalo de scrape padrao: 15 segundos.

## Grafana

Provisionamento automatico em: `infra/grafana/provisioning/`

- **Datasources**: Prometheus configurado automaticamente
- **Dashboards**: Paineis pre-configurados
- **Acesso**: http://localhost:3002 (admin / admin)

## Health Checks

Todos os servicos criticos possuem health checks configurados:

| Servico | Comando de Verificacao | Intervalo | Timeout | Retries |
|---------|----------------------|:---------:|:-------:|:-------:|
| postgres | `pg_isready -U vertix` | 10s | 5s | 5 |
| redis | `redis-cli ping` | 10s | 5s | 5 |
| minio | `mc ready local` | 30s | 10s | 3 |
| backend | `wget --spider http://localhost:3001/api/health` | 30s | 10s | 3 |

O backend so inicia apos postgres e redis estarem saudaveis. O frontend so inicia apos o backend estar saudavel.

## Troubleshooting

| Problema | Causa Provavel | Solucao |
|----------|---------------|---------|
| Porta ja em uso | Outro processo usando a porta | `lsof -i :PORTA` para identificar e `kill PID` |
| Backend nao conecta ao banco | PostgreSQL ainda iniciando | Aguardar healthcheck ou verificar logs: `docker compose logs postgres` |
| Migrations falhando | Banco desatualizado ou corrompido | `docker compose exec backend npx prisma migrate reset` |
| MinIO sem bucket | Primeira execucao sem seed | Executar `docker compose exec backend npx prisma db seed` |
| Frontend erro de API | URL da API incorreta | Verificar `NEXT_PUBLIC_API_URL` no `.env` |
| Grafana sem dados | Prometheus nao coletando | Verificar http://localhost:9090/targets |
| Container reiniciando | Erro na aplicacao | `docker compose logs -f <servico>` para ver erros |
| Disco cheio | Volumes acumulados | `docker system prune -a --volumes` (CUIDADO: remove tudo) |
| Build lento | Cache Docker invalido | `docker compose build --no-cache` |
| Hot reload nao funciona | Bind mount incorreto | Verificar que os diretiorios `apps/backend` e `apps/frontend` existem |
