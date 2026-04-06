# Dominio: Construcao Civil

## Visao Geral

O modulo de Construcao Civil do Vertix e um vertical especializado para gestao de obras e projetos de construcao. Ele permite o controle completo de projetos, tarefas, despesas, trabalhadores e alocacao de equipes, com dashboards de acompanhamento de orcamento versus realizado.

## Entidades

### ConstructionProject (Projeto/Obra)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant (construtora) |
| name | String | Sim | Nome do projeto |
| description | String | Nao | Descricao detalhada |
| startDate | DateTime | Nao | Data de inicio |
| endDate | DateTime | Nao | Previsao de termino |
| budget | Decimal | Nao | Orcamento total previsto |
| status | String | Sim | planning, in_progress, paused, completed, canceled |
| location | String | Nao | Endereco/localizacao da obra |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ConstructionTask (Tarefa)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| projectId | UUID | Sim | Referencia ao projeto |
| name | String | Sim | Nome da tarefa |
| description | String | Nao | Descricao detalhada |
| assignedTo | String | Nao | Responsavel pela tarefa |
| startDate | DateTime | Nao | Data de inicio |
| endDate | DateTime | Nao | Data de conclusao |
| status | String | Sim | pending, in_progress, completed, blocked |
| progressPercent | Integer | Sim | Percentual de conclusao (0-100) |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ConstructionExpense (Despesa)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| projectId | UUID | Sim | Referencia ao projeto |
| description | String | Sim | Descricao da despesa |
| category | String | Nao | material, servico, mao_de_obra, equipamento, transporte |
| amount | Decimal | Sim | Valor em BRL |
| expenseDate | DateTime | Sim | Data da despesa |
| supplier | String | Nao | Fornecedor |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ConstructionWorker (Trabalhador)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| name | String | Sim | Nome completo |
| email | String | Nao | Email |
| phone | String | Nao | Telefone |
| role | String | Nao | Funcao (pedreiro, eletricista, encanador, etc) |
| dailyCost | Decimal | Nao | Custo diario (diaria) |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ConstructionProjectWorker (Alocacao)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| projectId | UUID | Sim | Referencia ao projeto |
| workerId | UUID | Sim | Referencia ao trabalhador |
| allocatedFrom | DateTime | Nao | Inicio da alocacao |
| allocatedTo | DateTime | Nao | Fim da alocacao |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

## Regras de Negocio

### Projetos
- Nome do projeto e obrigatorio
- Status inicial e `planning`
- Fluxo de status: `planning` -> `in_progress` -> `completed` (ou `paused`/`canceled`)
- Orcamento e opcional mas recomendado para controle financeiro
- Projetos possuem relacionamento com tarefas, despesas e trabalhadores (cascade delete)
- Dashboard com resumo de todos os projetos ativos

### Tarefas
- Cada tarefa pertence a um projeto especifico
- Progresso percentual de 0 a 100
- Status: `pending` -> `in_progress` -> `completed` (ou `blocked`)
- Tarefas podem ser filtradas por projeto e por status
- Cascade delete: ao excluir um projeto, suas tarefas sao removidas

### Despesas
- Cada despesa pertence a um projeto especifico
- Categorias: material, servico, mao_de_obra, equipamento, transporte
- Data da despesa e obrigatoria
- Fornecedor e opcional mas recomendado para rastreabilidade
- Filtro por projeto disponivel na listagem
- Cascade delete junto com o projeto

### Trabalhadores
- Cadastro independente de projeto (pool de trabalhadores do tenant)
- Funcoes tipicas: pedreiro, eletricista, encanador, servente, mestre de obras
- Custo diario para calculo de custos de mao de obra
- Podem ser alocados a multiplos projetos em periodos diferentes
- Alocacao via endpoint especifico

## Endpoints da API

