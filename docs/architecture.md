# Arquitetura do Sistema - Vertix

## Visao Geral

O Vertix e uma plataforma SaaS multi-vertical projetada para atender multiplos segmentos de mercado (clinicas medicas e construcao civil) com uma unica base de codigo. A arquitetura segue principios de modularidade, isolamento de dados e escalabilidade horizontal.

## Design do Sistema

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTACAO            │
│                    Next.js (Frontend)                │
├─────────────────────────────────────────────────────┤
│                    CAMADA DE PROXY                   │
│                    Nginx (Load Balancer)             │
├─────────────────────────────────────────────────────┤
│                    CAMADA DE API                     │
│                    NestJS (Backend)                  │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │   Core   │  │  Clinic  │  │  Construction  │    │
│  │  Module  │  │  Module  │  │    Module      │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │  Guards  │  │   DTOs   │  │  Interceptors  │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
├─────────────────────────────────────────────────────┤
│                    CAMADA DE DADOS                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │PostgreSQL│  │  Redis   │  │     MinIO      │    │
│  │  (Dados) │  │ (Cache)  │  │  (Arquivos)   │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
├─────────────────────────────────────────────────────┤
│                    CAMADA DE OBSERVABILIDADE         │
│  ┌──────────┐  ┌──────────┐                         │
│  │Prometheus│  │ Grafana  │                         │
│  │(Metricas)│  │(Dashboards)│                       │
│  └──────────┘  └──────────┘                         │
└─────────────────────────────────────────────────────┘
```

### Principios Arquiteturais

1. **Modularidade**: Cada dominio de negocio e um modulo NestJS independente
2. **Multi-Tenancy**: Isolamento de dados por tenant em todas as camadas
3. **Separacao de Responsabilidades**: Controllers, Services e DTOs bem definidos
4. **Convention over Configuration**: Padroes consistentes em todos os modulos
5. **API-First**: Backend expoe API REST documentada via Swagger/OpenAPI

## Camadas da Aplicacao

### 1. Camada de Apresentacao (Frontend)

- **Next.js 14** com App Router e Server Components
- **Tailwind CSS** para estilizacao responsiva
- Comunicacao via REST API com fetch e interceptors de autenticacao
- Roteamento protegido por middleware de sessao
- Tipos TypeScript compartilhados entre front e backend

### 2. Camada de API (Backend)

- **NestJS** com decorators, injecao de dependencia e modulos
- Validacao de entrada com `class-validator` e `class-transformer`
- Documentacao automatica via Swagger/OpenAPI
- Middlewares globais: logging, CORS, rate limiting
- Pipeline de guards: AuthGuard -> TenantGuard -> RolesGuard

### 3. Camada de Dominio

Cada vertical e um modulo NestJS isolado com seus proprios controllers, services, DTOs e entities:

| Modulo | Responsabilidade |
|--------|-----------------|
| `core/auth` | Login, registro de tenant, JWT, perfil |
| `core/tenants` | CRUD de tenants, configuracoes |
| `core/users` | Gestao de usuarios e perfis |
| `core/roles` | RBAC e permissoes |
| `core/billing` | Assinaturas e planos |
| `core/audit` | Log de auditoria de acoes |
| `core/notifications` | Sistema de notificacoes |
| `core/health` | Healthcheck e metricas |
| `clinic/*` | Pacientes, medicos, agendamentos, prontuarios, faturamento |
| `construction/*` | Projetos, tarefas, despesas, trabalhadores |
| `ai/*` | Resumo clinico, analise de risco |

### 4. Camada de Persistencia

- **PostgreSQL 16** como banco principal
- **Prisma ORM** para migrations, queries tipadas e seed
- **Redis 7** para cache de sessao, rate limiting e filas

### 5. Camada de Infraestrutura

- **MinIO** para armazenamento de arquivos (fotos, documentos, comprovantes)
- **Nginx** como reverse proxy e load balancer
- **Prometheus** para coleta de metricas
- **Grafana** para dashboards de observabilidade

## Modelo Multi-Tenant

### Estrategia: Banco Compartilhado com Isolamento Logico

O Vertix utiliza a estrategia de **Shared Database, Shared Schema** com isolamento a nivel de linha (Row-Level Isolation):

```
┌──────────────────────────────────────────┐
│           PostgreSQL (unico banco)       │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        Tabela: clinic_patients     │  │
│  │  id | tenant_id | name | ...       │  │
│  │  1  | tenant-A  | Joao | ...       │  │
│  │  2  | tenant-B  | Maria| ...       │  │
│  │  3  | tenant-A  | Ana  | ...       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Todas as queries incluem:               │
│  WHERE tenant_id = :currentTenantId      │
└──────────────────────────────────────────┘
```

### Fluxo de Resolucao do Tenant

```
Request HTTP
    |
    v
[JWT Token] --> [JwtStrategy] --> Extrai userId, tenantId, roles
    |
    v
[TenantGuard] --> Valida que o tenant existe e esta ativo
    |
    v
[RolesGuard] --> Valida que o usuario tem a role necessaria
    |
    v
[Controller] --> @TenantId() decorator injeta o tenantId
    |
    v
[Service] --> Todas as queries filtradas por tenantId
```

### Vantagens desta Abordagem

| Vantagem | Descricao |
|----------|-----------|
| Custo reduzido | Um unico banco de dados para todos os tenants |
| Simplicidade | Migrations e seeds aplicados uma unica vez |
| Escalabilidade | Possivel particionar por tenant no futuro |
| Manutencao | Schema unico facilita atualizacoes |

### Indices de Performance

Todos os modelos possuem indices otimizados:

```prisma
@@index([tenantId])                          // Filtro basico por tenant
@@index([tenantId, doctorId, appointmentDate]) // Queries compostas
@@index([tenantId, projectId])               // Relacionamentos dentro do tenant
@@index([tenantId, patientId])               // Busca de prontuarios
@@index([tenantId, entity])                  // Logs de auditoria por entidade
```

## Estrutura dos Modulos

### Modulo Core

O modulo Core e o nucleo da plataforma e fornece servicos compartilhados:

```
core/
├── auth/           # Autenticacao JWT (login, registro de tenant)
├── users/          # CRUD de usuarios dentro de um tenant
├── tenants/        # Gerenciamento de tenants (super_admin)
├── roles/          # RBAC - papeis e permissoes
├── billing/        # Assinaturas e planos
├── audit/          # Logs de auditoria imutaveis
├── notifications/  # Sistema de notificacoes
└── health/         # Health check e metricas Prometheus
```

### Modulo Clinic (Vertical Clinica)

```
clinic/
├── patients/        # Cadastro e gestao de pacientes
├── doctors/         # Cadastro de medicos e especialidades
├── appointments/    # Agendamento de consultas
├── medical-records/ # Prontuarios medicos
└── billing/         # Faturamento e cobrancas
```

### Modulo Construction (Vertical Construcao)

```
construction/
├── projects/   # Projetos/obras com orcamento e cronograma
├── tasks/      # Tarefas com progresso percentual
├── expenses/   # Controle de despesas e materiais
└── workers/    # Trabalhadores e alocacao em projetos
```

### Modulo AI

```
ai/
├── clinic-summary.service.ts      # Resumo automatico de consultas
└── construction-risk.service.ts   # Analise de risco de projetos
```

## Fluxo de Dados

### Requisicao Tipica

```
1. Cliente envia request HTTP para Nginx (:8080)
2. Nginx roteia: /api/* -> Backend (:3001), /* -> Frontend (:3000)
3. Backend recebe a request
4. Middleware pipeline:
   a. AuthGuard: valida JWT
   b. TenantGuard: resolve e valida tenant
   c. RolesGuard: verifica permissoes
   d. AuditInterceptor: registra acao
5. Controller processa parametros e chama Service
6. Service executa logica de negocio com Prisma
7. Prisma faz query no PostgreSQL filtrada por tenantId
8. Resposta percorre o caminho inverso ate o cliente
```

### Fluxo de Autenticacao

```
[POST /api/auth/login]
       |
       v
[AuthService.login()]
       |
       +-- Busca usuario por email + tenantId
       +-- Valida senha com bcrypt
       +-- Carrega roles do usuario
       +-- Gera JWT com payload:
           {
             sub: userId,
             tenantId: tenantId,
             roles: ['tenant_admin', 'clinic_doctor']
           }
       |
       v
[Retorna { access_token: "eyJ..." }]
```

## Camadas de Seguranca

### 1. Autenticacao (AuthGuard)
- JWT com expiracao configuravel (padrao: 24h)
- Refresh token com expiracao de 7 dias
- Senhas com hash bcrypt (10 rounds)

### 2. Autorizacao (RolesGuard)
- RBAC com 6 papeis pre-definidos
- Decorator `@Roles()` em cada endpoint
- Um usuario pode ter multiplos papeis

### 3. Isolamento de Dados (TenantGuard)
- Toda operacao de dados filtrada por `tenantId`
- Guard que valida status do tenant (ativo/suspenso)
- Decorator `@TenantId()` para injecao automatica

### 4. Auditoria (AuditInterceptor)
- Registro automatico de acoes sensiveis
- Logs imutaveis no banco de dados
- Rastreabilidade completa de operacoes

### 5. Infraestrutura
- Nginx como proxy reverso com rate limiting
- CORS configuravel por dominio
- HTTPS em producao (via Nginx/Load Balancer)
- Health checks para todos os servicos

## Diagrama de Infraestrutura

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                  (vertix-network)                      │
│                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────┐     │
│  │  Nginx  │--->│Frontend │    │    Backend      │     │
│  │  :8080  │--->│  :3000  │    │     :3001       │     │
│  └─────────┘    └─────────┘    └────────┬────────┘     │
│                                         │               │
│                       ┌─────────────────┼────────┐      │
│                       │                 │        │      │
│                 ┌─────v─────┐  ┌───────v──┐ ┌───v───┐  │
│                 │ PostgreSQL│  │  Redis   │ │ MinIO │  │
│                 │   :5432   │  │  :6379   │ │:9000  │  │
│                 │           │  │          │ │:9001  │  │
│                 └───────────┘  └──────────┘ └───────┘  │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Prometheus  │--->│   Grafana    │                   │
│  │    :9090     │    │    :3002     │                   │
│  └──────────────┘    └──────────────┘                   │
│                                                         │
│  Volumes Persistentes:                                  │
│  - postgres-data    - redis-data    - minio-data        │
│  - prometheus-data  - grafana-data                      │
└─────────────────────────────────────────────────────────┘
```

## Consideracoes de Escalabilidade

### Escalabilidade Horizontal

| Componente | Estrategia |
|-----------|-----------|
| Backend | Multiplas replicas atras do Nginx com load balancing |
| PostgreSQL | Read replicas para queries de leitura + PgBouncer |
| Redis | Cluster mode para sessoes distribuidas e alta disponibilidade |
| MinIO | Modo distribuido com erasure coding |
| Frontend | CDN + ISR (Incremental Static Regeneration) |

### Estrategias Futuras

1. **Particionamento de Dados**: Particionar tabelas grandes por `tenantId` usando PostgreSQL table partitioning
2. **Cache Distribuido**: Redis para cache de consultas frequentes e sessoes
3. **Filas de Mensagem**: Adicionar Bull/BullMQ para processamento assincrono (emails, relatorios)
4. **CQRS**: Separar modelos de leitura e escrita para relatorios pesados
5. **Microservicos**: Extrair modulos verticais como servicos independentes quando necessario

### Metricas e Monitoramento

- **Prometheus**: Coleta metricas do backend (requests, latencia, erros)
- **Grafana**: Dashboards visuais com alertas configuraveis
- **Health Checks**: Endpoint `/api/health` verifica conectividade com todos os servicos
- **Logs Estruturados**: Saida em formato JSON para agregacao com ELK/Loki

## Decisoes Arquiteturais

| Decisao | Justificativa |
|---------|--------------|
| Monorepo | Frontend e backend no mesmo repositorio facilita CI/CD e compartilhamento de tipos |
| Monolito modular | Simplicidade operacional para MVP; facil extracao futura de microsservicos |
| NestJS | Framework opinado com DI, modularidade e ecossistema rico |
| Prisma ORM | Type-safety, migrations automaticas, Prisma Studio e excelente DX |
| Shared Schema | Menor custo operacional para fase inicial do SaaS |
| Docker Compose | Ambiente de desenvolvimento reproduzivel e identico |
| Nginx | Proxy reverso eficiente com configuracao simples |
| UUID como PK | Evita colisoes entre tenants e facilita merge/migracao de dados |
| MinIO vs S3 | Compativel com S3 API, sem vendor lock-in, local para dev |
| Redis | Baixa latencia, suporte a TTL, pub/sub para notificacoes futuras |
| JWT stateless | Escalabilidade horizontal sem necessidade de sessao no servidor |

## Ambientes

| Ambiente | Descricao |
|----------|-----------|
| `development` | Docker Compose local, hot reload, seeds de demonstracao |
| `staging` | Replica de producao para QA e testes de integracao |
| `production` | Kubernetes/EKS com TLS, backups automaticos e monitoramento |

## CI/CD

O projeto possui pipelines automatizadas configuradas em `.github/workflows/`:

| Pipeline | Descricao |
|----------|-----------|
| `pipeline.yml` | Pipeline principal (lint, test, build) |
| `ci-security.yml` | Verificacao de seguranca e vulnerabilidades |
| `build-dockerhub.yml` | Build e push de imagens para Docker Hub |
| `deploy-eks-bluegreen.yml` | Deploy blue/green em Amazon EKS |
