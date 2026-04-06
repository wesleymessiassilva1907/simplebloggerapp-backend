# Dominio: Clinica Medica

## Visao Geral

O modulo de Clinica Medica do NexusHub e um vertical especializado para gestao completa de clinicas medicas e consultorios. Ele abrange o ciclo completo de atendimento: desde o cadastro do paciente ate o faturamento da consulta, passando por agendamento, atendimento e prontuario medico.

## Entidades

### ClinicPatient (Paciente)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant (clinica) |
| name | String | Sim | Nome completo do paciente |
| cpf | String | Nao | CPF do paciente |
| birthDate | DateTime | Nao | Data de nascimento |
| phone | String | Nao | Telefone de contato |
| email | String | Nao | Email |
| address | String | Nao | Endereco completo |
| emergencyContact | String | Nao | Contato de emergencia |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ClinicDoctor (Medico)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| name | String | Sim | Nome completo do medico |
| email | String | Nao | Email profissional |
| specialty | String | Nao | Especialidade medica (ex: Cardiologia, Clinica Geral) |
| crm | String | Nao | Registro no CRM (ex: CRM/SP 123456) |
| phone | String | Nao | Telefone |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ClinicAppointment (Agendamento)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| patientId | UUID | Sim | Referencia ao paciente |
| doctorId | UUID | Sim | Referencia ao medico |
| userId | UUID | Nao | Referencia ao usuario do sistema |
| appointmentDate | DateTime | Sim | Data e hora da consulta |
| status | String | Sim | scheduled, confirmed, in_progress, completed, canceled |
| notes | String | Nao | Observacoes |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ClinicMedicalRecord (Prontuario Medico)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| patientId | UUID | Sim | Referencia ao paciente |
| doctorId | UUID | Sim | Referencia ao medico |
| userId | UUID | Nao | Referencia ao usuario do sistema |
| appointmentId | UUID | Nao | Referencia ao agendamento |
| description | String | Sim | Descricao do atendimento |
| diagnosis | String | Nao | Diagnostico |
| prescription | String | Nao | Prescricao/receita |
| attachmentId | UUID | Nao | Referencia a anexo (exames, imagens) |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

### ClinicBilling (Faturamento)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| id | UUID | Sim | Identificador unico |
| tenantId | UUID | Sim | Referencia ao tenant |
| patientId | UUID | Sim | Referencia ao paciente |
| appointmentId | UUID | Nao | Referencia ao agendamento |
| amount | Decimal | Sim | Valor em BRL |
| status | String | Sim | pending, paid, overdue, canceled |
| paymentMethod | String | Nao | credit_card, pix, dinheiro, etc |
| dueDate | DateTime | Nao | Data de vencimento |
| paidAt | DateTime | Nao | Data do pagamento |
| createdAt | DateTime | Auto | Data de criacao |
| updatedAt | DateTime | Auto | Data de atualizacao |

## Regras de Negocio

### Cadastro de Pacientes
- Nome e campo obrigatorio
- CPF e opcional mas recomendado para identificacao unica
- Contato de emergencia e recomendado
- Paciente pertence a um unico tenant (clinica)
- Busca por nome disponivel na listagem

### Agendamento de Consultas
- Uma consulta requer paciente e medico validos dentro do mesmo tenant
- Status inicial e `scheduled`
- Fluxo de status: `scheduled` -> `confirmed` -> `in_progress` -> `completed`
- Consultas podem ser canceladas (`canceled`) a qualquer momento antes de `completed`
- Filtros disponiveis: por medico, status e data especifica
- Paginacao em todas as listagens

### Prontuarios Medicos
- Somente medicos (`clinic_doctor`) e admins podem criar/editar prontuarios
- Recepcionistas NAO tem acesso a prontuarios (dados sensiveis - LGPD)
- Um prontuario pode estar vinculado a um agendamento especifico
- Suporte a anexos (exames, imagens) via sistema de Attachments e MinIO
- Historico completo por paciente com filtro por `patientId`

