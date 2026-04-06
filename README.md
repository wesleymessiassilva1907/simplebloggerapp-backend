# NexusHub - Plataforma SaaS Multi-Vertical

Plataforma SaaS multi-tenant completa com **9 produtos verticais** integrados. Arquitetura moderna, escalavel e pronta para producao.

## Verticais

| Modulo | Descricao |
|--------|-----------|
| Clinica Medica | Pacientes, medicos, agendamentos, prontuarios, faturamento |
| Construcao Civil | Projetos, tarefas, despesas, equipe, dashboard orcamento x realizado |
| Barbearia | Barbeiros, servicos, agendamentos, clientes, produtos, comandas |
| Imobiliaria Luxo | CRM imoveis alto padrao, clientes, visitas, negocios, comissoes |
| Nutricionista | Pacientes, planos alimentares, refeicoes, medidas corporais, consultas |
| Juridico com IA | Processos, documentos, prazos, honorarios, analise IA |
| Restaurante/Dark Kitchen | Cardapio, pedidos, entregadores, canais delivery, dashboard |
| Clinica Estetica | Procedimentos, pacotes, agendamentos, antes/depois, financeiro |
| Dentista | Pacientes, dentistas, tratamentos, planos de tratamento, odontograma |

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Banco de Dados | PostgreSQL 16 |
| ORM | Prisma |
| Cache | Redis 7 |
| Armazenamento | MinIO (S3-compativel) |
| Autenticacao | JWT + RBAC |
| Documentacao API | Swagger/OpenAPI |
| Reverse Proxy | Nginx |
| Observabilidade | Prometheus + Grafana |
| Containerizacao | Docker + Docker Compose |

## Inicio Rapido

```bash
cp .env.example .env
docker compose up --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

## Pontos de Acesso

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8080/api |
| Swagger Docs | http://localhost:8080/api/docs |
| Grafana | http://localhost:3002 (admin/admin) |
| MinIO Console | http://localhost:9001 |
| Prometheus | http://localhost:9090 |

## Credenciais de Demo (senha: Admin@123)

| Perfil | Email |
|--------|-------|
| Super Admin | admin@nexushub.com |
| Clinica Admin | admin@clinica.com |
| Medica | ana@clinica.com |
| Construcao Admin | admin@construtora.com |
| Barbearia Admin | admin@barbearia.com |
| Imobiliaria Admin | admin@imobiliaria.com |
| Nutricao Admin | admin@nutrivida.com |
| Juridico Admin | admin@silvaadv.com |
| Restaurante Admin | admin@sabor.com |
| Estetica Admin | admin@belle.com |
| Dentista Admin | admin@odonto.com |

## Estrutura do Projeto

```
nexushub/
├── apps/
│   ├── backend/                 # API NestJS
│   │   ├── prisma/              # Schema + migrations + seed
│   │   └── src/modules/
│   │       ├── core/            # Auth, Tenants, Users, Roles, Audit, Health
│   │       ├── clinic/          # Clinica Medica
│   │       ├── construction/    # Construcao Civil
│   │       ├── barbershop/      # Barbearia
│   │       ├── realestate/      # Imobiliaria Luxo
│   │       ├── nutrition/       # Nutricionista
│   │       ├── legal/           # Juridico
│   │       ├── restaurant/      # Restaurante/Dark Kitchen
│   │       ├── aesthetic/       # Clinica Estetica
│   │       ├── dental/          # Dentista
│   │       └── ai/              # IA assistiva
│   └── frontend/                # Next.js App
├── infra/                       # Docker, Nginx, Prometheus, Grafana
├── docs/                        # Documentacao detalhada
└── docker-compose.yml
```

## Multi-Tenancy

Banco compartilhado com isolamento logico via `tenant_id`. Todas as queries filtradas automaticamente pelo tenant do usuario autenticado.

## RBAC - Perfis

`super_admin`, `tenant_admin`, `clinic_doctor`, `clinic_receptionist`, `construction_manager`, `construction_worker`, `barbershop_barber`, `realestate_broker`, `realestate_agent`, `nutritionist`, `legal_lawyer`, `legal_paralegal`, `restaurant_manager`, `restaurant_kitchen`, `restaurant_delivery`, `aesthetic_professional`, `aesthetic_receptionist`, `dental_dentist`, `dental_receptionist`

## Documentacao

- [Arquitetura](docs/architecture.md)
- [API Reference](docs/api.md)
- [Docker](docs/docker.md)
- [Seguranca](docs/security.md)
- [Roadmap](docs/roadmap.md)
- [Plano de Implementacao](docs/implementation-plan.md)

## Licenca

ISC
