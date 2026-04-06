# Vertix - Especificacao Tecnica Completa
## Parte 4: Banco de Dados, API, Frontend e Observabilidade

> Documento de referencia tecnica para toda a plataforma Vertix SaaS multi-vertical.
> Ultima atualizacao: 2026-04-06

---

## Indice

1. [Modelagem de Banco de Dados](#1-modelagem-de-banco-de-dados)
2. [Especificacao da API](#2-especificacao-da-api)
3. [Especificacao do Frontend](#3-especificacao-do-frontend)
4. [Billing e Monetizacao](#4-billing-e-monetizacao)
5. [Integracoes e Notificacoes](#5-integracoes-e-notificacoes)
6. [IA Aplicada](#6-ia-aplicada)
7. [Observabilidade](#7-observabilidade)
8. [Docker e Ambiente Local](#8-docker-e-ambiente-local)
9. [Testes e QA](#9-testes-e-qa)
10. [Roadmap](#10-roadmap)
11. [Evolucao Arquitetural](#11-evolucao-arquitetural)
12. [Gaps e Recomendacoes Finais](#12-gaps-e-recomendacoes-finais)

---

## 1. Modelagem de Banco de Dados

### 1.1 Estrategia de Multi-Tenancy

O Vertix adota a estrategia de **Shared Database, Shared Schema** com isolamento a nivel de linha (Row-Level Isolation). Todas as tabelas de dominio possuem a coluna `tenant_id` que referencia a tabela `tenants`, garantindo que cada organizacao acesse exclusivamente seus proprios dados.

**Principios fundamentais:**

- **Isolamento por `tenant_id`**: Toda tabela de dominio possui a coluna `tenant_id` como chave estrangeira obrigatoria para a tabela `tenants`. Nenhuma query de leitura ou escrita e executada sem filtro por `tenant_id`.
- **Indices compostos**: Todos os modelos possuem, no minimo, um indice em `[tenantId]`. Tabelas com consultas frequentes por campos especificos possuem indices compostos como `[tenantId, status]`, `[tenantId, doctorId, appointmentDate]`, etc.
- **Politicas de acesso no ORM (Prisma)**: O `tenantId` e injetado automaticamente nos services via decorator `@TenantId()`. O guard `TenantGuard` valida que o tenant existe e esta ativo antes de qualquer operacao.
- **Soft delete padrao**: Embora o schema atual utilize `deletedAt` implicitamente via status (ex: `status = 'canceled'`), a recomendacao e migrar para soft delete explicito com coluna `deletedAt DateTime?` em todas as tabelas criticas.
- **Versionamento em tabelas criticas**: Tabelas como `LegalDocument` ja possuem campo `version Int @default(1)`. Prontuarios medicos (`ClinicMedicalRecord`) e contratos (`RealEstateDeal`) devem seguir a mesma estrategia para garantir rastreabilidade completa de alteracoes.
- **UUID como chave primaria**: Todas as tabelas utilizam UUID v4 como PK, evitando colisoes entre tenants e facilitando futuras migracoes ou merges de dados.

### 1.2 Tabelas Core

#### Tabela: `tenants`

**Objetivo:** Registrar cada organizacao (empresa/clinica/escritorio) que utiliza a plataforma.

| Campo | Tipo | PK/FK | Obrigatorio | Unico | Sensivel | Descricao |
|-------|------|-------|:-----------:|:-----:|:--------:|-----------|
| id | UUID | PK | Sim | Sim | Nao | Identificador unico do tenant |
| name | String | - | Sim | Nao | Nao | Nome da organizacao |
| slug | String | - | Sim | Sim | Nao | Identificador URL-friendly |
| status | String | - | Sim | Nao | Nao | active, suspended, canceled |
| plan | String | - | Sim | Nao | Nao | free, starter, professional, enterprise |
| createdAt | DateTime | - | Auto | Nao | Nao | Data de criacao |
| updatedAt | DateTime | - | Auto | Nao | Nao | Ultima atualizacao |

**Indices:** `@@unique([slug])`
**Auditoria:** Sim - alteracoes de status e plano devem ser registradas.
**Exclusao fisica permitida:** Nao. Utilizar status `canceled`.

#### Tabela: `users`

**Objetivo:** Armazenar usuarios do sistema com vinculacao a um tenant.

| Campo | Tipo | PK/FK | Obrigatorio | Unico | Sensivel | Descricao |
|-------|------|-------|:-----------:|:-----:|:--------:|-----------|
| id | UUID | PK | Sim | Sim | Nao | Identificador unico |
| tenantId | UUID | FK(tenants) | Sim | Nao | Nao | Tenant ao qual pertence |
| name | String | - | Sim | Nao | Nao | Nome completo |
| email | String | - | Sim | Nao | Sim | Email (unico por tenant) |
| passwordHash | String | - | Sim | Nao | Sim | Hash bcrypt da senha |
| status | String | - | Sim | Nao | Nao | active, inactive, suspended |
| createdAt | DateTime | - | Auto | Nao | Nao | Data de criacao |
| updatedAt | DateTime | - | Auto | Nao | Nao | Ultima atualizacao |

**Indices:** `@@index([tenantId])`, `@@unique([email, tenantId])`
**Auditoria:** Sim - criacao, alteracao de status, login.
**Constraint:** Email unico dentro do mesmo tenant (um email pode existir em tenants diferentes).

#### Tabela: `roles`

**Objetivo:** Definir papeis de acesso disponiveis no sistema.

| Campo | Tipo | PK/FK | Obrigatorio | Unico | Sensivel |
|-------|------|-------|:-----------:|:-----:|:--------:|
| id | UUID | PK | Sim | Sim | Nao |
| name | String | - | Sim | Sim | Nao |
| description | String | - | Nao | Nao | Nao |

**Papeis pre-definidos:** `super_admin`, `tenant_admin`, `clinic_doctor`, `clinic_receptionist`, `construction_manager`, `construction_worker`, `barbershop_barber`, `barbershop_receptionist`, `realestate_agent`, `realestate_manager`, `nutrition_professional`, `legal_lawyer`, `legal_assistant`, `restaurant_manager`, `restaurant_kitchen`, `aesthetic_professional`, `aesthetic_receptionist`, `dental_dentist`, `dental_receptionist`.

#### Tabela: `user_roles`

**Objetivo:** Associar usuarios a papeis (relacao N:N).

| Campo | Tipo | PK/FK | Obrigatorio | Unico |
|-------|------|-------|:-----------:|:-----:|
| id | UUID | PK | Sim | Sim |
| userId | UUID | FK(users) | Sim | Nao |
| roleId | UUID | FK(roles) | Sim | Nao |

**Constraint:** `@@unique([userId, roleId])` - impede duplicacao de associacao.
**Cascade:** `onDelete: Cascade` em ambas as FKs.

#### Tabela: `audit_logs`

**Objetivo:** Registrar acoes criticas de forma imutavel para conformidade e rastreabilidade.

| Campo | Tipo | PK/FK | Obrigatorio | Sensivel | Descricao |
|-------|------|-------|:-----------:|:--------:|-----------|
| id | UUID | PK | Sim | Nao | Identificador do log |
| tenantId | UUID | FK(tenants) | Sim | Nao | Tenant da acao |
| userId | UUID | FK(users) | Nao | Nao | Usuario que executou |
| action | String | - | Sim | Nao | CREATE, UPDATE, DELETE, LOGIN, LOGOUT |
| entity | String | - | Sim | Nao | Nome da entidade (Patient, Project, etc.) |
| entityId | UUID | - | Nao | Nao | ID do registro afetado |
| metadata | JSON | - | Nao | Sim | Payload, IP, user-agent |
| createdAt | DateTime | - | Auto | Nao | Timestamp imutavel |

**Indices:** `@@index([tenantId])`, `@@index([tenantId, entity])`
**Exclusao fisica permitida:** Nao. Tabela append-only.

#### Tabela: `notifications`

**Objetivo:** Armazenar notificacoes enviadas ou pendentes.

| Campo | Tipo | PK/FK | Obrigatorio | Descricao |
|-------|------|-------|:-----------:|-----------|
| id | UUID | PK | Sim | Identificador |
| tenantId | UUID | FK(tenants) | Sim | Tenant |
| userId | UUID | - | Nao | Destinatario |
| type | String | - | Sim | email, whatsapp, push |
| title | String | - | Sim | Titulo da notificacao |
| content | String | - | Sim | Corpo da mensagem |
| status | String | - | Sim | pending, sent, failed |
| metadata | JSON | - | Nao | Dados adicionais |
| createdAt | DateTime | - | Auto | Data de criacao |

**Indices:** `@@index([tenantId])`

#### Tabela: `subscription_plans`

**Objetivo:** Registrar assinaturas de planos dos tenants.

| Campo | Tipo | PK/FK | Obrigatorio | Descricao |
|-------|------|-------|:-----------:|-----------|
| id | UUID | PK | Sim | Identificador |
| tenantId | UUID | FK(tenants) | Sim | Tenant assinante |
| planName | String | - | Sim | Nome do plano |
| price | Decimal | - | Sim | Valor mensal (BRL) |
| currency | String | - | Sim | Moeda (padrao: BRL) |
| status | String | - | Sim | active, canceled, past_due |
| startDate | DateTime | - | Sim | Inicio da assinatura |
| endDate | DateTime | - | Nao | Fim (null = recorrente) |
| createdAt | DateTime | - | Auto | Data de criacao |
| updatedAt | DateTime | - | Auto | Ultima atualizacao |

**Indices:** `@@index([tenantId])`

#### Tabela: `attachments`

**Objetivo:** Metadados de arquivos armazenados no MinIO/S3.

| Campo | Tipo | PK/FK | Obrigatorio | Descricao |
|-------|------|-------|:-----------:|-----------|
| id | UUID | PK | Sim | Identificador |
| tenantId | UUID | FK(tenants) | Sim | Tenant proprietario |
| fileName | String | - | Sim | Nome original do arquivo |
| filePath | String | - | Sim | Caminho no MinIO/S3 |
| contentType | String | - | Sim | MIME type |
| size | Int | - | Sim | Tamanho em bytes |
| createdAt | DateTime | - | Auto | Data de upload |

**Indices:** `@@index([tenantId])`


### 1.3 Tabelas por Vertical

O Vertix possui 49 modelos distribuidos em 9 verticais de negocio, alem do nucleo (core). A tabela abaixo resume todos os modelos com suas classificacoes de sensibilidade e requisitos de auditoria.

| # | Modelo | Dominio | Tabela Fisica | Sensibilidade | Auditoria | Exclusao Fisica |
|---|--------|---------|---------------|:------------:|:---------:|:---------------:|
| 1 | Tenant | Core | tenants | Baixa | Sim | Nao |
| 2 | User | Core | users | Alta | Sim | Nao |
| 3 | Role | Core | roles | Media | Sim | Nao |
| 4 | UserRole | Core | user_roles | Media | Sim | Sim |
| 5 | AuditLog | Core | audit_logs | Alta | N/A | Nao |
| 6 | Notification | Core | notifications | Baixa | Nao | Sim |
| 7 | SubscriptionPlan | Core | subscription_plans | Media | Sim | Nao |
| 8 | Attachment | Core | attachments | Media | Sim | Nao |
| 9 | ClinicPatient | Clinica | clinic_patients | Alta (LGPD) | Sim | Nao |
| 10 | ClinicDoctor | Clinica | clinic_doctors | Media | Sim | Nao |
| 11 | ClinicAppointment | Clinica | clinic_appointments | Media | Sim | Nao |
| 12 | ClinicMedicalRecord | Clinica | clinic_medical_records | Critica (LGPD) | Sim | Nao |
| 13 | ClinicBilling | Clinica | clinic_billings | Alta | Sim | Nao |
| 14 | ConstructionProject | Construcao | construction_projects | Baixa | Sim | Nao |
| 15 | ConstructionTask | Construcao | construction_tasks | Baixa | Nao | Sim (cascade) |
| 16 | ConstructionExpense | Construcao | construction_expenses | Media | Sim | Sim (cascade) |
| 17 | ConstructionWorker | Construcao | construction_workers | Media | Sim | Nao |
| 18 | ConstructionProjectWorker | Construcao | construction_project_workers | Baixa | Nao | Sim (cascade) |
| 19 | BarbershopBarber | Barbearia | barbershop_barbers | Media | Sim | Nao |
| 20 | BarbershopService | Barbearia | barbershop_services | Baixa | Nao | Nao |
| 21 | BarbershopClient | Barbearia | barbershop_clients | Media (LGPD) | Sim | Nao |
| 22 | BarbershopBooking | Barbearia | barbershop_bookings | Baixa | Sim | Nao |
| 23 | BarbershopBookingService | Barbearia | barbershop_booking_services | Baixa | Nao | Sim (cascade) |
| 24 | BarbershopProduct | Barbearia | barbershop_products | Baixa | Nao | Nao |
| 25 | BarbershopOrder | Barbearia | barbershop_orders | Media | Sim | Nao |
| 26 | BarbershopOrderItem | Barbearia | barbershop_order_items | Baixa | Nao | Sim (cascade) |
| 27 | RealEstateProperty | Imobiliaria | real_estate_properties | Baixa | Sim | Nao |
| 28 | RealEstateClient | Imobiliaria | real_estate_clients | Alta (LGPD) | Sim | Nao |
| 29 | RealEstateVisit | Imobiliaria | real_estate_visits | Baixa | Nao | Nao |
| 30 | RealEstateDeal | Imobiliaria | real_estate_deals | Alta | Sim | Nao |
| 31 | NutritionPatient | Nutricao | nutrition_patients | Alta (LGPD) | Sim | Nao |
| 32 | NutritionPlan | Nutricao | nutrition_plans | Media | Sim | Nao |
| 33 | NutritionMeal | Nutricao | nutrition_meals | Baixa | Nao | Sim (cascade) |
| 34 | NutritionAppointment | Nutricao | nutrition_appointments | Media | Sim | Nao |
| 35 | NutritionMeasurement | Nutricao | nutrition_measurements | Alta (LGPD) | Sim | Nao |
| 36 | LegalClient | Juridico | legal_clients | Alta (LGPD) | Sim | Nao |
| 37 | LegalCase | Juridico | legal_cases | Critica | Sim | Nao |
| 38 | LegalDocument | Juridico | legal_documents | Critica | Sim | Nao |
| 39 | LegalTask | Juridico | legal_tasks | Media | Nao | Sim (cascade) |
| 40 | LegalBilling | Juridico | legal_billings | Alta | Sim | Nao |
| 41 | RestaurantCategory | Restaurante | restaurant_categories | Baixa | Nao | Nao |
| 42 | RestaurantMenuItem | Restaurante | restaurant_menu_items | Baixa | Nao | Nao |
| 43 | RestaurantOrder | Restaurante | restaurant_orders | Media | Sim | Nao |
| 44 | RestaurantOrderItem | Restaurante | restaurant_order_items | Baixa | Nao | Sim (cascade) |
| 45 | RestaurantDriver | Restaurante | restaurant_drivers | Media | Sim | Nao |
| 46 | AestheticClient | Estetica | aesthetic_clients | Alta (LGPD) | Sim | Nao |
| 47 | AestheticProcedure | Estetica | aesthetic_procedures | Baixa | Nao | Nao |
| 48 | AestheticAppointment | Estetica | aesthetic_appointments | Media | Sim | Nao |
| 49 | AestheticPackage | Estetica | aesthetic_packages | Baixa | Nao | Nao |
| 50 | AestheticPackageProcedure | Estetica | aesthetic_package_procedures | Baixa | Nao | Sim (cascade) |
| 51 | AestheticBilling | Estetica | aesthetic_billings | Alta | Sim | Nao |
| 52 | DentalPatient | Odontologia | dental_patients | Alta (LGPD) | Sim | Nao |
| 53 | DentalDentist | Odontologia | dental_dentists | Media | Sim | Nao |
| 54 | DentalTreatment | Odontologia | dental_treatments | Baixa | Nao | Nao |
| 55 | DentalAppointment | Odontologia | dental_appointments | Media | Sim | Nao |
| 56 | DentalTreatmentPlan | Odontologia | dental_treatment_plans | Alta | Sim | Nao |
| 57 | DentalTreatmentPlanItem | Odontologia | dental_treatment_plan_items | Media | Nao | Sim (cascade) |
| 58 | DentalBilling | Odontologia | dental_billings | Alta | Sim | Nao |

### 1.4 Estrategias de Indice

Indices criticos ja implementados no schema Prisma, organizados por frequencia de consulta:

| Consulta Critica | Indice Recomendado | Justificativa |
|-----------------|-------------------|---------------|
| Listar recursos por tenant | `@@index([tenantId])` | Presente em TODAS as tabelas. Filtro basico obrigatorio. |
| Agendamentos por medico e data | `@@index([tenantId, doctorId, appointmentDate])` | Consulta mais frequente na clinica. |
| Agendamentos barbearia por barbeiro | `@@index([tenantId, barberId, bookingDate])` | Calendario do barbeiro. |
| Tarefas por projeto | `@@index([tenantId, projectId])` | Listagem de tarefas dentro de obra. |
| Despesas por projeto | `@@index([tenantId, projectId])` | Relatorio financeiro da obra. |
| Prontuarios por paciente | `@@index([tenantId, patientId])` | Historico do paciente. |
| Audit logs por entidade | `@@index([tenantId, entity])` | Buscar acoes sobre entidade especifica. |
| Imoveis por status | `@@index([tenantId, status])` | Filtro de imoveis disponiveis. |
| Casos juridicos por status | `@@index([tenantId, status])` | Filtro de casos ativos. |
| Pedidos restaurante por status | `@@index([tenantId, status])` | Fila de preparo e entrega. |
| Consultas dentarias por dentista | `@@index([tenantId, dentistId, appointmentDate])` | Agenda do dentista. |

**Indices futuros recomendados:**

| Tabela | Indice | Motivo |
|--------|--------|--------|
| clinic_patients | `@@index([tenantId, cpf])` | Busca rapida por CPF |
| clinic_patients | `@@index([tenantId, name])` | Busca por nome (search) |
| legal_cases | `@@index([tenantId, caseNumber])` | Busca por numero do processo |
| restaurant_orders | `@@index([tenantId, orderNumber])` | Busca por numero do pedido |
| real_estate_properties | `@@index([tenantId, city, type])` | Filtro de imoveis por cidade e tipo |
| nutrition_patients | `@@index([tenantId, cpf])` | Busca por CPF do paciente |
| dental_patients | `@@index([tenantId, cpf])` | Busca por CPF |

### 1.5 Migracoes e Seeds

#### Estrategia de Migracao

O Vertix utiliza **Prisma Migrate** para gerenciar o esquema do banco de dados:

- **Desenvolvimento:** `npx prisma migrate dev` - cria e aplica migracoes automaticamente com nome descritivo.
- **Staging:** `npx prisma migrate deploy` - aplica migracoes pendentes sem gerar novas.
- **Producao:** `npx prisma migrate deploy` - executado no pipeline CI/CD antes do deploy da aplicacao.
- **Rollback:** Prisma nao suporta rollback nativo. Cada rollback requer uma nova migracao reversa. Para situacoes criticas, manter backup do banco antes de cada deploy.

**Convencoes de nomenclatura de migracao:**
```
YYYYMMDDHHMMSS_descricao_da_alteracao
Exemplo: 20260406120000_add_dental_module
```

**Regras:**
1. Nunca editar migracoes ja aplicadas em producao.
2. Sempre testar migracoes em staging antes de producao.
3. Migracoes destrutivas (DROP COLUMN, DROP TABLE) devem ser feitas em duas etapas: primeiro deprecar, depois remover.
4. Dados DEFAULT devem ser inseridos via migracao, nao via seed.

#### Estrategia de Seed por Ambiente

| Ambiente | Seed | Descricao |
|----------|------|-----------|
| Desenvolvimento | `prisma/seed.ts` | Dados completos de demonstracao para todos os verticais |
| Staging | Seed parcial | Apenas roles e tenant de teste. Dados inseridos via testes automatizados. |
| Producao | Seed minimo | Apenas roles do sistema e planos de assinatura. NUNCA dados de demonstracao. |

**Dados de seed para desenvolvimento incluem:**
- 1 Super Admin (admin@vertix.com / Admin@123)
- Tenant "Clinica Sao Paulo" com medicos, pacientes, agendamentos e faturamento
- Tenant "Construtora Aurora" com projetos, tarefas, despesas e trabalhadores
- Tenant de barbearia com barbeiros, servicos, clientes e agendamentos
- Roles pre-definidos para todos os verticais


---

## 2. Especificacao da API

### 2.1 Convencoes Gerais

| Aspecto | Convencao |
|---------|-----------|
| **Prefixo global** | `/api` |
| **Versionamento** | Sem versao no path. Evolucao via headers `Accept-Version` quando necessario. |
| **Autenticacao** | Bearer JWT no header `Authorization: Bearer <token>` |
| **Identificacao do Tenant** | Via JWT payload (`tenantId`). Nao e necessario enviar tenant no path ou query. |
| **Formato** | JSON (`application/json`) em request e response. |
| **Paginacao** | `?page=1&limit=10` - Padrao: page=1, limit=10, max=100. |
| **Filtros** | Query parameters: `?status=active&search=nome` |
| **Ordenacao** | `?sort=createdAt&order=desc` - Padrao: createdAt DESC. |
| **Resposta de lista** | `{ data: [...], total: N, page: N, limit: N, totalPages: N }` |
| **Resposta de item** | `{ data: { ... } }` |
| **Resposta de acao** | `{ message: "Recurso criado com sucesso" }` |
| **Resposta de erro** | `{ success: false, statusCode: 400, message: "Descricao", timestamp: "ISO8601" }` |
| **Rate limit** | 100 requisicoes por 15 minutos por IP (configuravel via env). |
| **Idempotencia** | Header `Idempotency-Key` para POSTs criticos (pagamentos, registros). |
| **CORS** | Configuravel via `CORS_ORIGINS` no `.env`. |
| **Documentacao** | Swagger/OpenAPI em `/api/docs`. |

**Codigos de resposta padrao:**

| Codigo | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Leitura e atualizacao bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Validacao de dados falhou (class-validator) |
| 401 | Unauthorized | Token ausente, expirado ou invalido |
| 403 | Forbidden | Sem permissao (role insuficiente ou tenant inativo) |
| 404 | Not Found | Recurso nao encontrado (dentro do tenant) |
| 409 | Conflict | Duplicata (ex: email ja cadastrado no tenant) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro nao tratado no servidor |

### 2.2 Endpoints Core

#### Autenticacao (`/api/auth`)

| Metodo | Rota | Descricao | Auth | Roles | Payload | Response | Efeitos Colaterais |
|--------|------|-----------|:----:|-------|---------|----------|--------------------|
| POST | `/api/auth/login` | Login com email e senha | Nao | - | `{ email, password }` | `{ access_token, user: { id, name, email, tenantId, roles } }` | Cria audit_log LOGIN |
| POST | `/api/auth/register-initial-tenant-admin` | Registra novo tenant + admin | Nao | - | `{ tenantName, tenantSlug, userName, email, password }` | `{ access_token, user, tenant }` | Cria tenant, user, user_role, audit_log |
| GET | `/api/auth/me` | Dados do usuario autenticado | Sim | Qualquer | - | `{ data: { id, name, email, tenantId, roles } }` | - |
| POST | `/api/auth/refresh` | Renovar access token | Sim | Qualquer | `{ refresh_token }` | `{ access_token }` | (futuro) |
| POST | `/api/auth/forgot-password` | Solicitar reset de senha | Nao | - | `{ email }` | `{ message }` | Envia email com link (futuro) |

#### Usuarios (`/api/users`)

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| GET | `/api/users` | Listar usuarios do tenant (paginado) | super_admin, tenant_admin |
| GET | `/api/users/:id` | Buscar usuario por ID | super_admin, tenant_admin |
| POST | `/api/users` | Criar novo usuario no tenant | super_admin, tenant_admin |
| PUT | `/api/users/:id` | Atualizar usuario | super_admin, tenant_admin |
| DELETE | `/api/users/:id` | Desativar usuario (soft delete via status) | super_admin, tenant_admin |

**Payload POST/PUT:** `{ name, email, password?, status?, roleIds? }`
**Filtros GET:** `?page, limit, search (nome/email), status`

#### Tenants (`/api/tenants`)

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| GET | `/api/tenants` | Listar todos os tenants | super_admin |
| GET | `/api/tenants/:id` | Buscar tenant por ID | super_admin, tenant_admin (proprio) |
| PUT | `/api/tenants/:id` | Atualizar tenant | super_admin, tenant_admin (proprio) |
| DELETE | `/api/tenants/:id` | Desativar tenant | super_admin |

#### Roles (`/api/roles`)

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| GET | `/api/roles` | Listar roles disponiveis | super_admin, tenant_admin |
| POST | `/api/roles/:userId/assign/:roleId` | Atribuir role a usuario | super_admin, tenant_admin |
| DELETE | `/api/roles/:userId/remove/:roleId` | Remover role de usuario | super_admin, tenant_admin |

#### Auditoria (`/api/audit`)

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| GET | `/api/audit` | Listar logs de auditoria (paginado) | super_admin, tenant_admin |

**Filtros:** `?page, limit, action, entity, userId, dateFrom, dateTo`

#### Notificacoes (`/api/notifications`)

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| GET | `/api/notifications` | Listar notificacoes do tenant (paginado) | Qualquer autenticado |

#### Billing (`/api/billing`)

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| GET | `/api/billing/plans` | Listar planos disponiveis | Qualquer autenticado |
| GET | `/api/billing/subscription` | Assinatura atual do tenant | Qualquer autenticado |

#### Health e Metricas

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|:----:|
| GET | `/api/health` | Health check (verifica banco, Redis, MinIO) | Nao |
| GET | `/api/metrics` | Metricas Prometheus | Nao (proteger em producao) |

### 2.3 Endpoints por Vertical

#### Clinica Medica

| Metodo | Rota | Roles |
|--------|------|-------|
| GET | `/api/clinic/patients` | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/patients/:id` | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/patients` | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/patients/:id` | tenant_admin, clinic_receptionist |
| DELETE | `/api/clinic/patients/:id` | tenant_admin |
| GET | `/api/clinic/doctors` | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/doctors/:id` | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/doctors` | tenant_admin |
| PUT | `/api/clinic/doctors/:id` | tenant_admin |
| DELETE | `/api/clinic/doctors/:id` | tenant_admin |
| GET | `/api/clinic/appointments` | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/appointments/:id` | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/appointments` | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/appointments/:id` | tenant_admin, clinic_doctor, clinic_receptionist |
| DELETE | `/api/clinic/appointments/:id` | tenant_admin |
| GET | `/api/clinic/medical-records` | tenant_admin, clinic_doctor |
| GET | `/api/clinic/medical-records/:id` | tenant_admin, clinic_doctor |
| POST | `/api/clinic/medical-records` | tenant_admin, clinic_doctor |
| PUT | `/api/clinic/medical-records/:id` | tenant_admin, clinic_doctor |
| DELETE | `/api/clinic/medical-records/:id` | tenant_admin |
| GET | `/api/clinic/billing/dashboard` | tenant_admin, clinic_receptionist |
| GET | `/api/clinic/billing` | tenant_admin, clinic_receptionist |
| GET | `/api/clinic/billing/:id` | tenant_admin, clinic_receptionist |
| POST | `/api/clinic/billing` | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/billing/:id` | tenant_admin, clinic_receptionist |
| DELETE | `/api/clinic/billing/:id` | tenant_admin |

#### Construcao Civil

| Metodo | Rota | Roles |
|--------|------|-------|
| GET | `/api/construction/projects/dashboard` | tenant_admin, construction_manager |
| GET | `/api/construction/projects` | tenant_admin, construction_manager, construction_worker |
| GET | `/api/construction/projects/:id` | tenant_admin, construction_manager, construction_worker |
| POST | `/api/construction/projects` | tenant_admin, construction_manager |
| PUT | `/api/construction/projects/:id` | tenant_admin, construction_manager |
| DELETE | `/api/construction/projects/:id` | tenant_admin |
| GET | `/api/construction/tasks` | tenant_admin, construction_manager, construction_worker |
| GET | `/api/construction/tasks/:id` | tenant_admin, construction_manager, construction_worker |
| POST | `/api/construction/tasks` | tenant_admin, construction_manager |
| PUT | `/api/construction/tasks/:id` | tenant_admin, construction_manager |
| DELETE | `/api/construction/tasks/:id` | tenant_admin, construction_manager |
| GET | `/api/construction/expenses` | tenant_admin, construction_manager |
| GET | `/api/construction/expenses/:id` | tenant_admin, construction_manager |
| POST | `/api/construction/expenses` | tenant_admin, construction_manager |
| PUT | `/api/construction/expenses/:id` | tenant_admin, construction_manager |
| DELETE | `/api/construction/expenses/:id` | tenant_admin, construction_manager |
| GET | `/api/construction/workers` | tenant_admin, construction_manager |
| GET | `/api/construction/workers/:id` | tenant_admin, construction_manager |
| POST | `/api/construction/workers` | tenant_admin, construction_manager |
| PUT | `/api/construction/workers/:id` | tenant_admin, construction_manager |
| DELETE | `/api/construction/workers/:id` | tenant_admin, construction_manager |
| POST | `/api/construction/workers/:id/allocate/:projectId` | tenant_admin, construction_manager |

#### Barbearia

| Metodo | Rota | Roles |
|--------|------|-------|
| GET | `/api/barbershop/barbers` | Qualquer autenticado |
| GET | `/api/barbershop/barbers/:id` | Qualquer autenticado |
| POST | `/api/barbershop/barbers` | tenant_admin |
| PUT | `/api/barbershop/barbers/:id` | tenant_admin |
| GET | `/api/barbershop/services` | Qualquer autenticado |
| POST | `/api/barbershop/services` | tenant_admin |
| PUT | `/api/barbershop/services/:id` | tenant_admin |
| DELETE | `/api/barbershop/services/:id` | tenant_admin |
| GET | `/api/barbershop/clients` | barbershop_barber, barbershop_receptionist, tenant_admin |
| GET | `/api/barbershop/clients/:id` | barbershop_barber, barbershop_receptionist, tenant_admin |
| POST | `/api/barbershop/clients` | barbershop_barber, barbershop_receptionist, tenant_admin |
| PUT | `/api/barbershop/clients/:id` | barbershop_receptionist, tenant_admin |
| GET | `/api/barbershop/bookings` | barbershop_barber, barbershop_receptionist, tenant_admin |
| POST | `/api/barbershop/bookings` | barbershop_barber, barbershop_receptionist, tenant_admin |
| PATCH | `/api/barbershop/bookings/:id/status` | barbershop_barber, barbershop_receptionist, tenant_admin |
| GET | `/api/barbershop/bookings/available-slots` | Qualquer autenticado |
| GET | `/api/barbershop/products` | barbershop_barber, barbershop_receptionist, tenant_admin |
| POST | `/api/barbershop/products` | tenant_admin |
| PUT | `/api/barbershop/products/:id` | tenant_admin |
| PATCH | `/api/barbershop/products/:id/stock` | tenant_admin |
| GET | `/api/barbershop/orders` | barbershop_barber, barbershop_receptionist, tenant_admin |
| POST | `/api/barbershop/orders` | barbershop_barber, barbershop_receptionist, tenant_admin |
| POST | `/api/barbershop/orders/:id/items` | barbershop_barber, barbershop_receptionist |
| PATCH | `/api/barbershop/orders/:id/close` | barbershop_barber, barbershop_receptionist, tenant_admin |

#### Imobiliaria

| Metodo | Rota | Roles |
|--------|------|-------|
| GET | `/api/realestate/properties` | realestate_agent, realestate_manager, tenant_admin |
| GET | `/api/realestate/properties/:id` | realestate_agent, realestate_manager, tenant_admin |
| POST | `/api/realestate/properties` | realestate_manager, tenant_admin |
| PUT | `/api/realestate/properties/:id` | realestate_manager, tenant_admin |
| DELETE | `/api/realestate/properties/:id` | tenant_admin |
| GET | `/api/realestate/clients` | realestate_agent, realestate_manager, tenant_admin |
| GET | `/api/realestate/clients/:id` | realestate_agent, realestate_manager, tenant_admin |
| POST | `/api/realestate/clients` | realestate_agent, realestate_manager, tenant_admin |
| PUT | `/api/realestate/clients/:id` | realestate_agent, realestate_manager, tenant_admin |
| DELETE | `/api/realestate/clients/:id` | tenant_admin |
| GET | `/api/realestate/visits` | realestate_agent, realestate_manager, tenant_admin |
| POST | `/api/realestate/visits` | realestate_agent, realestate_manager, tenant_admin |
| PUT | `/api/realestate/visits/:id` | realestate_agent, realestate_manager, tenant_admin |
| GET | `/api/realestate/deals` | realestate_agent, realestate_manager, tenant_admin |
| POST | `/api/realestate/deals` | realestate_manager, tenant_admin |
| PUT | `/api/realestate/deals/:id` | realestate_manager, tenant_admin |

#### Nutricao

| Metodo | Rota | Roles |
|--------|------|-------|
| GET/POST/PUT/DELETE | `/api/nutrition/patients[/:id]` | nutrition_professional, tenant_admin |
| GET/POST/PUT/DELETE | `/api/nutrition/plans[/:id]` | nutrition_professional, tenant_admin |
| GET/POST/PUT/DELETE | `/api/nutrition/meals[/:id]` | nutrition_professional, tenant_admin |
| GET/POST/PUT/DELETE | `/api/nutrition/appointments[/:id]` | nutrition_professional, tenant_admin |
| GET/POST/PUT/DELETE | `/api/nutrition/measurements[/:id]` | nutrition_professional, tenant_admin |

#### Juridico

| Metodo | Rota | Roles |
|--------|------|-------|
| GET/POST/PUT/DELETE | `/api/legal/clients[/:id]` | legal_lawyer, legal_assistant, tenant_admin |
| GET/POST/PUT/DELETE | `/api/legal/cases[/:id]` | legal_lawyer, legal_assistant, tenant_admin |
| GET/POST/PUT/DELETE | `/api/legal/documents[/:id]` | legal_lawyer, tenant_admin |
| GET/POST/PUT/DELETE | `/api/legal/tasks[/:id]` | legal_lawyer, legal_assistant, tenant_admin |
| GET/POST/PUT/DELETE | `/api/legal/billings[/:id]` | legal_lawyer, tenant_admin |

#### Restaurante / Dark Kitchen

| Metodo | Rota | Roles |
|--------|------|-------|
| GET/POST/PUT/DELETE | `/api/restaurant/categories[/:id]` | restaurant_manager, tenant_admin |
| GET/POST/PUT/DELETE | `/api/restaurant/menu-items[/:id]` | restaurant_manager, tenant_admin |
| GET/POST | `/api/restaurant/orders[/:id]` | restaurant_manager, restaurant_kitchen, tenant_admin |
| PATCH | `/api/restaurant/orders/:id/status` | restaurant_manager, restaurant_kitchen, tenant_admin |
| GET/POST/PUT | `/api/restaurant/drivers[/:id]` | restaurant_manager, tenant_admin |
| PATCH | `/api/restaurant/drivers/:id/status` | restaurant_manager, tenant_admin |

#### Estetica

| Metodo | Rota | Roles |
|--------|------|-------|
| GET/POST/PUT/DELETE | `/api/aesthetic/clients[/:id]` | aesthetic_professional, aesthetic_receptionist, tenant_admin |
| GET/POST/PUT/DELETE | `/api/aesthetic/procedures[/:id]` | aesthetic_professional, tenant_admin |
| GET/POST/PUT/DELETE | `/api/aesthetic/appointments[/:id]` | aesthetic_professional, aesthetic_receptionist, tenant_admin |
| GET/POST/PUT/DELETE | `/api/aesthetic/packages[/:id]` | aesthetic_professional, tenant_admin |
| GET/POST/PUT/DELETE | `/api/aesthetic/billings[/:id]` | aesthetic_receptionist, tenant_admin |

#### Odontologia

| Metodo | Rota | Roles |
|--------|------|-------|
| GET/POST/PUT/DELETE | `/api/dental/patients[/:id]` | dental_dentist, dental_receptionist, tenant_admin |
| GET/POST/PUT/DELETE | `/api/dental/dentists[/:id]` | tenant_admin |
| GET/POST/PUT/DELETE | `/api/dental/treatments[/:id]` | dental_dentist, tenant_admin |
| GET/POST/PUT/DELETE | `/api/dental/appointments[/:id]` | dental_dentist, dental_receptionist, tenant_admin |
| GET/POST/PUT/DELETE | `/api/dental/treatment-plans[/:id]` | dental_dentist, tenant_admin |
| GET/POST/PUT/DELETE | `/api/dental/billings[/:id]` | dental_receptionist, tenant_admin |

#### IA

| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|
| POST | `/api/ai/clinic/summary` | Resumo de consulta clinica | Qualquer autenticado |
| POST | `/api/ai/construction/risk` | Analise de risco de projeto | Qualquer autenticado |
| POST | `/api/ai/legal/analysis` | Analise de documento juridico (futuro) | legal_lawyer, tenant_admin |
| POST | `/api/ai/nutrition/suggestion` | Sugestao de cardapio (futuro) | nutrition_professional |
| POST | `/api/ai/dental/treatment-suggestion` | Sugestao de tratamento (futuro) | dental_dentist |

### 2.4 Swagger/OpenAPI

A documentacao interativa da API e gerada automaticamente pelo NestJS Swagger e esta disponivel em `/api/docs`.

**Configuracao:**
- **Tags:** Organizadas por modulo (Auth, Users, Tenants, Clinic - Patients, Construction - Projects, etc.).
- **DTOs:** Cada endpoint possui schema de request e response documentado com exemplos.
- **Autenticacao:** Configurada com Bearer token via botao "Authorize" no Swagger UI.
- **Modelos:** Schemas de todas as entidades expostos na secao "Schemas".
- **Exemplos:** Cada DTO possui valores de exemplo para facilitar testes interativos.
- **Respostas:** Codigos 200, 201, 400, 401, 403, 404 documentados por endpoint.


---

## 3. Especificacao do Frontend

### 3.1 Mapa de Rotas

O frontend e construido com **Next.js 14** (App Router) e segue a seguinte estrutura de rotas:

```
/auth/login                          -- Tela de login
/auth/register                       -- Registro de novo tenant

/dashboard                           -- Dashboard principal (redireciona para vertical ativa)

/clinic/patients                     -- Listagem de pacientes
/clinic/patients/:id                 -- Detalhes/edicao de paciente
/clinic/doctors                      -- Listagem de medicos
/clinic/doctors/:id                  -- Detalhes/edicao de medico
/clinic/appointments                 -- Agenda de consultas
/clinic/appointments/:id             -- Detalhes do agendamento
/clinic/records                      -- Prontuarios medicos
/clinic/records/:id                  -- Detalhe do prontuario
/clinic/billing                      -- Faturamento da clinica
/clinic/billing/dashboard            -- Dashboard financeiro

/construction/projects               -- Listagem de projetos/obras
/construction/projects/:id           -- Detalhes do projeto
/construction/tasks                  -- Tarefas de obras
/construction/expenses               -- Despesas
/construction/workers                -- Trabalhadores

/barbershop/barbers                  -- Barbeiros
/barbershop/clients                  -- Clientes
/barbershop/services                 -- Servicos
/barbershop/bookings                 -- Agendamentos
/barbershop/products                 -- Produtos (estoque)
/barbershop/orders                   -- Comandas

/realestate/properties               -- Imoveis
/realestate/properties/:id           -- Detalhe do imovel
/realestate/clients                  -- Clientes
/realestate/visits                   -- Visitas
/realestate/deals                    -- Negocios/Contratos

/nutrition/patients                  -- Pacientes
/nutrition/plans                     -- Planos alimentares
/nutrition/plans/:id                 -- Detalhe do plano com refeicoes
/nutrition/meals                     -- Refeicoes (dentro de plano)
/nutrition/appointments              -- Consultas nutricionais
/nutrition/measurements              -- Medicoes corporais

/legal/clients                       -- Clientes do escritorio
/legal/cases                         -- Processos
/legal/cases/:id                     -- Detalhe do processo
/legal/documents                     -- Documentos juridicos
/legal/tasks                         -- Tarefas e prazos
/legal/billings                      -- Honorarios e despesas

/restaurant/categories               -- Categorias do cardapio
/restaurant/menu-items               -- Itens do cardapio
/restaurant/orders                   -- Pedidos (painel de controle)
/restaurant/drivers                  -- Entregadores

/aesthetic/clients                   -- Clientes
/aesthetic/procedures                -- Procedimentos
/aesthetic/appointments              -- Agendamentos
/aesthetic/packages                  -- Pacotes de sessoes
/aesthetic/billings                  -- Faturamento

/dental/patients                     -- Pacientes
/dental/dentists                     -- Dentistas
/dental/treatments                   -- Tratamentos
/dental/appointments                 -- Agenda
/dental/treatment-plans              -- Planos de tratamento
/dental/billings                     -- Faturamento

/settings                            -- Configuracoes do tenant
/settings/users                      -- Gestao de usuarios
/settings/billing                    -- Assinatura e plano
/settings/audit                      -- Logs de auditoria
```

### 3.2 Design System Vertix

#### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#6366F1` (Indigo 500) | Botoes primarios, links, icones ativos |
| `--primary-dark` | `#4F46E5` (Indigo 600) | Hover em botoes primarios |
| `--primary-light` | `#818CF8` (Indigo 400) | Backgrounds sutis, badges |
| `--accent` | `#8B5CF6` (Violet 500) | Gradient com primary, destaques |
| `--accent-dark` | `#7C3AED` (Violet 600) | Hover em destaques |
| `--bg-light` | `#FFFFFF` | Background principal (light mode) |
| `--bg-dark` | `#0F172A` (Slate 900) | Background principal (dark mode) |
| `--surface-light` | `#F8FAFC` (Slate 50) | Cards e superficies (light) |
| `--surface-dark` | `#1E293B` (Slate 800) | Cards e superficies (dark) |
| `--text-primary` | `#0F172A` / `#F8FAFC` | Texto principal |
| `--text-secondary` | `#64748B` (Slate 500) | Texto secundario |
| `--danger` | `#EF4444` (Red 500) | Erros, acoes destrutivas |
| `--warning` | `#F59E0B` (Amber 500) | Alertas, status pendente |
| `--info` | `#3B82F6` (Blue 500) | Informacoes, status em progresso |
| `--success` | `#6366F1` (Indigo 500) | Sucesso (NUNCA verde - branding) |

**IMPORTANTE:** O Vertix NAO utiliza verde em nenhum elemento visual. O sucesso e representado pela cor primaria (Indigo).

#### Gradiente Principal

```css
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
```

Utilizado em: header do sidebar, botoes de destaque, backgrounds de hero sections e splash screens.

#### Dark/Light Mode

Implementado via CSS variables trocadas por classe no `<html>`:
- `<html class="light">` - Modo claro (padrao)
- `<html class="dark">` - Modo escuro
- Preferencia salva em `localStorage.theme`
- Respeita `prefers-color-scheme` do sistema na primeira visita

#### Tipografia

| Elemento | Font | Size | Weight |
|----------|------|------|--------|
| h1 | Inter | 30px (1.875rem) | 700 (Bold) |
| h2 | Inter | 24px (1.5rem) | 600 (Semibold) |
| h3 | Inter | 20px (1.25rem) | 600 (Semibold) |
| Body | Inter | 14px (0.875rem) | 400 (Regular) |
| Small | Inter | 12px (0.75rem) | 400 (Regular) |
| Button | Inter | 14px (0.875rem) | 500 (Medium) |

#### Componentes Base

| Componente | Descricao | Props Principais |
|-----------|-----------|-----------------|
| `DataTable` | Tabela generica com paginacao, busca e ordenacao | `columns, data, total, page, onPageChange, onSearch, actions` |
| `Modal` | Dialog modal para formularios e confirmacoes | `isOpen, onClose, title, size, children` |
| `StatsCard` | Card com icone, titulo, valor e variacao | `title, value, icon, change, changeType` |
| `StatusBadge` | Badge colorido para status de registros | `status, variant` |
| `PageHeader` | Cabecalho de pagina com titulo, breadcrumb e acoes | `title, subtitle, actions, breadcrumb` |
| `Sidebar` | Menu lateral com navegacao por modulo | `modules, activeRoute, collapsed` |
| `Header` | Barra superior com busca, notificacoes e perfil | `user, notifications, onSearch` |
| `FormField` | Campo de formulario com label, input e erro | `label, type, error, required, ...inputProps` |
| `ConfirmDialog` | Dialog de confirmacao para acoes destrutivas | `title, message, onConfirm, onCancel, variant` |
| `EmptyState` | Estado vazio com icone e acao | `icon, title, description, actionLabel, onAction` |
| `LoadingSpinner` | Indicador de carregamento | `size, fullScreen` |
| `Toast` | Notificacao temporaria | `type, message, duration` |

#### Espacamento e Grid

- **Espacamento:** Tailwind CSS default scale (4px base: `p-1` = 4px, `p-2` = 8px, etc.)
- **Border radius:** `rounded-lg` (8px) para cards, `rounded-md` (6px) para inputs, `rounded-full` para avatares
- **Sombras:** `shadow-sm` para cards, `shadow-lg` para modais e dropdowns
- **Grid:** CSS Grid com `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` para dashboards

#### Icones

Biblioteca: **Lucide React** (`lucide-react`)

Icones principais por modulo:
- Core: `Settings, Users, Shield, Bell, CreditCard, FileText`
- Clinica: `Stethoscope, UserPlus, Calendar, ClipboardList, DollarSign`
- Construcao: `HardHat, Layers, Receipt, Users, MapPin`
- Barbearia: `Scissors, User, Clock, Package, ShoppingCart`
- Imobiliaria: `Home, Users, Eye, Handshake`
- Nutricao: `Apple, ClipboardList, Utensils, Calendar, Ruler`
- Juridico: `Scale, Briefcase, FileText, CheckSquare, DollarSign`
- Restaurante: `UtensilsCrossed, ShoppingBag, Truck, ChefHat`
- Estetica: `Sparkles, Syringe, Calendar, Package, DollarSign`
- Odontologia: `SmilePlus, User, Wrench, Calendar, ClipboardList, DollarSign`

### 3.3 Estrategias de Implementacao

#### Gerenciamento de Estado

- **Estado local:** `useState` e `useReducer` para estado de componentes.
- **Autenticacao:** Token JWT armazenado em `localStorage`. Contexto `AuthContext` disponibiliza `user`, `login()`, `logout()`, `isAuthenticated`.
- **Dados do servidor:** Fetch via `fetch()` com wrapper `api.ts` que injeta o token automaticamente. Sem React Query no MVP - fetch direto com `useEffect`.
- **Cache:** Nao implementado no MVP. Futuro: React Query ou SWR para cache e revalidacao automatica.

#### Formularios

- **Estrategia:** Controlled components com `useState`.
- **Validacao:** Client-side basica (required, email format, min/max length). Validacao completa no backend via `class-validator`.
- **Submissao:** Feedback visual com loading state no botao, toast de sucesso/erro.
- **Reutilizacao:** Formularios compartilham componentes `FormField`, `Select`, `DatePicker`.

#### Tabelas (DataTable)

O componente `DataTable` e a peca central de todas as telas de listagem:

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];     // Definicao das colunas
  data: T[];                    // Array de dados
  total: number;                // Total de registros (para paginacao)
  page: number;                 // Pagina atual
  limit: number;                // Itens por pagina
  onPageChange: (page: number) => void;
  onSearch?: (search: string) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  actions?: (row: T) => ReactNode;  // Coluna de acoes
  emptyMessage?: string;
  loading?: boolean;
}
```

#### Autenticacao na UI

1. **Login:** Formulario envia POST para `/api/auth/login`. Token salvo em `localStorage`.
2. **Verificacao:** Layout principal verifica `localStorage.token` e decodifica payload JWT.
3. **Protecao de rotas:** Middleware no `layout.tsx` redireciona para `/auth/login` se nao autenticado.
4. **Exibicao de modulos:** Sidebar mostra apenas modulos permitidos pelas roles do usuario.
5. **Logout:** Remove token do `localStorage` e redireciona para login.
6. **Expiracao:** Se API retornar 401, interceptor faz logout automatico.

#### Responsividade

- **Abordagem:** Mobile-first com breakpoints do Tailwind (`sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`).
- **Sidebar:** Colapsavel em telas menores, overlay em mobile.
- **Tabelas:** Scroll horizontal em telas pequenas. Cards em mobile para dados criticos.
- **Formularios:** Full-width em mobile, multi-coluna em desktop.
- **Modais:** Full-screen em mobile, centered overlay em desktop.

### 3.4 Telas por Modulo

#### Dashboard Principal

- **Objetivo:** Visao geral dos KPIs da vertical ativa do tenant.
- **Dados:** Contadores (total de registros, pendencias), graficos de evolucao, proximos agendamentos.
- **Acoes:** Acesso rapido a criacao de registros, navegacao para modulos.
- **Componentes:** `StatsCard` (4 cards no topo), grafico de linha (evolucao mensal), lista de proximos agendamentos.
- **Estado vazio:** "Bem-vindo ao Vertix! Comece cadastrando seus primeiros registros."
- **Loading:** Skeleton placeholders para cards e graficos.

#### Telas de Listagem (padrao para todos os modulos)

- **Objetivo:** Listar recursos com busca, filtros e paginacao.
- **Dados:** Tabela com colunas configuradas por modelo.
- **Acoes:** Botao "Novo" no header, acoes por linha (editar, excluir, ver detalhes).
- **Filtros:** Barra de busca por texto, dropdowns de filtro por status.
- **Componentes:** `PageHeader`, `DataTable`, `StatusBadge`, `ConfirmDialog` (para exclusao).
- **Estado vazio:** `EmptyState` com icone do modulo e botao "Criar primeiro registro".
- **Loading:** Skeleton de tabela.
- **Erro:** Toast com mensagem de erro e botao "Tentar novamente".

#### Telas de Formulario (padrao para criar/editar)

- **Objetivo:** Criar ou editar um recurso.
- **Dados:** Formulario com campos do modelo.
- **Acoes:** Salvar (com loading), Cancelar (volta para listagem).
- **Componentes:** `PageHeader`, `FormField`, `Select`, `DatePicker`, botoes.
- **Validacao:** Mensagens de erro inline por campo. Toast para erros do backend.

#### Dashboard Financeiro (Clinica, Odontologia, Estetica, Juridico)

- **Objetivo:** Visao consolidada de receitas, pendencias e fluxo de caixa.
- **Dados:** Total pendente, total pago, total vencido, total cancelado.
- **Componentes:** 4x `StatsCard`, tabela de ultimos lancamentos, grafico de barras mensal.


---

## 4. Billing e Monetizacao

### 4.1 Planos por Vertical

Cada vertical possui sua propria estrutura de precos. Todos os valores em BRL (Real brasileiro).

#### Clinica Medica / Odontologia / Estetica

| Recurso | Free | Starter (R$97/mes) | Professional (R$197/mes) | Enterprise (R$397/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Pacientes | 30 | 200 | Ilimitado | Ilimitado |
| Profissionais | 1 | 3 | 10 | Ilimitado |
| Agendamentos/mes | 50 | 300 | Ilimitado | Ilimitado |
| Prontuarios | 30 | 200 | Ilimitado | Ilimitado |
| Armazenamento (MinIO) | 100MB | 1GB | 10GB | 50GB |
| Relatorios PDF | Nao | Basico | Completo | Customizado |
| Notificacoes email | Nao | 100/mes | 1000/mes | Ilimitado |
| Notificacoes WhatsApp | Nao | Nao | 500/mes | Ilimitado |
| IA (resumos) | Nao | 10/mes | 100/mes | Ilimitado |
| Suporte | Comunidade | Email | Prioritario | Dedicado + SLA |
| Usuarios do sistema | 2 | 5 | 15 | Ilimitado |
| API publica | Nao | Nao | Nao | Sim |
| Multi-filial | Nao | Nao | Nao | Sim |

#### Construcao Civil

| Recurso | Free | Starter (R$147/mes) | Professional (R$297/mes) | Enterprise (R$597/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Projetos ativos | 1 | 5 | 20 | Ilimitado |
| Trabalhadores | 10 | 50 | 200 | Ilimitado |
| Armazenamento | 100MB | 2GB | 20GB | 100GB |
| Relatorios PDF | Nao | Basico | Completo + Gantt | Customizado |
| IA (analise de risco) | Nao | 5/mes | 50/mes | Ilimitado |
| Usuarios | 2 | 5 | 20 | Ilimitado |

#### Barbearia

| Recurso | Free | Starter (R$67/mes) | Professional (R$127/mes) | Enterprise (R$247/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Barbeiros | 1 | 3 | 10 | Ilimitado |
| Agendamentos/mes | 50 | 300 | Ilimitado | Ilimitado |
| Clientes | 50 | 500 | Ilimitado | Ilimitado |
| Produtos (estoque) | 20 | 100 | Ilimitado | Ilimitado |
| Agendamento online | Nao | Sim | Sim | Sim (white-label) |
| WhatsApp | Nao | Nao | 200/mes | Ilimitado |
| Usuarios | 2 | 4 | 10 | Ilimitado |

#### Juridico

| Recurso | Free | Starter (R$127/mes) | Professional (R$247/mes) | Enterprise (R$497/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Processos ativos | 5 | 30 | 200 | Ilimitado |
| Clientes | 10 | 50 | 300 | Ilimitado |
| Armazenamento docs | 200MB | 5GB | 30GB | 100GB |
| IA (analise docs) | Nao | 5/mes | 50/mes | Ilimitado |
| Controle de prazos | Basico | Completo | Completo + alertas | Completo + integracao |
| Usuarios | 2 | 5 | 15 | Ilimitado |

#### Restaurante / Dark Kitchen

| Recurso | Free | Starter (R$97/mes) | Professional (R$197/mes) | Enterprise (R$397/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Itens do cardapio | 20 | 100 | Ilimitado | Ilimitado |
| Pedidos/mes | 100 | 1000 | Ilimitado | Ilimitado |
| Entregadores | 2 | 10 | 50 | Ilimitado |
| Integracao iFood/Rappi | Nao | Nao | Sim | Sim |
| Cardapio digital | Nao | Sim | Sim | Sim (white-label) |
| IA (previsao demanda) | Nao | Nao | Basico | Completo |
| Usuarios | 2 | 5 | 15 | Ilimitado |

#### Imobiliaria

| Recurso | Free | Starter (R$127/mes) | Professional (R$247/mes) | Enterprise (R$497/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Imoveis | 10 | 50 | 300 | Ilimitado |
| Clientes | 20 | 100 | Ilimitado | Ilimitado |
| Armazenamento (fotos) | 500MB | 5GB | 30GB | 100GB |
| IA (matching) | Nao | Nao | Basico | Completo |
| Portal publico | Nao | Sim | Sim | Sim (white-label) |
| Usuarios | 2 | 5 | 15 | Ilimitado |

#### Nutricao

| Recurso | Free | Starter (R$77/mes) | Professional (R$147/mes) | Enterprise (R$297/mes) |
|---------|:----:|:-------------------:|:-----------------------:|:----------------------:|
| Pacientes | 10 | 50 | 300 | Ilimitado |
| Planos alimentares | 10 | 100 | Ilimitado | Ilimitado |
| IA (sugestao cardapio) | Nao | 5/mes | 50/mes | Ilimitado |
| Relatorios PDF | Nao | Basico | Completo | Customizado |
| Usuarios | 1 | 3 | 10 | Ilimitado |

### 4.2 Estados da Assinatura

```
                                    +-----------+
                                    |           |
                 +-------+   paga   |  active   |<-----+
   registro ---->| trial |--------->|           |      |
                 +-------+          +-----+-----+      |
                   |                      |            |
                   | expirou              | falha pgto |
                   |                      v            |
                   |               +------+------+    |
                   |               |             |    | pagamento
                   +-------------->|  past_due   |----+ regularizado
                                   |             |
                                   +------+------+
                                          |
                                          | 7 dias sem pagamento
                                          v
                                   +------+------+
                                   |             |
                                   |  suspended  |
                                   |             |
                                   +------+------+
                                          |
                          +---------------+---------------+
                          |                               |
                          v                               v
                   +------+------+                 +------+------+
                   |             |                 |             |
                   |  canceled   |                 | reactivated |---> active
                   |             |                 |             |
                   +-------------+                 +-------------+
```

**Transicoes e condicoes:**

| De | Para | Condicao | Acao |
|----|------|----------|------|
| trial | active | Pagamento confirmado | Ativa plano, libera recursos |
| trial | past_due | Trial expirou (14 dias) sem pagamento | Notifica tenant admin |
| active | past_due | Falha na cobranca automatica | Notifica, retry em 3 dias |
| past_due | active | Pagamento regularizado | Restaura acesso completo |
| past_due | suspended | 7 dias sem pagamento | Bloqueia acesso (somente leitura) |
| suspended | canceled | 30 dias sem pagamento ou solicitacao | Dados mantidos por 90 dias |
| suspended | reactivated | Pagamento realizado | Restaura acesso completo |
| canceled | reactivated | Reativacao manual + pagamento | Restaura acesso se dados existirem |

### 4.3 Feature Flags por Plano

| Feature Flag | Free | Starter | Professional | Enterprise |
|-------------|:----:|:-------:|:------------:|:----------:|
| `feature.reports.pdf` | Nao | Sim | Sim | Sim |
| `feature.reports.csv` | Nao | Sim | Sim | Sim |
| `feature.notifications.email` | Nao | Sim | Sim | Sim |
| `feature.notifications.whatsapp` | Nao | Nao | Sim | Sim |
| `feature.notifications.push` | Nao | Nao | Sim | Sim |
| `feature.ai.summary` | Nao | Sim | Sim | Sim |
| `feature.ai.analysis` | Nao | Nao | Sim | Sim |
| `feature.ai.prediction` | Nao | Nao | Nao | Sim |
| `feature.integrations.stripe` | Nao | Sim | Sim | Sim |
| `feature.integrations.whatsapp` | Nao | Nao | Sim | Sim |
| `feature.integrations.ifood` | Nao | Nao | Sim | Sim |
| `feature.integrations.calendar` | Nao | Nao | Sim | Sim |
| `feature.public.booking` | Nao | Sim | Sim | Sim |
| `feature.public.menu` | Nao | Sim | Sim | Sim |
| `feature.public.whitelabel` | Nao | Nao | Nao | Sim |
| `feature.multi.branch` | Nao | Nao | Nao | Sim |
| `feature.api.public` | Nao | Nao | Nao | Sim |
| `feature.support.priority` | Nao | Nao | Sim | Sim |
| `feature.support.dedicated` | Nao | Nao | Nao | Sim |
| `feature.audit.advanced` | Nao | Nao | Sim | Sim |
| `feature.theme.custom` | Nao | Nao | Sim | Sim |

### 4.4 Limites por Plano

Os limites sao verificados no backend antes de cada operacao de criacao. Quando o limite e atingido, a API retorna `403` com mensagem indicando a necessidade de upgrade.

| Recurso | Verificacao | Endpoint Afetado |
|---------|------------|------------------|
| Max pacientes/clientes | COUNT por tenant | POST /api/[vertical]/patients ou clients |
| Max profissionais | COUNT por tenant | POST /api/[vertical]/doctors, dentists, barbers |
| Max projetos ativos | COUNT WHERE status != completed/canceled | POST /api/construction/projects |
| Max agendamentos/mes | COUNT WHERE createdAt no mes corrente | POST /api/[vertical]/appointments |
| Max armazenamento | SUM(size) de attachments do tenant | POST /api/attachments |
| Max usuarios | COUNT de users do tenant | POST /api/users |
| Max requisicoes IA | COUNT de audit_logs com entity=AI no mes | POST /api/ai/* |


---

## 5. Integracoes e Notificacoes

### 5.1 Catalogo de Integracoes

#### Stripe / Asaas (Billing)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Processar pagamentos recorrentes, gerenciar assinaturas e faturas. |
| **Prioridade** | Alta (Fase 2) |
| **Dados sincronizados** | Clientes, assinaturas, faturas, metodos de pagamento, webhooks de eventos. |
| **Modo** | API REST + Webhooks. Backend processa webhooks para atualizar status da assinatura. |
| **Retries** | Stripe: 3 tentativas de cobranca em 7 dias. Asaas: configuravel. |
| **Fallback** | Se webhook falhar, job periodico sincroniza status via API. |
| **Fluxo** | Tenant admin seleciona plano -> Backend cria Customer + Subscription no Stripe -> Webhook `invoice.paid` ativa plano -> Webhook `invoice.payment_failed` marca `past_due`. |

#### WhatsApp (Z-API / Twilio / Evolution API)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Enviar notificacoes automaticas: confirmacao de agendamento, lembretes, atualizacoes de pedido. |
| **Prioridade** | Alta (Fase 3) |
| **Dados** | Numero do destinatario, template da mensagem, variaveis (nome, data, horario). |
| **Modo** | API REST. Mensagens enviadas via fila assincrona (BullMQ). |
| **Retries** | 3 tentativas com backoff exponencial (1min, 5min, 15min). |
| **Fallback** | Se WhatsApp falhar, enviar via email. Registrar falha em notifications. |
| **Templates** | Confirmacao de agendamento, lembrete 24h antes, cancelamento, conclusao de pedido. |

#### Email (AWS SES / Resend)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Notificacoes por email: boas-vindas, reset de senha, confirmacoes, relatorios. |
| **Prioridade** | Media (Fase 1) |
| **Dados** | Email destinatario, assunto, corpo HTML (template). |
| **Modo** | API REST via servico de email. Processado via fila assincrona. |
| **Retries** | 3 tentativas. |
| **Fallback** | Registrar falha em notifications com status `failed`. |

#### S3 / MinIO (Storage)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Armazenar arquivos: fotos de pacientes, exames, documentos juridicos, fotos de imoveis, comprovantes. |
| **Prioridade** | Alta (ja implementado com MinIO local) |
| **Dados** | Arquivo binario, metadados (tenantId, tipo, tamanho). |
| **Modo** | Upload via endpoint dedicado. Backend faz upload para MinIO e registra em `attachments`. |
| **Organizacao** | Buckets por tenant: `vertix-uploads/{tenantId}/{module}/{filename}` |
| **Seguranca** | URLs pre-assinadas com expiracao. Acesso apenas autenticado. |

#### iFood / Rappi (Restaurante)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Receber pedidos de plataformas de delivery e sincronizar status. |
| **Prioridade** | Baixa (Fase 4 - Enterprise) |
| **Dados** | Pedidos, itens, status, informacoes do cliente. |
| **Modo** | Webhook para receber pedidos + API para atualizar status. |
| **Retries** | Reenfileirar pedidos com falha de processamento. |
| **Fallback** | Pedido registrado com status `pending_review` para tratamento manual. |

#### Google Calendar (Agendamentos)

| Aspecto | Detalhe |
|---------|---------|
| **Objetivo** | Sincronizar agendamentos com Google Calendar do profissional. |
| **Prioridade** | Baixa (Fase 3-4) |
| **Dados** | Eventos do calendario: titulo, data/hora, duracao, participantes. |
| **Modo** | API REST Google Calendar + OAuth2 por profissional. |
| **Sincronizacao** | Bidirecional: criar evento ao agendar, atualizar ao alterar status. |

### 5.2 Notificacoes

#### Tipos de Notificacao

| Tipo | Canal | Verticais | Trigger |
|------|-------|-----------|---------|
| Agendamento criado | Email, WhatsApp | Clinica, Barbearia, Estetica, Dental, Nutricao | POST appointment |
| Lembrete 24h | WhatsApp, Push | Clinica, Barbearia, Estetica, Dental, Nutricao | Cron job diario |
| Agendamento cancelado | Email, WhatsApp | Todas com agendamento | PATCH appointment status=canceled |
| Pedido recebido | Push | Restaurante | POST order |
| Pedido pronto para entrega | WhatsApp | Restaurante | PATCH order status=ready |
| Pedido entregue | WhatsApp | Restaurante | PATCH order status=delivered |
| Prazo proximo (3 dias) | Email, Push | Juridico | Cron job diario |
| Pagamento pendente | Email | Todas com billing | Cron job diario |
| Pagamento confirmado | Email | Todas com billing | Webhook Stripe |
| Assinatura prestes a expirar | Email | Core | 7 dias antes do fim |
| Estoque baixo | Push | Barbearia | Quando stock < min_stock |
| Novo processo criado | Email | Juridico | POST case |
| Medida corporal registrada | Push | Nutricao | POST measurement |

#### Templates de Notificacao

Templates sao armazenados em codigo (constantes) com variaveis interpolaveis:

```
APPOINTMENT_CONFIRMATION:
  subject: "Agendamento confirmado - {{clinicName}}"
  body: "Ola {{patientName}}, seu agendamento com {{professionalName}} esta confirmado para {{date}} as {{time}}."

APPOINTMENT_REMINDER:
  subject: "Lembrete: consulta amanha"
  body: "Ola {{patientName}}, lembramos que voce tem consulta amanha ({{date}}) as {{time}} com {{professionalName}}."

ORDER_STATUS:
  subject: "Seu pedido #{{orderNumber}}"
  body: "Ola {{customerName}}, seu pedido #{{orderNumber}} esta {{status}}. {{additionalInfo}}"
```

#### Preferencias do Usuario

Futuramente, cada usuario podera configurar suas preferencias de notificacao:

| Preferencia | Opcoes | Padrao |
|------------|--------|--------|
| Notificacoes por email | Ativado / Desativado | Ativado |
| Notificacoes WhatsApp | Ativado / Desativado | Ativado |
| Notificacoes push | Ativado / Desativado | Ativado |
| Lembrete de agendamento | 1h, 2h, 24h, 48h | 24h |
| Resumo diario | Ativado / Desativado | Desativado |

---

## 6. IA Aplicada

### 6.1 Casos de Uso por Vertical

#### Clinica Medica

| Caso de Uso | Classificacao | Dor | Input | Output | Limitacoes | Revisao Humana |
|-------------|:------------:|------|-------|--------|------------|:--------------:|
| Resumo de consulta | MVP | Medico gasta tempo escrevendo resumos | Sintomas, diagnostico, prescricao | Resumo estruturado do atendimento | Nao substitui prontuario oficial | Obrigatoria |
| Sugestao diagnostica | V1 | Apoio a decisao clinica | Sintomas, historico do paciente | Lista de diagnosticos possiveis com probabilidade | Uso informativo, nao definitivo | Obrigatoria |
| Transcricao de consulta | Premium | Agilizar prontuario | Audio da consulta | Texto transcrito + resumo | Requer integracao com STT | Obrigatoria |

**Billing IA Clinica:** Incluido nos limites do plano (10/mes Starter, 100/mes Pro, ilimitado Enterprise).

#### Juridico

| Caso de Uso | Classificacao | Dor | Input | Output | Limitacoes | Revisao Humana |
|-------------|:------------:|------|-------|--------|------------|:--------------:|
| Analise de documento | V1 | Leitura lenta de documentos extensos | Texto do documento (PDF/texto) | Resumo, pontos criticos, riscos identificados | Maximo 50 paginas | Obrigatoria |
| Resumo de processo | V1 | Entender caso rapidamente | Dados do caso, documentos vinculados | Resumo executivo do processo | Depende de dados completos | Obrigatoria |
| Sugestao de argumento | Premium | Apoio a redacao de pecas | Tipo de peca, contexto, jurisprudencia | Sugestoes de argumentos e referencias | Uso como rascunho apenas | Obrigatoria |

#### Construcao Civil

| Caso de Uso | Classificacao | Dor | Input | Output | Limitacoes | Revisao Humana |
|-------------|:------------:|------|-------|--------|------------|:--------------:|
| Analise de risco | MVP | Prever atrasos e estouros de orcamento | Orcamento, gasto, progresso, prazo, tarefas | Score de risco (1-10) com justificativa | Baseado em heuristicas simples | Recomendada |
| Previsao de atraso | V1 | Antecipar problemas de cronograma | Historico de progresso, tarefas pendentes | Estimativa de atraso em dias | Precisao depende de historico | Recomendada |
| Estimativa de custo | Premium | Orcamento de novas obras | Tipo de obra, area, localizacao | Estimativa de custo por metro quadrado | Baseado em dados de mercado | Obrigatoria |

#### Nutricao

| Caso de Uso | Classificacao | Dor | Input | Output |
|-------------|:------------:|------|-------|--------|
| Sugestao de cardapio | V1 | Montar plano alimentar demora | Objetivo, restricoes, preferencias, calorias | Sugestao de refeicoes para o dia |
| Substituicao de alimentos | V1 | Paciente nao gosta de um alimento | Alimento a substituir, restricoes | Alternativas equivalentes nutricionalmente |

#### Estetica

| Caso de Uso | Classificacao | Input | Output |
|-------------|:------------:|-------|--------|
| Recomendacao de procedimento | V1 | Tipo de pele, queixas, historico | Procedimentos recomendados com justificativa |
| Analise de evolucao | Premium | Fotos before/after, medicoes | Relatorio de evolucao com metricas |

#### Odontologia

| Caso de Uso | Classificacao | Input | Output |
|-------------|:------------:|-------|--------|
| Sugestao de tratamento | V1 | Queixa, dente, historico | Opcoes de tratamento com pros/contras |
| Analise de raio-x | Premium (futuro) | Imagem de raio-x | Identificacao de caries, lesoes, anomalias |

#### Restaurante

| Caso de Uso | Classificacao | Input | Output |
|-------------|:------------:|-------|--------|
| Previsao de demanda | Premium | Historico de pedidos, dia da semana, clima | Quantidade estimada por item |
| Otimizacao de cardapio | Premium | Vendas, custos, margem por item | Sugestoes de remocao, promocao e novos itens |

#### Imobiliaria

| Caso de Uso | Classificacao | Input | Output |
|-------------|:------------:|-------|--------|
| Matching imovel-cliente | V1 | Preferencias do cliente, imoveis disponiveis | Ranking de imoveis mais compativeis |
| Precificacao sugerida | Premium | Caracteristicas do imovel, localizacao, mercado | Faixa de preco sugerida com justificativa |

---

## 7. Observabilidade

### 7.1 Logs Estruturados

**Formato:** JSON estruturado para facilitar ingestao em ELK Stack / Loki / CloudWatch.

```json
{
  "timestamp": "2026-04-06T12:00:00.000Z",
  "level": "info",
  "context": "ClinicPatientsService",
  "message": "Patient created successfully",
  "tenantId": "uuid-tenant",
  "userId": "uuid-user",
  "requestId": "uuid-request",
  "duration": 45,
  "metadata": {
    "patientId": "uuid-patient",
    "action": "CREATE"
  }
}
```

**Niveis de log:**

| Nivel | Uso | Exemplo |
|-------|-----|---------|
| `error` | Falhas que impedem operacao | Erro de conexao com banco, falha de autenticacao |
| `warn` | Situacoes anormais mas nao criticas | Rate limit atingido, tentativa de acesso negado |
| `info` | Operacoes normais importantes | CRUD executado, login realizado, pagamento processado |
| `debug` | Detalhes para depuracao (desabilitado em producao) | Query SQL, payload de request, estado interno |

**Rotacao de logs:**
- Desenvolvimento: saida no console (stdout).
- Producao: JSON para stdout, coletado pelo container runtime e encaminhado para servico de logging centralizado.
- Retencao: 30 dias para `info`+, 90 dias para `error`+.

### 7.2 Metricas

#### Metricas Tecnicas (Prometheus)

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `http_requests_total` | Counter | method, path, status | Total de requisicoes HTTP |
| `http_request_duration_seconds` | Histogram | method, path | Latencia das requisicoes |
| `http_requests_in_progress` | Gauge | - | Requisicoes em andamento |
| `db_query_duration_seconds` | Histogram | operation, model | Latencia das queries Prisma |
| `db_connections_active` | Gauge | - | Conexoes ativas com PostgreSQL |
| `redis_operations_total` | Counter | operation | Operacoes no Redis |
| `minio_upload_size_bytes` | Histogram | bucket | Tamanho dos uploads |
| `auth_login_total` | Counter | status (success/failure) | Tentativas de login |
| `tenant_active_count` | Gauge | - | Tenants ativos na plataforma |

#### Metricas de Negocio

| Metrica | Tipo | Descricao |
|---------|------|-----------|
| `appointments_created_total` | Counter | Total de agendamentos criados (por vertical) |
| `appointments_completed_total` | Counter | Agendamentos concluidos |
| `appointments_canceled_total` | Counter | Agendamentos cancelados |
| `orders_total` | Counter | Pedidos de restaurante |
| `revenue_total_brl` | Counter | Receita total processada |
| `patients_registered_total` | Counter | Novos pacientes cadastrados |
| `ai_requests_total` | Counter | Chamadas ao modulo de IA |
| `subscription_mrr_brl` | Gauge | Receita recorrente mensal |
| `churn_rate_percent` | Gauge | Taxa de cancelamento mensal |

### 7.3 Dashboards Grafana

#### Dashboard 1: API Performance

Paineis:
- Requisicoes por segundo (grafico de linha, ultimas 24h)
- Latencia P50, P95, P99 (grafico de linha)
- Taxa de erro 5xx (percentual)
- Distribuicao de status codes (pizza)
- Top 10 endpoints mais lentos (tabela)
- Requisicoes em andamento (gauge)

#### Dashboard 2: Business KPIs

Paineis:
- Tenants ativos (gauge grande)
- MRR - Monthly Recurring Revenue (gauge)
- Agendamentos hoje (contador por vertical)
- Pedidos hoje (restaurante)
- Novos cadastros na semana (grafico de barras)
- IA: requisicoes por dia (grafico de linha)
- Taxa de conversao trial -> paid (percentual)

#### Dashboard 3: Infraestrutura

Paineis:
- Uso de CPU e memoria por container (graficos de area)
- Conexoes ativas PostgreSQL (gauge)
- Espaco em disco PostgreSQL (gauge com alerta)
- Espaco em disco MinIO (gauge)
- Redis memory usage (gauge)
- Health check status por servico (status map)

### 7.4 Alertas

#### Alertas Criticos (pagina imediata)

| Alerta | Condicao | Canal |
|--------|----------|-------|
| API Down | Health check falha por 2 minutos | Slack, SMS, email |
| Banco Down | PostgreSQL nao responde por 1 minuto | Slack, SMS, email |
| Taxa de erro > 5% | `http_requests_total{status=~"5.."}` > 5% por 5 minutos | Slack, email |
| Latencia P99 > 5s | `http_request_duration_seconds` P99 > 5s por 5 minutos | Slack |
| Disco > 90% | Volume PostgreSQL ou MinIO > 90% | Slack, email |

#### Alertas de Atencao (warning)

| Alerta | Condicao | Canal |
|--------|----------|-------|
| Latencia P95 > 2s | `http_request_duration_seconds` P95 > 2s por 10 minutos | Slack |
| Conexoes PostgreSQL > 80% | Pool de conexoes > 80% utilizado | Slack |
| Redis memory > 70% | Uso de memoria Redis > 70% | Slack |
| Falha de notificacao | > 10 notificacoes com status `failed` em 1 hora | Email |
| Taxa de erro auth > 10% | Login failures > 10% em 15 minutos | Slack |
| Webhook Stripe falha | Retry de webhook > 3 vezes | Email |


---

## 8. Docker e Ambiente Local

### 8.1 Servicos Implementados

O ambiente local e definido via `docker-compose.yml` com os seguintes servicos:

| Servico | Imagem | Porta | Funcao | Health Check |
|---------|--------|:-----:|--------|:------------:|
| `postgres` | postgres:16-alpine | 5432 | Banco de dados principal | `pg_isready` |
| `redis` | redis:7-alpine | 6379 | Cache, sessoes, filas | `redis-cli ping` |
| `minio` | minio/minio:latest | 9000/9001 | Armazenamento de arquivos (S3-compatible) | `mc ready local` |
| `backend` | Node.js (NestJS) | 3001 | API REST | `wget /api/health` |
| `frontend` | Node.js (Next.js) | 3000 | Interface web | - |
| `nginx` | nginx:alpine | 8080 | Reverse proxy e load balancer | - |
| `prometheus` | prom/prometheus:latest | 9090 | Coleta de metricas | - |
| `grafana` | grafana/grafana:latest | 3002 | Dashboards e alertas | - |

### 8.2 Rede e Volumes

- **Rede:** `vertix-network` (bridge) - todos os servicos na mesma rede Docker.
- **Volumes persistentes:** `postgres-data`, `redis-data`, `minio-data`, `prometheus-data`, `grafana-data`.
- **Hot reload:** Backend e frontend montam codigo-fonte como volume para desenvolvimento com hot reload.

### 8.3 Variaveis de Ambiente

| Variavel | Padrao | Descricao |
|----------|--------|-----------|
| `DATABASE_URL` | postgresql://vertix:vertix_dev_pass@postgres:5432/vertix | Conexao PostgreSQL |
| `REDIS_URL` | redis://redis:6379 | Conexao Redis |
| `JWT_SECRET` | vertix-dev-jwt-secret-change-in-production | Chave de assinatura JWT |
| `JWT_EXPIRATION` | 24h | Tempo de expiracao do token |
| `MINIO_ENDPOINT` | minio | Host do MinIO |
| `MINIO_PORT` | 9000 | Porta do MinIO |
| `MINIO_ACCESS_KEY` | vertix_minio | Chave de acesso MinIO |
| `MINIO_SECRET_KEY` | vertix_minio_secret | Segredo MinIO |
| `MINIO_BUCKET` | vertix-uploads | Bucket padrao |
| `CORS_ORIGINS` | http://localhost:3000,http://localhost:8080 | Origens CORS permitidas |
| `NODE_ENV` | development | Ambiente |
| `NEXT_PUBLIC_API_URL` | http://localhost:8080/api | URL da API para o frontend |

### 8.4 Comandos de Desenvolvimento

```bash
# Subir todo o ambiente
docker compose up -d

# Aplicar migracoes
docker compose exec backend npx prisma migrate dev

# Popular banco com dados de demonstracao
docker compose exec backend npx prisma db seed

# Acessar Prisma Studio (GUI do banco)
docker compose exec backend npx prisma studio

# Ver logs do backend
docker compose logs -f backend

# Rebuild apos mudancas no Dockerfile
docker compose up -d --build backend

# Parar todos os servicos
docker compose down

# Parar e remover volumes (reset completo)
docker compose down -v
```

---

## 9. Testes e QA

### 9.1 Estrategia de Testes

| Tipo | Ferramenta | Cobertura Alvo | Descricao |
|------|-----------|:--------------:|-----------|
| **Unitario** | Jest | 70%+ | Testes de services isolados com mocks do Prisma. Validacao de logica de negocio, transformacoes e calculos. |
| **Integracao** | Jest + Supertest | 60%+ | Testes dos endpoints da API com banco de testes real. Validacao de fluxo completo: request -> controller -> service -> banco -> response. |
| **E2E** | Playwright (futuro) | Fluxos criticos | Testes do frontend interagindo com a API real. Fluxos criticos: login, cadastro, agendamento, pagamento. |
| **Contrato** | Jest | 100% DTOs | Validar que DTOs do backend correspondem ao esperado pelo frontend. |
| **Permissao** | Jest + Supertest | 100% endpoints | Testar que cada endpoint rejeita roles nao autorizadas e aceita roles permitidas. |
| **Multi-tenant** | Jest + Supertest | 100% queries | Testar que usuario do Tenant A NUNCA acessa dados do Tenant B. |
| **Concorrencia** | Jest | Fluxos criticos | Testar agendamento simultaneo no mesmo horario, estoque concorrente, etc. |

### 9.2 Cenarios por Modulo

#### Core - Autenticacao

| Cenario | Tipo | Descricao |
|---------|------|-----------|
| Happy path | Unitario | Login com credenciais validas retorna JWT |
| Senha incorreta | Unitario | Login com senha errada retorna 401 |
| Email inexistente | Unitario | Login com email nao cadastrado retorna 401 |
| Token expirado | Integracao | Request com token expirado retorna 401 |
| Token invalido | Integracao | Request com token malformado retorna 401 |
| Registro de tenant | Integracao | Criar tenant + admin retorna tenant e token |
| Slug duplicado | Integracao | Registro com slug existente retorna 409 |
| Acesso cross-tenant | Multi-tenant | Usuario do Tenant A nao acessa dados do Tenant B |

#### Core - RBAC

| Cenario | Tipo | Descricao |
|---------|------|-----------|
| Role suficiente | Permissao | Endpoint aceita role permitida |
| Role insuficiente | Permissao | Endpoint rejeita role nao permitida com 403 |
| Multiplas roles | Permissao | Usuario com 2+ roles acessa endpoints de ambas |
| Tenant suspenso | Permissao | TenantGuard bloqueia tenant com status suspended |

#### Clinica - Agendamentos

| Cenario | Tipo | Descricao |
|---------|------|-----------|
| Criar agendamento | Integracao | POST com dados validos cria agendamento |
| Paciente inexistente | Integracao | POST com patientId invalido retorna 404 |
| Medico de outro tenant | Multi-tenant | POST com doctorId de outro tenant retorna 404 |
| Filtro por data | Integracao | GET com ?date retorna apenas agendamentos do dia |
| Fluxo de status | Integracao | scheduled -> confirmed -> in_progress -> completed |
| Status invalido | Integracao | Transicao invalida (completed -> scheduled) retorna 400 |
| Prontuario restrito | Permissao | clinic_receptionist NAO acessa prontuarios |

#### Construcao - Projetos

| Cenario | Tipo | Descricao |
|---------|------|-----------|
| Cascade delete | Integracao | Excluir projeto remove tarefas, despesas e alocacoes |
| Dashboard | Integracao | Retorna resumo correto de projetos, orcamento e progresso |
| Alocar trabalhador | Integracao | POST allocate cria registro em project_workers |
| Worker readonly | Permissao | construction_worker so pode ler projetos e tarefas |

#### Barbearia - Agendamento

| Cenario | Tipo | Descricao |
|---------|------|-----------|
| Conflito de horario | Concorrencia | Dois agendamentos no mesmo horario/barbeiro retorna erro |
| Slots disponiveis | Integracao | GET available-slots retorna horarios livres |
| Comanda automatica | Integracao | Completar booking cria order automaticamente |
| Estoque | Integracao | Fechar comanda com produto decrementa estoque |
| Estoque insuficiente | Integracao | Vender produto com estoque zero retorna erro |

---

## 10. Roadmap

### Fase 1: MVP (0-30 dias)

**Objetivo:** Entregar base funcional para validacao com primeiros usuarios.

| Semana | Entrega | Vertical |
|:------:|---------|----------|
| 1 | Testes unitarios Core (auth, tenants, users, roles) - cobertura 70%+ | Core |
| 1 | Testes unitarios Clinica (patients, appointments, medical-records) | Clinica |
| 2 | Testes unitarios Construcao e Barbearia | Construcao, Barbearia |
| 2 | Testes de integracao (API end-to-end com banco de testes) | Core |
| 2 | Testes de permissao (todos os endpoints) | Core |
| 3 | Upload de arquivos com MinIO (fotos, exames, comprovantes) | Core |
| 3 | Validacao completa de DTOs com class-validator | Todos |
| 3 | Implementacao dos 7 verticais restantes (backend) | Todos |
| 4 | Frontend das 7 verticais restantes (listagem, CRUD) | Frontend |
| 4 | Melhorias de UX (loading, error handling, toasts) | Frontend |
| 4 | Pipeline CI/CD completa (lint, test, build, deploy) | DevOps |

**Metricas de sucesso:** Cobertura de testes > 70%. Zero erros criticos. Build < 5 minutos.

### Fase 2: Estabilizacao (30-60 dias)

**Objetivo:** Monetizacao e observabilidade em producao.

| Semana | Entrega | Vertical |
|:------:|---------|----------|
| 5 | Integracao Stripe/Asaas (assinaturas recorrentes) | Core |
| 5 | Portal de billing (trocar plano, ver faturas) | Core |
| 6 | Dashboards Grafana customizados (API + Business KPIs) | DevOps |
| 6 | Alertas Prometheus (latencia, erros, disco) | DevOps |
| 7 | Relatorios PDF (faturamento, resumo de obra, plano alimentar) | Todos |
| 7 | Exportacao CSV/Excel para todas as listagens | Todos |
| 8 | Feature flags por plano (limites e recursos) | Core |
| 8 | Busca avancada com filtros combinados | Todos |

**Metricas de sucesso:** Fluxo Stripe completo. Dashboards Grafana em tempo real. Relatorios PDF funcionais.

### Fase 3: Escala (60-90 dias)

**Objetivo:** Engajamento, integracoes externas e funcionalidades avancadas.

| Semana | Entrega | Vertical |
|:------:|---------|----------|
| 9 | PWA com funcionalidades offline basicas | Mobile |
| 9 | Push notifications | Todos |
| 10 | Integracao WhatsApp (confirmacao e lembretes) | Clinica, Barbearia, Dental |
| 10 | Modulo financeiro avancado (fluxo de caixa, DRE) | Todos |
| 11 | Agendamento online publico (link compartilhavel) | Clinica, Barbearia, Estetica, Dental |
| 11 | Cardapio digital publico | Restaurante |
| 12 | Tema customizavel por tenant (cores, logo) | Core |
| 12 | Documentacao de API publica | Core |

**Metricas de sucesso:** PWA funcional. WhatsApp integrado. 3+ tenants reais.

### Fase 4: Enterprise (90-180 dias)

**Objetivo:** Funcionalidades enterprise e preparacao para escala.

| Semana | Entrega | Vertical |
|:------:|---------|----------|
| 13-14 | IA avancada (analise de documentos, sugestoes de tratamento) | Juridico, Dental, Nutricao |
| 15-16 | Integracao iFood/Rappi | Restaurante |
| 17-18 | Google Calendar sync | Todas com agendamento |
| 19-20 | Multi-filial por tenant | Core |
| 21-22 | API publica com OAuth2 | Core |
| 23-24 | White-label completo | Core |
| 25-26 | Marketplace de plugins (v1) | Core |


---

## 11. Evolucao Arquitetural

### 11.1 Monolito Modular (Atual)

A arquitetura atual e um monolito modular NestJS com separacao clara entre modulos de dominio. Cada vertical e um modulo independente com seus proprios controllers, services, DTOs e entidades.

**Estrutura atual:**

```
apps/
├── backend/                 # NestJS Monolito Modular
│   ├── src/
│   │   ├── core/           # Modulos compartilhados
│   │   │   ├── auth/       # Autenticacao JWT
│   │   │   ├── users/      # Gestao de usuarios
│   │   │   ├── tenants/    # Gestao de tenants
│   │   │   ├── roles/      # RBAC
│   │   │   ├── billing/    # Assinaturas
│   │   │   ├── audit/      # Logs de auditoria
│   │   │   ├── notifications/ # Notificacoes
│   │   │   └── health/     # Health check
│   │   ├── clinic/         # Vertical Clinica
│   │   ├── construction/   # Vertical Construcao
│   │   ├── barbershop/     # Vertical Barbearia
│   │   ├── realestate/     # Vertical Imobiliaria
│   │   ├── nutrition/      # Vertical Nutricao
│   │   ├── legal/          # Vertical Juridico
│   │   ├── restaurant/     # Vertical Restaurante
│   │   ├── aesthetic/      # Vertical Estetica
│   │   ├── dental/         # Vertical Odontologia
│   │   └── ai/             # Modulo de IA
│   └── prisma/
│       └── schema.prisma   # Schema unificado
├── frontend/                # Next.js 14
└── infra/                   # Nginx, Prometheus, Grafana
```

**Vantagens da abordagem atual:**
- Simplicidade operacional: um unico deploy, um unico banco.
- Facilidade de desenvolvimento: compartilhamento de tipos, utilitarios e middlewares.
- Custo reduzido: uma unica instancia de cada servico de infraestrutura.
- Velocidade de entrega: menor complexidade para MVP e validacao de mercado.

**Limites do monolito:**
- Escalabilidade: nao e possivel escalar um vertical independentemente.
- Acoplamento: alteracoes no schema afetam todos os verticais.
- Deploy: deploy de qualquer alteracao requer deploy de toda a aplicacao.
- Time de desenvolvimento: conforme o time cresce, conflitos de merge aumentam.

### 11.2 Extracao de Servicos (Futuro)

Quando atingir limites de escala, extrair verticais como microsservicos independentes:

**Candidatos a extracao (por ordem de prioridade):**

1. **Servico de Notificacoes:** Responsabilidade unica, alto volume, processamento assincrono. Fila dedicada (BullMQ/SQS).
2. **Servico de IA:** Processamento pesado, latencia diferente, pode escalar independentemente com GPU.
3. **Servico de Storage:** Upload/download de arquivos, geracao de thumbnails, conversao de formatos.
4. **Vertical de Restaurante:** Alto volume de pedidos em tempo real, requisitos de latencia diferentes.
5. **Vertical de Clinica:** Maior vertical com requisitos de compliance (LGPD, CFM).

**Padrao de comunicacao entre servicos:**
- Sincrono: REST/gRPC para consultas que precisam de resposta imediata.
- Assincrono: Event bus (Redis Pub/Sub ou RabbitMQ/SQS) para eventos de dominio.
- Database per service: cada servico com seu proprio banco (eventualmente).
- Shared database: fase intermediaria com schema compartilhado mas servicos separados.

### 11.3 Kubernetes

#### Checklist de Preparacao para Kubernetes

| Item | Status | Descricao |
|------|:------:|-----------|
| Containers stateless | Pronto | Backend nao armazena estado local |
| Health checks | Pronto | `/api/health` implementado |
| Graceful shutdown | Pendente | Tratar SIGTERM para finalizar requests em andamento |
| 12-factor app | Parcial | Configuracao via env vars, logs em stdout |
| Secrets management | Pendente | Migrar para Kubernetes Secrets ou AWS Secrets Manager |
| Resource limits | Pendente | Definir requests e limits de CPU/memoria |
| Horizontal Pod Autoscaler | Pendente | Configurar HPA baseado em CPU/memoria/requests |
| Liveness/Readiness probes | Pendente | Configurar probes distintas para liveness e readiness |
| Network policies | Pendente | Isolar pods por namespace |
| Persistent volumes | Pendente | PostgreSQL e MinIO em volumes persistentes (EBS) |
| Ingress | Pendente | Nginx Ingress Controller com TLS |
| CI/CD | Parcial | GitHub Actions com deploy blue/green para EKS |

#### Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vertix-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vertix-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Estrutura de Namespaces

```
vertix-production/    # Aplicacao principal
vertix-staging/       # Ambiente de staging
vertix-monitoring/    # Prometheus, Grafana, Alertmanager
vertix-storage/       # PostgreSQL, Redis, MinIO
```

#### Secrets e ConfigMaps

```yaml
# ConfigMap para configuracoes nao-sensiveis
apiVersion: v1
kind: ConfigMap
metadata:
  name: vertix-config
data:
  NODE_ENV: "production"
  JWT_EXPIRATION: "24h"
  CORS_ORIGINS: "https://app.vertix.com.br"

---
# Secret para dados sensiveis
apiVersion: v1
kind: Secret
metadata:
  name: vertix-secrets
type: Opaque
data:
  JWT_SECRET: <base64>
  DATABASE_URL: <base64>
  MINIO_SECRET_KEY: <base64>
  STRIPE_SECRET_KEY: <base64>
```

---

## 12. Gaps e Recomendacoes Finais

### 12.1 Gaps Criticos (Bloqueia Producao)

| # | Gap | Impacto | Acao Corretiva | Prioridade |
|---|-----|---------|----------------|:----------:|
| 1 | **Soft delete nao implementado** | Dados podem ser perdidos irreversivelmente | Adicionar coluna `deletedAt DateTime?` em todas as tabelas criticas e implementar filtro global no Prisma middleware | P0 |
| 2 | **Sem refresh token** | Usuario precisa fazer login novamente a cada 24h | Implementar fluxo de refresh token com rotacao e blacklist | P1 |
| 3 | **Sem validacao de senha forte** | Usuarios podem usar senhas fracas | Adicionar validacao no DTO: minimo 8 caracteres, maiuscula, minuscula, numero, caractere especial | P0 |
| 4 | **Sem rate limiting no backend** | Vulneravel a brute force e DDoS | Implementar rate limiting com `@nestjs/throttler` (ja disponivel no NestJS) | P0 |
| 5 | **JWT Secret padrao no .env** | Em producao, secret padrao e vulneravel | Forcar `JWT_SECRET` em producao via validacao de startup. Rejeitar secret padrao. | P0 |
| 6 | **Sem MFA** | Contas administrativas sem protecao adicional | Implementar TOTP (Google Authenticator) para tenant_admin e super_admin | P1 |
| 7 | **7 verticais sem implementacao backend** | Apenas Clinica, Construcao e Barbearia implementados | Implementar controllers, services e DTOs para Real Estate, Nutrition, Legal, Restaurant, Aesthetic, Dental | P0 |
| 8 | **Sem testes automatizados** | Regressoes nao detectadas | Implementar testes unitarios e de integracao com cobertura minima de 70% | P0 |

### 12.2 Gaps Importantes (Impacta Experiencia)

| # | Gap | Impacto | Acao Corretiva | Prioridade |
|---|-----|---------|----------------|:----------:|
| 9 | **Sem paginacao consistente** | Listagens grandes ficam lentas | Padronizar paginacao em todos os endpoints com cursor-based para grandes volumes | P1 |
| 10 | **Sem cache Redis** | Queries repetidas sobrecarregam o banco | Implementar cache em endpoints de leitura frequente (listagens, dashboards) com TTL de 5-15 minutos | P1 |
| 11 | **Sem fila assincrona** | Notificacoes e IA bloqueiam a request | Implementar BullMQ para processamento assincrono de emails, WhatsApp, IA e relatorios PDF | P1 |
| 12 | **Sem logs estruturados** | Dificil depurar problemas em producao | Implementar Winston ou Pino com formato JSON e contexto (tenantId, userId, requestId) | P1 |
| 13 | **Frontend sem tratamento de erro global** | Erros nao tratados quebram a UI | Implementar Error Boundary, interceptor de 401/403, e toasts para erros de API | P1 |
| 14 | **Sem backup automatico** | Risco de perda de dados | Configurar pg_dump automatico (diario) com retencao de 30 dias em S3 | P1 |
| 15 | **Sem versionamento de documentos** | Alteracoes em prontuarios e documentos nao rastreadas | Implementar tabela de historico ou versionamento em tabelas criticas | P2 |

### 12.3 Gaps Desejaveis (Melhoria de Qualidade)

| # | Gap | Impacto | Acao Corretiva | Prioridade |
|---|-----|---------|----------------|:----------:|
| 16 | **Sem i18n** | Limitado ao portugues | Implementar sistema de internacionalizacao para futuro suporte a espanhol e ingles | P3 |
| 17 | **Sem webhook configuravel** | Tenants nao podem integrar com sistemas externos | Implementar sistema de webhooks configuravel por tenant | P3 |
| 18 | **Sem retencao de dados** | Dados nunca sao purgados | Implementar politica de retencao com anonimizacao automatica apos periodo definido (LGPD) | P2 |
| 19 | **Sem exportacao de dados pessoais** | Nao atende direito de portabilidade da LGPD | Implementar endpoint que exporta todos os dados pessoais de um paciente/cliente | P2 |
| 20 | **Sem monitoramento de SLA** | Nao e possivel medir uptime | Implementar monitoramento de SLA com dashboard dedicado | P3 |
| 21 | **Sem graceful shutdown** | Requests em andamento podem ser interrompidos durante deploy | Tratar SIGTERM para aguardar requests pendentes antes de encerrar | P2 |
| 22 | **Schema Prisma muito grande** | Arquivo unico com 1300+ linhas | Avaliar split do schema com Prisma multi-file schema (experimental) ou organizacao por comentarios | P3 |

### 12.4 Recomendacoes Arquiteturais

1. **Priorizar testes antes de novas features.** A ausencia de testes e o maior risco tecnico do projeto. Implementar testes unitarios e de integracao para os modulos existentes antes de implementar novos verticais.

2. **Implementar soft delete imediatamente.** A exclusao fisica de dados e um risco critico, especialmente para dados de saude (LGPD). Adicionar middleware Prisma para filtrar automaticamente registros com `deletedAt` preenchido.

3. **Adotar filas assincrona desde o inicio.** Notificacoes, IA e relatorios devem ser processados em background. Implementar BullMQ com Redis como broker para desacoplar operacoes lentas do fluxo principal.

4. **Padronizar tratamento de erros.** Criar filtro global de excecoes no NestJS que padronize o formato de erro, registre em logs e notifique em caso de erros criticos.

5. **Implementar cache seletivo.** Nao cachear tudo - focar em endpoints de leitura frequente como listagens de pacientes, cardapio do restaurante e dashboard. Usar Redis com TTL curto (5-15 minutos) e invalidacao manual em operacoes de escrita.

6. **Manter o monolito modular por pelo menos 6 meses.** A extracao prematura de microsservicos adiciona complexidade desnecessaria. O monolito modular e suficiente para os primeiros 1000 tenants.

7. **Investir em observabilidade antes de escalar.** Sem metricas e logs estruturados, e impossivel identificar gargalos. Configurar Prometheus + Grafana + alertas antes de buscar escala.

8. **Implementar feature flags antes de monetizar.** O sistema de feature flags permite controlar recursos por plano e realizar lancamentos graduais sem risco.

---

> **Documento gerado como referencia tecnica para a equipe de desenvolvimento do Vertix.**
> Todas as decisoes devem ser validadas com o time antes da implementacao.
> Este documento deve ser atualizado a cada sprint com as alteracoes realizadas.