### Faturamento
- Valores em BRL (Real brasileiro)
- Metodos de pagamento: cartao de credito, PIX, dinheiro, boleto
- Dashboard com resumo financeiro (total pendente, total pago, etc)
- Cobrancas podem ser vinculadas a agendamentos especificos
- Status de pagamento: pendente, pago, vencido, cancelado

## Endpoints da API

### Pacientes (`/api/clinic/patients`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/patients` | Listar pacientes (com busca e paginacao) | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/patients/:id` | Buscar paciente por ID | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/patients` | Criar novo paciente | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/patients/:id` | Atualizar paciente | tenant_admin, clinic_receptionist |
| DELETE | `/api/clinic/patients/:id` | Excluir paciente | tenant_admin |

**Query Parameters (GET lista):**
- `page` (number): Pagina atual (padrao: 1)
- `limit` (number): Itens por pagina (padrao: 10)
- `search` (string): Busca por nome do paciente

### Medicos (`/api/clinic/doctors`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/doctors` | Listar medicos | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/doctors/:id` | Buscar medico por ID | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/doctors` | Cadastrar novo medico | tenant_admin |
| PUT | `/api/clinic/doctors/:id` | Atualizar medico | tenant_admin |
| DELETE | `/api/clinic/doctors/:id` | Excluir medico | tenant_admin |

### Agendamentos (`/api/clinic/appointments`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/appointments` | Listar agendamentos (com filtros) | tenant_admin, clinic_doctor, clinic_receptionist |
| GET | `/api/clinic/appointments/:id` | Buscar agendamento por ID | tenant_admin, clinic_doctor, clinic_receptionist |
| POST | `/api/clinic/appointments` | Criar novo agendamento | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/appointments/:id` | Atualizar agendamento | tenant_admin, clinic_doctor, clinic_receptionist |
| DELETE | `/api/clinic/appointments/:id` | Excluir agendamento | tenant_admin |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `doctorId` (UUID): Filtrar por medico
- `status` (string): Filtrar por status (scheduled, confirmed, etc)
- `date` (YYYY-MM-DD): Filtrar por data especifica

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

### Faturamento Clinico (`/api/clinic/billing`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| GET | `/api/clinic/billing/dashboard` | Dashboard financeiro | tenant_admin, clinic_receptionist |
| GET | `/api/clinic/billing` | Listar faturamentos | tenant_admin, clinic_receptionist |
| GET | `/api/clinic/billing/:id` | Buscar faturamento por ID | tenant_admin, clinic_receptionist |
| POST | `/api/clinic/billing` | Criar faturamento | tenant_admin, clinic_receptionist |
| PUT | `/api/clinic/billing/:id` | Atualizar faturamento | tenant_admin, clinic_receptionist |
| DELETE | `/api/clinic/billing/:id` | Excluir faturamento | tenant_admin |

**Query Parameters (GET lista):**
- `page`, `limit`: Paginacao
- `status` (string): Filtrar por status (pending, paid, overdue, canceled)

### IA Clinica (`/api/ai/clinic`)

| Metodo | Rota | Descricao | Roles Permitidas |
|--------|------|-----------|-----------------|
| POST | `/api/ai/clinic/summary` | Gerar resumo de consulta com IA | Qualquer autenticado |

## Modelo de Dados (Relacionamentos)

```
ClinicPatient
    |
    +-- 1:N --> ClinicAppointment
    |               |
    |               +-- N:1 --> ClinicDoctor
    |               +-- 1:N --> ClinicMedicalRecord
    |               +-- 1:N --> ClinicBilling
    |
    +-- 1:N --> ClinicMedicalRecord
    |               |
    |               +-- N:1 --> ClinicDoctor
    |               +-- N:1 --> Attachment (opcional)
    |
    +-- 1:N --> ClinicBilling
```

## Fluxos de Trabalho

### 1. Cadastro de Paciente

```
Recepcionista acessa o sistema
    |
    v
POST /api/clinic/patients
    |
    +-- Dados: nome, CPF, telefone, email, endereco, contato emergencia
    +-- Validacao dos campos obrigatorios
    +-- Registro criado com tenant_id do usuario logado
    |
    v