### Projetos (`/api/construction/projects`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/projects/dashboard` | Dashboard resumo da construcao | tenant_admin, construction_manager |
| GET | `/api/construction/projects` | Listar projetos (com filtros) | tenant_admin, construction_manager, construction_worker |
| GET | `/api/construction/projects/:id` | Buscar projeto por ID | tenant_admin, construction_manager, construction_worker |
| POST | `/api/construction/projects` | Criar novo projeto | tenant_admin, construction_manager |
| PUT | `/api/construction/projects/:id` | Atualizar projeto | tenant_admin, construction_manager |
| DELETE | `/api/construction/projects/:id` | Excluir projeto | tenant_admin |

**Query Parameters (GET lista):**
- `page` (number): Pagina atual (padrao: 1)
- `limit` (number): Itens por pagina (padrao: 10)
- `status` (string): Filtrar por status (planning, in_progress, etc)

### Tarefas (`/api/construction/tasks`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/tasks` | Listar tarefas (com filtros) | tenant_admin, construction_manager, construction_worker |
| GET | `/api/construction/tasks/:id` | Buscar tarefa por ID | tenant_admin, construction_manager, construction_worker |
| POST | `/api/construction/tasks` | Criar nova tarefa | tenant_admin, construction_manager |
| PUT | `/api/construction/tasks/:id` | Atualizar tarefa | tenant_admin, construction_manager |
| DELETE | `/api/construction/tasks/:id` | Excluir tarefa | tenant_admin, construction_manager |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `projectId` (UUID): Filtrar por projeto
- `status` (string): Filtrar por status (pending, in_progress, completed, blocked)

### Despesas (`/api/construction/expenses`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/expenses` | Listar despesas | tenant_admin, construction_manager |
| GET | `/api/construction/expenses/:id` | Buscar despesa por ID | tenant_admin, construction_manager |
| POST | `/api/construction/expenses` | Criar nova despesa | tenant_admin, construction_manager |
| PUT | `/api/construction/expenses/:id` | Atualizar despesa | tenant_admin, construction_manager |
| DELETE | `/api/construction/expenses/:id` | Excluir despesa | tenant_admin, construction_manager |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `projectId` (UUID): Filtrar por projeto

### Trabalhadores (`/api/construction/workers`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/workers` | Listar trabalhadores | tenant_admin, construction_manager |
| GET | `/api/construction/workers/:id` | Buscar trabalhador por ID | tenant_admin, construction_manager |
| POST | `/api/construction/workers` | Cadastrar novo trabalhador | tenant_admin, construction_manager |
| PUT | `/api/construction/workers/:id` | Atualizar trabalhador | tenant_admin, construction_manager |
| DELETE | `/api/construction/workers/:id` | Excluir trabalhador | tenant_admin, construction_manager |
| POST | `/api/construction/workers/:id/allocate/:projectId` | Alocar trabalhador a projeto | tenant_admin, construction_manager |

### IA Construcao (`/api/ai/construction`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| POST | `/api/ai/construction/risk` | Avaliar risco do projeto com IA | Qualquer autenticado |

## Modelo de Dados (Relacionamentos)

```
ConstructionProject
    |
    +-- 1:N --> ConstructionTask (cascade delete)
    |
    +-- 1:N --> ConstructionExpense (cascade delete)
    |
    +-- 1:N --> ConstructionProjectWorker (cascade delete)
                    |
                    +-- N:1 --> ConstructionWorker (cascade delete)
```

## Fluxos de Trabalho

### 1. Criacao de Projeto

```
Gerente ou Admin acessa o sistema
    |
    v
POST /api/construction/projects
    |
    +-- Dados: name, description, startDate, endDate, budget, location
    +-- Status inicial: "planning"
    +-- Registro criado com tenant_id do usuario logado
    |
    v
Projeto criado com sucesso
    |
    v
PUT /api/construction/projects/:id  (status: "in_progress")
    |
    v
Obra iniciada
```

### 2. Gerenciamento de Tarefas

