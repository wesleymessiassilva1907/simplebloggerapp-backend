# Plano de Implementação - NexusHub

## Visão Geral

Este documento detalha a ordem de desenvolvimento, prioridades, riscos e definição de MVP para cada vertical do NexusHub.

## Ordem de Desenvolvimento

### Princípio: Core primeiro, verticais em paralelo

```
Semana 1-2:  [Core] Auth + Tenants + Users + RBAC
Semana 3:    [Core] Audit + Health + Billing básico
Semana 4-5:  [Clínica] Patients + Doctors + Appointments
Semana 5-6:  [Construção] Projects + Tasks + Workers
Semana 6-7:  [Barbearia] Barbers + Services + Bookings
Semana 7-8:  [Clínica] Medical Records + Billing
Semana 8-9:  [Construção] Expenses + Dashboard
Semana 9-10: [Barbearia] Products + Orders + Dashboard
Semana 11:   [Frontend] Dashboards + UX polish
Semana 12:   [Infra] Docker + CI/CD + Monitoramento
```

## MVP por Vertical

### MVP Core

| Funcionalidade | Status | Critério de Aceite |
|---------------|--------|-------------------|
| Login/Logout com JWT | Essencial | Token válido retornado, rotas protegidas |
| Registro de tenant + admin | Essencial | Tenant criado com usuário admin |
| CRUD de usuários | Essencial | Admin gerencia usuários do tenant |
| RBAC com guards | Essencial | Perfis bloqueiam/liberam acesso corretamente |
| Health check | Essencial | Endpoint retorna status de todos os serviços |
| Auditoria básica | Desejável | Ações de escrita registradas no log |

### MVP Clínica Médica

| Funcionalidade | Status | Critério de Aceite |
|---------------|--------|-------------------|
| Cadastro de pacientes | Essencial | CRUD com validação de CPF único |
| Cadastro de médicos | Essencial | Vinculado a usuário com role clinic_doctor |
| Agendamento de consultas | Essencial | Sem conflito de horário, validação de disponibilidade |
| Prontuário eletrônico | Essencial | Criação por médico, histórico por paciente |
| Dashboard de consultas | Desejável | Consultas do dia, faturamento, cancelamentos |
| Faturamento | Desejável | Geração automática ao completar consulta |

### MVP Construção Civil

| Funcionalidade | Status | Critério de Aceite |
|---------------|--------|-------------------|
| CRUD de projetos/obras | Essencial | Com orçamento, prazo e status |
| Gestão de tarefas | Essencial | Atribuição a trabalhadores, status kanban |
| Registro de despesas | Essencial | Com categoria, valor e comprovante |
| Cadastro de trabalhadores | Essencial | Com função e diária |
| Dashboard financeiro | Desejável | Orçamento vs. realizado por projeto |
| Aprovação de despesas | Desejável | Workflow de aprovação pelo gerente |

### MVP Barbearia

| Funcionalidade | Status | Critério de Aceite |
|---------------|--------|-------------------|
| Cadastro de barbeiros | Essencial | Com horários e comissão |
| Catálogo de serviços | Essencial | Com preço e duração |
| Agendamento online | Essencial | Sem conflito, slots disponíveis |
| Cadastro de clientes | Essencial | Com histórico de visitas |
| Sistema de comandas | Desejável | Abrir, adicionar itens, fechar |
| Controle de produtos | Desejável | Estoque com alertas |

## Prioridades Técnicas

### P0 - Crítico (bloqueia lançamento)

1. Autenticação JWT funcional e segura
2. Isolamento multi-tenant sem vazamento de dados
3. RBAC impedindo acesso não autorizado
4. Migrations e seed funcionando no Docker
5. Nginx roteando corretamente para frontend e backend

### P1 - Importante (necessário para uso real)

1. Validação de dados de entrada em todos os endpoints
2. Tratamento de erros padronizado (filtros de exceção)
3. Paginação em todas as listagens
4. Swagger documentando todos os endpoints
5. Testes automatizados para fluxos críticos

### P2 - Desejável (melhora a experiência)

1. Dashboard com gráficos por vertical
2. Notificações por e-mail
3. Upload de arquivos (MinIO)
4. Relatórios PDF
5. Exportação CSV

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Vazamento de dados entre tenants | Baixa | Crítico | Testes de isolamento, TenantGuard obrigatório, code review |
| Performance com muitos tenants | Média | Alto | Índices compostos, connection pooling, cache Redis |
| Complexidade de manutenção | Média | Médio | Padrões consistentes, documentação, modularização |
| Scope creep por vertical | Alta | Médio | MVP bem definido, backlog priorizado, sprints curtos |
| Dependência de um dev | Alta | Alto | Documentação completa, pair programming, code review |
| Downtime em produção | Baixa | Alto | Docker healthchecks, monitoramento, backup automático |
| LGPD não conformidade | Média | Crítico | Auditoria, criptografia, política de privacidade |

## Dependências entre Módulos

```
Core (Auth + Tenants + Users + Roles)
  │
  ├── Clinic Module
  │     ├── Patients (depende de: Core)
  │     ├── Doctors (depende de: Core, Users)
  │     ├── Appointments (depende de: Patients, Doctors)
  │     ├── Medical Records (depende de: Patients, Doctors, Appointments)
  │     └── Billing (depende de: Appointments)
  │
  ├── Construction Module
  │     ├── Projects (depende de: Core)
  │     ├── Workers (depende de: Core, Users)
  │     ├── Tasks (depende de: Projects, Workers)
  │     └── Expenses (depende de: Projects)
  │
  └── Barbershop Module
        ├── Barbers (depende de: Core, Users)
        ├── Services (depende de: Core)
        ├── Clients (depende de: Core)
        ├── Bookings (depende de: Barbers, Services, Clients)
        ├── Products (depende de: Core)
        └── Orders (depende de: Bookings, Products, Clients)
```

## Critérios de Done

Uma funcionalidade é considerada pronta quando:

1. Endpoint implementado com validação de entrada
2. Guard de tenant e roles aplicado
3. Testes unitários cobrindo casos principais
4. Swagger documentado com exemplos
5. Frontend com tela funcional (CRUD ou dashboard)
6. Code review aprovado
7. Sem regressão em testes existentes

## Estratégia de Deploy

| Fase | Ambiente | Estratégia |
|------|----------|-----------|
| Desenvolvimento | Local | Docker Compose com hot reload |
| Testes | CI/CD | GitHub Actions com banco efêmero |
| Staging | Cloud | Docker Compose em VM dedicada |
| Produção | Cloud | Blue/Green deployment com rollback automático |

## Métricas de Acompanhamento

| Métrica | Meta | Ferramenta |
|---------|------|-----------|
| Cobertura de testes | > 70% | Jest + Coverage |
| Tempo de resposta P95 | < 500ms | Prometheus + Grafana |
| Uptime | > 99.5% | Health check + alertas |
| Bugs em produção | < 5/mês | Issue tracker |
| Lead time (commit → deploy) | < 30min | GitHub Actions |
| Satisfação do usuário | > 4.0/5.0 | Feedback in-app |
