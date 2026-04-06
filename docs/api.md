# Referencia da API - NexusHub

## Informacoes Gerais

- **Base URL**: `http://localhost:8080/api`
- **Formato**: JSON (application/json)
- **Autenticacao**: Bearer Token (JWT) no header `Authorization`
- **Documentacao Interativa**: Swagger UI disponivel em `http://localhost:8080/api/docs`
- **Prefixo Global**: Todos os endpoints sao prefixados com `/api`

## Autenticacao

Todas as rotas (exceto login, registro e health check) exigem o header:
```
Authorization: Bearer <jwt_token>
```

O token e obtido via endpoint de login e contem: `sub` (userId), `tenantId` e `roles`.

## Codigos de Resposta

| Codigo | Descricao |
|--------|-----------|
| 200 | Sucesso |
| 201 | Recurso criado com sucesso |
| 400 | Requisicao invalida (erro de validacao) |
| 401 | Nao autenticado (token ausente ou invalido) |
| 403 | Sem permissao (RBAC - role insuficiente) |
| 404 | Recurso nao encontrado |
| 409 | Conflito (duplicata) |
| 500 | Erro interno do servidor |

## Paginacao

Todos os endpoints de listagem suportam os seguintes query parameters:

| Parametro | Tipo | Padrao | Descricao |
|-----------|------|--------|-----------|
| page | number | 1 | Numero da pagina |
| limit | number | 10 | Itens por pagina |

Resposta paginada:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Modulo Core

### Auth (`/api/auth`)

Endpoints publicos (nao requerem autenticacao):

| Metodo | Rota | Descricao | Auth Requerida |
|--------|------|-----------|:--------------:|
| POST | `/api/auth/login` | Login com email e senha | Nao |
| POST | `/api/auth/register-initial-tenant-admin` | Registrar novo tenant com usuario admin | Nao |
| GET | `/api/auth/me` | Dados do usuario autenticado | Sim |

**POST /api/auth/login**
```json
// Request Body
{
  "email": "admin@nexushub.com",
  "password": "Admin@123"
}

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Super Admin",
    "email": "admin@nexushub.com",
    "tenantId": "uuid",
    "roles": ["super_admin"]
  }
}
```

**POST /api/auth/register-initial-tenant-admin**
```json
// Request Body
{
  "tenantName": "Minha Clinica",
  "tenantSlug": "minha-clinica",
  "userName": "Dr. Joao",
  "email": "joao@minhaclinica.com",
  "password": "MinhaS3nha!"
}
```

**GET /api/auth/me**
```
Authorization: Bearer <token>
// Response 200 - retorna dados do usuario autenticado com roles
```

### Users (`/api/users`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/users` | Listar usuarios do tenant (paginado) | super_admin, tenant_admin |
| GET | `/api/users/:id` | Buscar usuario por ID | super_admin, tenant_admin |
| POST | `/api/users` | Criar novo usuario | super_admin, tenant_admin |
| PUT | `/api/users/:id` | Atualizar usuario | super_admin, tenant_admin |
| DELETE | `/api/users/:id` | Desativar usuario | super_admin, tenant_admin |

### Tenants (`/api/tenants`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/tenants` | Listar todos os tenants | super_admin |
| GET | `/api/tenants/:id` | Buscar tenant por ID | super_admin, tenant_admin |
| PUT | `/api/tenants/:id` | Atualizar tenant | super_admin, tenant_admin |
| DELETE | `/api/tenants/:id` | Desativar tenant | super_admin |

### Roles (`/api/roles`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/roles` | Listar todas as roles disponiveis | super_admin, tenant_admin |
| POST | `/api/roles/:userId/assign/:roleId` | Atribuir role a um usuario | super_admin, tenant_admin |
| DELETE | `/api/roles/:userId/remove/:roleId` | Remover role de um usuario | super_admin, tenant_admin |

**Roles Disponiveis:**
- `super_admin` - Acesso total a plataforma
- `tenant_admin` - Administrador do tenant
- `clinic_doctor` - Medico (modulo clinica)
- `clinic_receptionist` - Recepcionista (modulo clinica)
- `construction_manager` - Gerente de obras (modulo construcao)
- `construction_worker` - Trabalhador (modulo construcao)

### Billing (`/api/billing`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/billing/subscription` | Obter assinatura atual do tenant | Autenticado |
| GET | `/api/billing/plans` | Listar planos disponiveis | Autenticado |

### Audit (`/api/audit`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/audit` | Listar logs de auditoria do tenant (paginado) | super_admin, tenant_admin |

### Notifications (`/api/notifications`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/notifications` | Listar notificacoes do tenant (paginado) | Autenticado |

### Health (`/api/health`)

| Metodo | Rota | Descricao | Auth Requerida |
|--------|------|-----------|:--------------:|
| GET | `/api/health` | Health check (verifica banco de dados) | Nao |

```json
// Response 200
{
  "status": "ok",
  "timestamp": "2026-04-06T12:00:00.000Z",
  "services": {
    "database": "up"
  }
}
```

---

## Modulo Clinica