```
Gerente cria tarefas para o projeto
    |
    v
POST /api/construction/tasks
    |
    +-- Dados: projectId, name, description, assignedTo, startDate
    +-- Status inicial: "pending", progressPercent: 0
    |
    v
Trabalho em andamento
    |
    v
PUT /api/construction/tasks/:id
    |
    +-- status: "in_progress", progressPercent: 60
    |
    v
Tarefa concluida
    |
    v
PUT /api/construction/tasks/:id
    |
    +-- status: "completed", progressPercent: 100
```

### 3. Controle de Despesas

```
Gerente registra despesas do projeto
    |
    v
POST /api/construction/expenses
    |
    +-- Dados: projectId, description, category, amount, expenseDate, supplier
    +-- Categorias: material, servico, mao_de_obra, equipamento
    |
    v
Despesa registrada
    |
    v
GET /api/construction/expenses?projectId=xxx
    |
    v
Relatorio de despesas por projeto
    |
    v
GET /api/construction/projects/dashboard
    |
    v
Dashboard com orcamento vs. realizado
```

### 4. Alocacao de Trabalhadores

```
Gerente cadastra trabalhadores no sistema
    |
    v
POST /api/construction/workers
    |
    +-- Dados: name, phone, role, dailyCost, email
    |
    v
Trabalhador cadastrado
    |
    v
POST /api/construction/workers/:id/allocate/:projectId
    |
    +-- Cria registro em ConstructionProjectWorker
    +-- allocatedFrom: data atual
    |
    v
Trabalhador alocado ao projeto
```

## Papeis e Permissoes - Construcao

| Funcionalidade | tenant_admin | construction_manager | construction_worker |
|---------------|:------------:|:-------------------:|:-------------------:|
| Dashboard | Sim | Sim | Nao |
| Listar projetos | Sim | Sim | Sim |
| Criar/editar projeto | Sim | Sim | Nao |
| Excluir projeto | Sim | Nao | Nao |
| Listar tarefas | Sim | Sim | Sim |
| Criar/editar/excluir tarefa | Sim | Sim | Nao |
| Listar despesas | Sim | Sim | Nao |
| Criar/editar/excluir despesa | Sim | Sim | Nao |
| Listar trabalhadores | Sim | Sim | Nao |
| Gerenciar trabalhadores | Sim | Sim | Nao |
| Alocar trabalhador | Sim | Sim | Nao |

## Dados de Demonstracao (Seed)

O seed cria os seguintes dados para o tenant "Construtora Aurora" (`construtora-aurora`):

**Projetos:**
- Edificio Residencial Aurora - 12 andares, 48 unidades (R$ 5.000.000, em andamento)
- Condominio Jardins do Sol - 20 casas (R$ 8.000.000, planejamento)
- Reforma Comercial Centro - 3 andares (R$ 1.200.000, em andamento)

**Tarefas (Projeto Aurora):**
- Terraplanagem (100% - concluida)
- Fundacao (100% - concluida)
- Estrutura Blocos 1-6 (60% - em andamento)
- Estrutura Blocos 7-12 (0% - pendente)
- Instalacoes eletricas (0% - pendente)
- Instalacoes hidraulicas (0% - pendente)

**Despesas:**
- R$ 120.000 - Servico de terraplanagem
- R$ 350.000 - Concreto para fundacao
- R$ 480.000 - Aco para estrutura
- R$ 180.000 - Mao de obra (marco)
- R$ 45.000 - Demolicao (Reforma Centro)
- R$ 28.000 - Tijolos e argamassa (Reforma Centro)

**Trabalhadores:**
- Jose da Silva - Pedreiro (R$ 250/dia)
- Antonio Ferreira - Eletricista (R$ 300/dia)
- Pedro Santos - Encanador (R$ 280/dia)
- Lucas Oliveira - Servente (R$ 150/dia)
- Marcos Souza - Mestre de Obras (R$ 400/dia)

**Alocacoes:**
- Projeto Aurora: Jose, Antonio, Lucas, Marcos
- Reforma Centro: Pedro