Paciente cadastrado com sucesso (retorna objeto criado)
```

### 2. Agendamento de Consulta

```
Recepcionista seleciona paciente e medico
    |
    v
POST /api/clinic/appointments
    |
    +-- Dados: patientId, doctorId, appointmentDate, notes
    +-- Validacao: paciente e medico existem no tenant
    +-- Status inicial: "scheduled"
    |
    v
Consulta agendada --> Confirmacao
    |
    v
PUT /api/clinic/appointments/:id  (status: "confirmed")
    |
    v
Medico inicia atendimento
    |
    v
PUT /api/clinic/appointments/:id  (status: "in_progress")
    |
    v
Medico finaliza atendimento
    |
    v
PUT /api/clinic/appointments/:id  (status: "completed")
```

### 3. Criacao de Prontuario Medico

```
Medico finaliza consulta
    |
    v
POST /api/clinic/medical-records
    |
    +-- Dados: patientId, doctorId, appointmentId, description
    +-- Campos opcionais: diagnosis, prescription, attachmentId
    +-- Somente medicos e admins podem criar
    |
    v
Prontuario salvo no historico do paciente
    |
    v
GET /api/clinic/medical-records?patientId=xxx
    |
    v
Historico completo do paciente disponivel para consulta
```

### 4. Faturamento

```
Consulta concluida
    |
    v
POST /api/clinic/billing
    |
    +-- Dados: patientId, appointmentId, amount, paymentMethod
    +-- Status inicial: "pending"
    +-- dueDate definido conforme politica da clinica
    |
    v
Paciente efetua pagamento
    |
    v
PUT /api/clinic/billing/:id
    |
    +-- status: "paid"
    +-- paymentMethod: "pix" / "credit_card" / "dinheiro"
    +-- paidAt: data/hora do pagamento
    |
    v
GET /api/clinic/billing/dashboard
    |
    v
Resumo financeiro atualizado com totais
```

## Papeis e Permissoes - Clinica

| Funcionalidade | tenant_admin | clinic_doctor | clinic_receptionist |
|---------------|:------------:|:-------------:|:-------------------:|
| Listar pacientes | Sim | Sim | Sim |
| Criar/editar paciente | Sim | Nao | Sim |
| Excluir paciente | Sim | Nao | Nao |
| Listar medicos | Sim | Sim | Sim |
| Criar/editar/excluir medico | Sim | Nao | Nao |
| Listar agendamentos | Sim | Sim | Sim |
| Criar agendamento | Sim | Nao | Sim |
| Atualizar agendamento | Sim | Sim | Sim |
| Excluir agendamento | Sim | Nao | Nao |
| Acessar prontuarios | Sim | Sim | **Nao** |
| Criar/editar prontuario | Sim | Sim | **Nao** |
| Excluir prontuario | Sim | Nao | Nao |
| Dashboard financeiro | Sim | Nao | Sim |
| Gerenciar faturamento | Sim | Nao | Sim |
| Excluir faturamento | Sim | Nao | Nao |

## Dados de Demonstracao (Seed)

O seed cria os seguintes dados para o tenant "Clinica Sao Paulo" (`clinica-sao-paulo`):

**Medicos:**
- Dra. Ana Santos - Clinica Geral (CRM/SP 123456)
- Dr. Ricardo Oliveira - Cardiologia (CRM/SP 654321)

**Pacientes:**
- Joao da Silva (CPF: 123.456.789-00)
- Ana Beatriz Souza (CPF: 987.654.321-00)
- Carlos Eduardo Lima (CPF: 456.789.123-00)
- Fernanda Costa (CPF: 321.654.987-00)
- Roberto Almeida (CPF: 654.321.987-00)

**Agendamentos:**
- 4 consultas (hoje e amanha) com status variados (scheduled, confirmed)

**Faturamentos:**
- R$ 250,00 - pago (cartao de credito)
- R$ 180,00 - pendente
- R$ 350,00 - pago (PIX)