### Pacientes (`/api/clinic/patients`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/patients` | Listar pacientes | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/patients/:id` | Buscar paciente por ID | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/patients` | Cadastrar paciente | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/patients/:id` | Atualizar paciente | tenant_admin, clinic_receptionist |
| DELETE | `/api/clinic/patients/:id` | Excluir paciente | tenant_admin |

**Query Parameters (GET lista):**
- `page` (number): Pagina
- `limit` (number): Itens por pagina
- `search` (string): Busca por nome

**POST /api/clinic/patients**
```json
{
  "name": "Joao da Silva",
  "cpf": "123.456.789-00",
  "birthDate": "1985-03-15",
  "phone": "(11) 98888-1111",
  "email": "joao@email.com",
  "address": "Rua das Flores, 123 - Sao Paulo",
  "emergencyContact": "Maria - (11) 98888-2222"
}
```

### Medicos (`/api/clinic/doctors`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/doctors` | Listar medicos (paginado) | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/doctors/:id` | Buscar medico por ID | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/doctors` | Cadastrar medico | tenant_admin |
| PUT | `/api/clinic/doctors/:id` | Atualizar medico | tenant_admin |
| DELETE | `/api/clinic/doctors/:id` | Excluir medico | tenant_admin |

**POST /api/clinic/doctors**
```json
{
  "name": "Dra. Ana Santos",
  "email": "ana@clinica.com",
  "specialty": "Clinica Geral",
  "crm": "CRM/SP 123456",
  "phone": "(11) 99999-1111"
}
```

### Agendamentos (`/api/clinic/appointments`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/appointments` | Listar agendamentos (com filtros) | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/appointments/:id` | Buscar agendamento por ID | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/appointments` | Criar agendamento | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/appointments/:id` | Atualizar agendamento | tenant_admin, clinic_doctor, clinic_receptionist |
| DELETE | `/api/clinic/appointments/:id` | Excluir agendamento | tenant_admin |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `doctorId` (UUID): Filtrar por medico
- `status` (string): scheduled, confirmed, in_progress, completed, canceled
- `date` (YYYY-MM-DD): Filtrar por data especifica

**POST /api/clinic/appointments**
```json
{
  "patientId": "uuid-do-paciente",
  "doctorId": "uuid-do-medico",
  "appointmentDate": "2026-04-07T09:00:00.000Z",
  "notes": "Consulta de rotina"
}
```

### Prontuarios Medicos (`/api/clinic/medical-records`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/medical-records` | Listar prontuarios | tenant_admin, clinic_doctor |
| GET | `/api/clinic/medical-records/:id` | Buscar prontuario por ID | tenant_admin, clinic_doctor |
| POST | `/api/clinic/medical-records` | Criar prontuario | tenant_admin, clinic_doctor |
| PUT | `/api/clinic/medical-records/:id` | Atualizar prontuario | tenant_admin, clinic_doctor |
| DELETE | `/api/clinic/medical-records/:id` | Excluir prontuario | tenant_admin |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `patientId` (UUID): Filtrar por paciente

**POST /api/clinic/medical-records**
```json
{
  "patientId": "uuid-do-paciente",
  "doctorId": "uuid-do-medico",
  "appointmentId": "uuid-do-agendamento",
  "description": "Paciente relata dores de cabeca frequentes",
  "diagnosis": "Cefaleia tensional",
  "prescription": "Paracetamol 750mg - 1 comprimido a cada 8 horas"
}
```

### Faturamento Clinico (`/api/clinic/billing`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/billing/dashboard` | Dashboard financeiro resumido | tenant_admin, clinic_receptionist |
| GET | `/api/clinic/billing` | Listar faturamentos (paginado) | tenant_admin, clinic_receptionist |
| GET | `/api/clinic/billing/:id` | Buscar faturamento por ID | tenant_admin, clinic_receptionist |
| POST | `/api/clinic/billing` | Criar faturamento | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/billing/:id` | Atualizar faturamento | tenant_admin, clinic_receptionist |
| DELETE | `/api/clinic/billing/:id` | Excluir faturamento | tenant_admin |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `status` (string): pending, paid, overdue, canceled

**POST /api/clinic/billing**
```json
{
  "patientId": "uuid-do-paciente",
  "appointmentId": "uuid-do-agendamento",
  "amount": 250.00,
  "paymentMethod": "pix",
  "dueDate": "2026-04-15T00:00:00.000Z"
}
```

---

## Modulo Construcao Civil

### Projetos (`/api/construction/projects`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/projects/dashboard` | Dashboard resumo da construcao | tenant_admin, construction_manager |
| GET | `/api/construction/projects` | Listar projetos (paginado) | tenant_admin, construction_manager, construction_worker |
| GET | `/api/construction/projects/:id` | Buscar projeto por ID | tenant_admin, construction_manager, construction_worker |
| POST | `/api/construction/projects` | Criar projeto | tenant_admin, construction_manager |
| PUT | `/api/construction/projects/:id` | Atualizar projeto | tenant_admin, construction_manager |
| DELETE | `/api/construction/projects/:id` | Excluir projeto | tenant_admin |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `status` (string): planning, in_progress, paused, completed, canceled

