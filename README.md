# NexusHub - Plataforma SaaS Multi-Vertical

Plataforma SaaS multi-tenant completa com três produtos verticais integrados: **Clínica Médica**, **Construção Civil** e **Barbearia**. Arquitetura moderna, escalável e pronta para produção.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Banco de Dados | PostgreSQL 16 |
| ORM | Prisma |
| Cache | Redis 7 |
| Armazenamento | MinIO (S3-compatível) |
| Autenticação | JWT + RBAC |
| Documentação API | Swagger/OpenAPI |
| Reverse Proxy | Nginx |
| Observabilidade | Prometheus + Grafana |
| Containerização | Docker + Docker Compose |

## Início Rápido

```bash
# 1. Clone o repositório
git clone <url> && cd nexushub

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Suba todos os serviços
docker compose up --build

# 4. Em outro terminal, execute as migrations e seeds
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Ou use o script automatizado:
```bash
bash scripts/setup.sh
```

## Pontos de Acesso

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:8080 | - |
| Backend API | http://localhost:8080/api | - |
| Swagger Docs | http://localhost:8080/api/docs | - |
| Grafana | http://localhost:3002 | admin / admin |
| MinIO Console | http://localhost:9001 | nexushub_minio / nexushub_minio_secret |
| Prometheus | http://localhost:9090 | - |

## Credenciais de Demo

| Perfil | Email | Senha |
|--------|-------|-------|
| Super Admin | admin@nexushub.com | Admin@123 |
| Admin Clínica | admin@clinica.com | Admin@123 |
| Médica | ana@clinica.com | Admin@123 |
| Recepcionista | maria@clinica.com | Admin@123 |
| Admin Construção | admin@construtora.com | Admin@123 |
| Gerente Obra | carlos@construtora.com | Admin@123 |
| Trabalhador | jose@construtora.com | Admin@123 |
| Admin Barbearia | admin@barbearia.com | Admin@123 |
| Barbeiro | pedro@barbearia.com | Admin@123 |

## Estrutura do Projeto

```
nexushub/
├── apps/
│   ├── backend/                 # API NestJS
│   │   ├── prisma/              # Schema + migrations + seed
│   │   └── src/
│   │       ├── common/          # Guards, decorators, filters, DTOs
│   │       └── modules/
│   │           ├── core/        # Auth, Tenants, Users, Roles, Audit, Health
│   │           ├── clinic/      # Patients, Doctors, Appointments, Records, Billing
│   │           ├── construction/# Projects, Tasks, Expenses, Workers
│   │           ├── barbershop/  # Barbers, Services, Bookings, Products, Orders
│   │           └── ai/         # IA assistiva (mock)
│   └── frontend/               # Next.js App
│       └── src/
│           ├── app/            # Pages (login, dashboard, modules)
│           ├── components/     # UI components
│           ├── lib/            # API client, utilities
│           └── types/          # TypeScript interfaces
├── infra/
│   ├── nginx/                  # Reverse proxy config
│   ├── prometheus/             # Metrics collection
│   └── grafana/                # Dashboards + datasources
├── docs/                       # Documentação detalhada
├── scripts/                    # Scripts de automação
├── docker-compose.yml          # Orquestração de serviços
└── .env.example                # Template de variáveis
```

## Módulos

### Core
Autenticação JWT, RBAC com 6+ perfis, multi-tenancy, auditoria, notificações, billing.

### Clínica Médica
Pacientes, médicos, agendamentos, prontuários, faturamento, dashboard.

### Construção Civil
Projetos/obras, tarefas, despesas, equipe, alocação, dashboard com orçamento x realizado.

### Barbearia
Barbeiros, serviços, agendamentos online, clientes, produtos, comandas, financeiro, dashboard.

## Multi-Tenancy

Modelo de banco compartilhado com isolamento lógico via `tenant_id`. Todas as queries são filtradas automaticamente pelo tenant do usuário autenticado via Guards do NestJS.

## Autenticação e Autorização

- **JWT** com access token no header `Authorization: Bearer <token>`
- **RBAC** com perfis: `super_admin`, `tenant_admin`, `clinic_doctor`, `clinic_receptionist`, `construction_manager`, `construction_worker`, `barbershop_barber`, `barbershop_receptionist`
- Guards automáticos por rota

## Documentação

- [Arquitetura](docs/architecture.md)
- [Domínio Clínica](docs/domain-clinic.md)
- [Domínio Construção](docs/domain-construction.md)
- [Domínio Barbearia](docs/domain-barbershop.md)
- [API Reference](docs/api.md)
- [Docker](docs/docker.md)
- [Segurança](docs/security.md)
- [Roadmap](docs/roadmap.md)
- [Plano de Implementação](docs/implementation-plan.md)

## Licença

ISC
