# Referência da API - NexusHub

## Informações Gerais

- **Base URL**: `http://localhost:8080/api`
- **Formato**: JSON
- **Autenticação**: Bearer Token (JWT) no header `Authorization`
- **Documentação Interativa**: Swagger UI disponível em `/api/docs`

## Autenticação

Todas as rotas (exceto login e registro) exigem o header:
```
Authorization: Bearer <jwt_token>
```

## Módulo Core

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login com email e senha | Não |
| POST | `/api/auth/register-initial-tenant-admin` | Registrar tenant + admin | Não |
| GET | `/api/auth/me` | Dados do usuário autenticado | Sim |

**POST /api/auth/login**
```json
// Request
{ "email": "admin@nexushub.com", "password": "Admin@123" }

// Response 200
{ "access_token": "eyJhbGciOiJIUzI1NiIs...", "user": { "id": "uuid", "email": "...", "roles": ["super_admin"] } }
```

### Users

| Método | Rota | Descrição | Perfis |
|--------|------|-----------|--------|
| GET | `/api/users` | Listar usuários do tenant | tenant_admin |
| GET | `/api/users/:id` | Detalhar usuário | tenant_admin |
| POST | `/api/users` | Criar usuário | tenant_admin |
| PUT | `/api/users/:id` | Atualizar usuário | tenant_admin |
| DELETE | `/api/users/:id` | Desativar usuário | tenant_admin |

### Tenants

| Método | Rota | Descrição | Perfis |
|--------|------|-----------|--------|
| GET | `/api/tenants` | Listar tenants | super_admin |
| GET | `/api/tenants/:id` | Detalhar tenant | super_admin, tenant_admin |
| PUT | `/api/tenants/:id` | Atualizar tenant | tenant_admin |

### Roles

| Método | Rota | Descrição | Perfis |
|--------|------|-----------|--------|
| GET | `/api/roles` | Listar roles disponíveis | tenant_admin |
| POST | `/api/roles/assign` | Atribuir role a usuário | tenant_admin |
| DELETE | `/api/roles/remove` | Remover role de usuário | tenant_admin |

### Billing

| Método | Rota | Descrição | Perfis |
|--------|------|-----------|--------|
| GET | `/api/billing/subscription` | Assinatura atual | tenant_admin |
| GET | `/api/billing/plans` | Planos disponíveis | tenant_admin |
| POST | `/api/billing/change-plan` | Alterar plano | tenant_admin |

### Audit

| Método | Rota | Descrição | Perfis |
|--------|------|-----------|--------|
| GET | `/api/audit` | Listar logs de auditoria | tenant_admin, super_admin |

### Notifications

| Método | Rota | Descrição | Perfis |
|--------|------|-----------|--------|
| GET | `/api/notifications` | Listar notificações | all authenticated |
| PATCH | `/api/notifications/:id/read` | Marcar como lida | all authenticated |

### Health

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/health` | Status de todos os serviços | Não |

## Módulo Clínica

### Pacientes

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clinic/patients` | Listar pacientes (paginado) |
| GET | `/api/clinic/patients/:id` | Detalhar paciente |
| POST | `/api/clinic/patients` | Cadastrar paciente |
| PUT | `/api/clinic/patients/:id` | Atualizar paciente |
| DELETE | `/api/clinic/patients/:id` | Desativar paciente |

### Médicos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clinic/doctors` | Listar médicos |
| GET | `/api/clinic/doctors/:id` | Detalhar médico |
| POST | `/api/clinic/doctors` | Cadastrar médico |
| PUT | `/api/clinic/doctors/:id` | Atualizar médico |

### Agendamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clinic/appointments` | Listar agendamentos (filtros: data, médico, status) |
| GET | `/api/clinic/appointments/:id` | Detalhar agendamento |
| POST | `/api/clinic/appointments` | Criar agendamento |
| PUT | `/api/clinic/appointments/:id` | Atualizar agendamento |
| PATCH | `/api/clinic/appointments/:id/status` | Alterar status |

### Prontuários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clinic/medical-records/patient/:patientId` | Prontuários do paciente |
| POST | `/api/clinic/medical-records` | Criar registro médico |
| PUT | `/api/clinic/medical-records/:id` | Atualizar registro |

### Faturamento Clínico

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clinic/billing` | Listar faturamentos |
| GET | `/api/clinic/billing/dashboard` | Dashboard financeiro |
| PATCH | `/api/clinic/billing/:id/pay` | Registrar pagamento |

## Módulo Construção Civil

### Projetos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/construction/projects` | Listar projetos |
| GET | `/api/construction/projects/:id` | Detalhar projeto (com resumo financeiro) |
| POST | `/api/construction/projects` | Criar projeto |
| PUT | `/api/construction/projects/:id` | Atualizar projeto |
| PATCH | `/api/construction/projects/:id/status` | Alterar status |
| GET | `/api/construction/projects/dashboard` | Dashboard geral |

### Tarefas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/construction/tasks?projectId=` | Listar tarefas do projeto |
| POST | `/api/construction/tasks` | Criar tarefa |
| PUT | `/api/construction/tasks/:id` | Atualizar tarefa |
| PATCH | `/api/construction/tasks/:id/status` | Alterar status |

### Despesas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/construction/expenses?projectId=` | Listar despesas |
| POST | `/api/construction/expenses` | Registrar despesa |
| PATCH | `/api/construction/expenses/:id/approve` | Aprovar despesa |
| PATCH | `/api/construction/expenses/:id/reject` | Rejeitar despesa |

### Trabalhadores

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/construction/workers` | Listar trabalhadores |
| POST | `/api/construction/workers` | Cadastrar trabalhador |
| PUT | `/api/construction/workers/:id` | Atualizar trabalhador |
| POST | `/api/construction/workers/:id/allocate` | Alocar em projeto |

## Módulo Barbearia

### Barbeiros

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/barbershop/barbers` | Listar barbeiros |
| POST | `/api/barbershop/barbers` | Cadastrar barbeiro |
| PUT | `/api/barbershop/barbers/:id` | Atualizar barbeiro |

### Serviços

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/barbershop/services` | Listar serviços |
| POST | `/api/barbershop/services` | Criar serviço |
| PUT | `/api/barbershop/services/:id` | Atualizar serviço |

### Agendamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/barbershop/bookings` | Listar agendamentos |
| POST | `/api/barbershop/bookings` | Criar agendamento |
| PATCH | `/api/barbershop/bookings/:id/status` | Alterar status |
| GET | `/api/barbershop/bookings/available-slots` | Horários disponíveis |

### Produtos e Comandas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/barbershop/products` | Listar produtos |
| POST | `/api/barbershop/products` | Cadastrar produto |
| GET | `/api/barbershop/orders` | Listar comandas |
| POST | `/api/barbershop/orders` | Abrir comanda |
| PATCH | `/api/barbershop/orders/:id/close` | Fechar comanda |

## Módulo IA

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/ai/clinic-summary` | Resumo de consulta clínica |
| POST | `/api/ai/construction-risk` | Análise de risco de projeto |

## Paginação

Endpoints de listagem suportam os query params:

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Número da página |
| limit | number | 10 | Itens por página |
| search | string | - | Busca textual |
| sortBy | string | createdAt | Campo de ordenação |
| sortOrder | string | desc | Direção (asc/desc) |

## Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida (validação) |
| 401 | Não autenticado |
| 403 | Sem permissão (RBAC) |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicata) |
| 500 | Erro interno do servidor |