**POST /api/construction/projects**
```json
{
  "name": "Edificio Residencial Aurora",
  "description": "Construcao de edificio de 12 andares",
  "startDate": "2025-01-15",
  "endDate": "2026-06-30",
  "budget": 5000000.00,
  "status": "planning",
  "location": "Av. Brasil, 1500 - Sao Paulo"
}
```

### Tarefas (`/api/construction/tasks`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/tasks` | Listar tarefas (com filtros) | tenant_admin, construction_manager, construction_worker |
| GET | `/api/construction/tasks/:id` | Buscar tarefa por ID | tenant_admin, construction_manager, construction_worker |
| POST | `/api/construction/tasks` | Criar tarefa | tenant_admin, construction_manager |
| PUT | `/api/construction/tasks/:id` | Atualizar tarefa | tenant_admin, construction_manager |
| DELETE | `/api/construction/tasks/:id` | Excluir tarefa | tenant_admin, construction_manager |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `projectId` (UUID): Filtrar por projeto
- `status` (string): pending, in_progress, completed, blocked

**POST /api/construction/tasks**
```json
{
  "projectId": "uuid-do-projeto",
  "name": "Terraplanagem",
  "description": "Nivelamento do terreno",
  "status": "pending",
  "progressPercent": 0,
  "startDate": "2025-01-15",
  "endDate": "2025-02-15"
}
```

### Despesas (`/api/construction/expenses`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/expenses` | Listar despesas | tenant_admin, construction_manager |
| GET | `/api/construction/expenses/:id` | Buscar despesa por ID | tenant_admin, construction_manager |
| POST | `/api/construction/expenses` | Registrar despesa | tenant_admin, construction_manager |
| PUT | `/api/construction/expenses/:id` | Atualizar despesa | tenant_admin, construction_manager |
| DELETE | `/api/construction/expenses/:id` | Excluir despesa | tenant_admin, construction_manager |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `projectId` (UUID): Filtrar por projeto

**POST /api/construction/expenses**
```json
{
  "projectId": "uuid-do-projeto",
  "description": "Concreto para fundacao",
  "category": "material",
  "amount": 350000.00,
  "expenseDate": "2025-02-20",
  "supplier": "Concreteira SP"
}
```

### Trabalhadores (`/api/construction/workers`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/construction/workers` | Listar trabalhadores | tenant_admin, construction_manager |
| GET | `/api/construction/workers/:id` | Buscar trabalhador por ID | tenant_admin, construction_manager |
| POST | `/api/construction/workers` | Cadastrar trabalhador | tenant_admin, construction_manager |
| PUT | `/api/construction/workers/:id` | Atualizar trabalhador | tenant_admin, construction_manager |
| DELETE | `/api/construction/workers/:id` | Excluir trabalhador | tenant_admin, construction_manager |
| POST | `/api/construction/workers/:id/allocate/:projectId` | Alocar trabalhador a um projeto | tenant_admin, construction_manager |

**POST /api/construction/workers**
```json
{
  "name": "Jose da Silva",
  "email": "jose@construtora.com",
  "phone": "(11) 93333-1111",
  "role": "Pedreiro",
  "dailyCost": 250.00
}
```

---

## Modulo IA

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| POST | `/api/ai/clinic/summary` | Gerar resumo de consulta clinica com IA | Autenticado |
| POST | `/api/ai/construction/risk` | Avaliar risco de projeto de construcao com IA | Autenticado |

**POST /api/ai/clinic/summary**
```json
{
  "patientName": "Joao da Silva",
  "symptoms": "Dor de cabeca frequente, tontura",
  "diagnosis": "Cefaleia tensional",
  "prescription": "Paracetamol 750mg"
}
```

**POST /api/ai/construction/risk**
```json
{
  "projectName": "Edificio Aurora",
  "budget": 5000000,
  "totalSpent": 1130000,
  "progressPercent": 35,
  "daysRemaining": 450,
  "openTasks": 4
}
```

---

## Exemplos de Uso com cURL

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nexushub.com", "password": "Admin@123"}'
```

### Listar Pacientes (com token)
```bash
curl http://localhost:8080/api/clinic/patients?page=1&limit=10 \
  -H "Authorization: Bearer <seu_token_jwt>"
```

### Criar Projeto de Construcao
```bash
curl -X POST http://localhost:8080/api/construction/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token_jwt>" \
  -d '{
    "name": "Novo Projeto",
    "description": "Descricao do projeto",
    "budget": 1000000,
    "status": "planning"
  }'
```

---

## Swagger / OpenAPI

A documentacao interativa da API esta disponivel em:

```
http://localhost:8080/api/docs
```

Todos os endpoints estao documentados com:
- Descricao da operacao
- Parametros requeridos e opcionais
- Schemas de request/response
- Autenticacao Bearer configurada
- Tags agrupando por modulo (Auth, Users, Tenants, Clinic - Patients, Construction - Projects, etc)
