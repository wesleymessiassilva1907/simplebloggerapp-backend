# Plano de Implementacao - Vertix

## Visao Geral

Este documento detalha a ordem de desenvolvimento, prioridades, riscos, definicao de MVP por vertical e recomendacoes de equipe para o Vertix.

## Ordem de Desenvolvimento

### Principio: Core primeiro, verticais em paralelo

O modulo Core deve ser implementado e estabilizado antes dos verticais, pois todos dependem de autenticacao, multi-tenancy e RBAC.

```
Semana 1-2:  [Core] Auth + Tenants + Users + RBAC + Health
Semana 3:    [Core] Audit + Notifications + Billing basico
Semana 4-5:  [Clinica] Patients + Doctors + Appointments
Semana 5-6:  [Construcao] Projects + Tasks + Workers
Semana 7:    [Clinica] Medical Records + Billing + Dashboard
Semana 8:    [Construcao] Expenses + Worker Allocation + Dashboard
Semana 9:    [AI] Clinic Summary + Construction Risk
Semana 10:   [Frontend] Dashboards + UX polish + Formularios
Semana 11:   [Testes] Unit tests + Integration tests + E2E
Semana 12:   [Infra] Docker + CI/CD + Monitoramento + Deploy
```

### Dependencias entre Modulos

```
Core (Auth + Tenants + Users + Roles + Health)
  |
  +-- Clinic Module
  |     +-- Patients (depende de: Core)
  |     +-- Doctors (depende de: Core)
  |     +-- Appointments (depende de: Patients, Doctors)
  |     +-- Medical Records (depende de: Patients, Doctors, Appointments)
  |     +-- Clinic Billing (depende de: Patients, Appointments)
  |
  +-- Construction Module
  |     +-- Projects (depende de: Core)
  |     +-- Workers (depende de: Core)
  |     +-- Tasks (depende de: Projects)
  |     +-- Expenses (depende de: Projects)
  |     +-- Project Workers (depende de: Projects, Workers)
  |
  +-- AI Module
        +-- Clinic Summary (depende de: Clinic)
        +-- Construction Risk (depende de: Construction)
```

## Prioridades Tecnicas

### P0 - Critico (bloqueia lancamento)

| # | Item | Responsavel | Status |
|:-:|------|-------------|:------:|
| 1 | Autenticacao JWT funcional e segura | Backend | Implementado |
| 2 | Isolamento multi-tenant sem vazamento de dados | Backend | Implementado |
| 3 | RBAC impedindo acesso nao autorizado em todos os endpoints | Backend | Implementado |
| 4 | Migrations e seed funcionando no Docker | DevOps | Implementado |
| 5 | Nginx roteando corretamente para frontend e backend | DevOps | Implementado |
| 6 | Health check verificando todos os servicos | Backend | Implementado |
| 7 | Swagger documentando todos os endpoints | Backend | Implementado |

### P1 - Importante (necessario para uso real)

| # | Item | Responsavel | Status |
|:-:|------|-------------|:------:|
| 1 | Validacao de dados de entrada em todos os endpoints | Backend | Em andamento |
| 2 | Tratamento de erros padronizado (filtros de excecao) | Backend | Implementado |
| 3 | Paginacao em todas as listagens | Backend | Implementado |
| 4 | Testes automatizados para fluxos criticos | QA | Pendente |
| 5 | Upload de arquivos com MinIO | Backend | Pendente |
| 6 | Notificacoes por email | Backend | Pendente |
| 7 | Dashboard funcional no frontend | Frontend | Em andamento |

### P2 - Desejavel (melhora a experiencia)

| # | Item | Responsavel | Status |
|:-:|------|-------------|:------:|
| 1 | Dashboard com graficos por vertical | Frontend | Pendente |
| 2 | Relatorios PDF (faturamento, resumo de obra) | Backend | Pendente |
| 3 | Exportacao CSV/Excel | Backend | Pendente |
| 4 | Busca avancada com filtros combinados | Backend | Pendente |
| 5 | Integracao Stripe para pagamentos | Backend | Pendente |
| 6 | IA real (OpenAI/Claude) para resumos e analises | Backend | Pendente |

## MVP por Vertical

### MVP Core

| Funcionalidade | Criterio de Aceite | Status |
|---------------|-------------------|:------:|
| Login/Logout com JWT | Token valido retornado, rotas protegidas | OK |
| Registro de tenant + admin | Tenant criado com usuario admin e role atribuida | OK |
| CRUD de usuarios | Admin gerencia usuarios do tenant com paginacao | OK |
| RBAC com guards | 6 perfis bloqueiam/liberam acesso corretamente | OK |
| Health check | Endpoint retorna status do banco e servicos | OK |
| Auditoria basica | Acoes de escrita registradas no log de auditoria | OK |
| Gestao de roles | Atribuir e remover roles de usuarios | OK |
| Billing basico | Visualizar assinatura atual e planos disponiveis | OK |
| Notificacoes | Listar notificacoes do tenant | OK |

### MVP Clinica Medica

| Funcionalidade | Criterio de Aceite | Status |
|---------------|-------------------|:------:|
| Cadastro de pacientes | CRUD com busca por nome e paginacao | OK |
| Cadastro de medicos | CRUD com especialidade e CRM | OK |
| Agendamento de consultas | Criar com paciente+medico, filtrar por data/medico/status | OK |
| Prontuario eletronico | Criacao por medico, historico por paciente, dados sensiveis protegidos | OK |
| Faturamento clinico | CRUD com dashboard financeiro, status de pagamento | OK |
| Dashboard | Resumo financeiro com totais | OK |

### MVP Construcao Civil

| Funcionalidade | Criterio de Aceite | Status |
|---------------|-------------------|:------:|
| CRUD de projetos/obras | Com orcamento, prazo, status e localizacao | OK |
| Gestao de tarefas | Vinculadas a projeto, progresso percentual, filtro por status | OK |
| Registro de despesas | Com categoria, valor, fornecedor, filtro por projeto | OK |
| Cadastro de trabalhadores | Com funcao e custo diario | OK |
| Alocacao de equipe | Vincular trabalhador a projeto com data de alocacao | OK |
| Dashboard | Resumo de projetos com metricas | OK |

## Roadmap 90 Dias - Detalhado

### Dias 1-30: Fundacao

```
Semana 1:
  - [ ] Testes unitarios Core: AuthService, UsersService, TenantsService
  - [ ] Testes unitarios Core: RolesService, AuditService
  - [ ] Configurar Jest com banco de teste isolado

Semana 2:
  - [ ] Testes unitarios Clinica: PatientsService, DoctorsService
  - [ ] Testes unitarios Clinica: AppointmentsService, MedicalRecordsService
  - [ ] Testes unitarios Construcao: ProjectsService, TasksService
  - [ ] Testes unitarios Construcao: ExpensesService, WorkersService

Semana 3:
  - [ ] Testes de integracao E2E: fluxo de auth completo
  - [ ] Testes de integracao E2E: fluxo clinica (paciente -> agendamento -> prontuario)
  - [ ] Testes de integracao E2E: fluxo construcao (projeto -> tarefa -> despesa)
  - [ ] Upload de arquivos via MinIO (exames, comprovantes, fotos)

Semana 4:
  - [ ] Notificacoes por email (Nodemailer + templates)
  - [ ] Melhorias de UX no frontend (loading, error states, feedback)
  - [ ] Pipeline CI/CD completa (GitHub Actions)
  - [ ] Correcoes de bugs encontrados nos testes
```

### Dias 31-60: Monetizacao

```
Semana 5:
  - [ ] Integracao Stripe: criar customer, subscription, webhook
  - [ ] Portal de billing: trocar plano, cancelar, ver historico
  - [ ] Logica de limites por plano (usuarios, armazenamento)

Semana 6:
  - [ ] Dashboards Grafana: metricas HTTP, latencia, erros
  - [ ] Dashboards Grafana: metricas de negocio (consultas/dia, projetos)
  - [ ] Alertas Prometheus: erro 5xx > 1%, latencia P95 > 1s

Semana 7:
  - [ ] Geracao de PDF: faturamento da clinica
  - [ ] Geracao de PDF: resumo de obra (orcamento vs realizado)
  - [ ] Exportacao CSV para todas as listagens

Semana 8:
  - [ ] Busca avancada com filtros combinados
  - [ ] Ordenacao por coluna no frontend
  - [ ] Melhorias de performance (cache Redis para listagens)
```

### Dias 61-90: Expansao

```
Semana 9:
  - [ ] PWA: service worker, manifest, instalacao
  - [ ] Push notifications (agendamentos, lembretes)
  - [ ] Testes de compatibilidade mobile

Semana 10:
  - [ ] Integracao WhatsApp (API de confirmacao de agendamento)
  - [ ] Modulo financeiro: fluxo de caixa simplificado
  - [ ] DRE simplificado por tenant

Semana 11:
  - [ ] Agendamento online publico (link compartilhavel)
  - [ ] Dashboard avancado de obras (timeline de tarefas)
  - [ ] Tema customizavel por tenant (cores, logo)

Semana 12:
  - [ ] Documentacao de API publica
  - [ ] Preparacao para lancamento (checklist de producao)
  - [ ] Deploy em ambiente de producao
```

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|:------------:|:-------:|-----------|
| Vazamento de dados entre tenants | Baixa | Critico | Testes de isolamento automatizados, TenantGuard obrigatorio, code review rigoroso |
| Performance com muitos tenants | Media | Alto | Indices compostos com tenantId, connection pooling, cache Redis, paginacao |
| Complexidade de manutencao | Media | Medio | Padroes consistentes entre modulos, documentacao, modularizacao NestJS |
| Scope creep por vertical | Alta | Medio | MVP bem definido, backlog priorizado, sprints de 2 semanas |
| Dependencia de desenvolvedor unico | Alta | Alto | Documentacao completa, pair programming, code review, CI/CD |
| Downtime em producao | Baixa | Alto | Docker healthchecks, monitoramento Grafana, backup automatico, blue/green deploy |
| LGPD nao conformidade | Media | Critico | Auditoria, criptografia, acesso restrito a prontuarios, DPO |
| Integracao Stripe falhar | Media | Alto | Modo teste, webhooks com retry, fallback para pagamento manual |
| WhatsApp API com limitacoes | Media | Medio | Usar provedor intermediario, fallback para email/SMS |

## Recomendacoes de Equipe

### Equipe Minima (3 pessoas)

| Papel | Responsabilidades |
|-------|------------------|
| **Backend/Lead** | NestJS, Prisma, API, arquitetura, code review |
| **Frontend** | Next.js, React, Tailwind, UX, responsividade |
| **DevOps/QA** | Docker, CI/CD, monitoramento, testes, deploy |

### Equipe Ideal (5-6 pessoas)

| Papel | Responsabilidades |
|-------|------------------|
| **Tech Lead** | Arquitetura, code review, decisoes tecnicas, mentoria |
| **Backend Senior** | NestJS, Prisma, integracao Stripe, API, seguranca |
| **Backend Pleno** | Modulos verticais, testes, DTOs, validacoes |
| **Frontend Pleno** | Next.js, dashboards, formularios, UX |
| **DevOps** | Docker, K8s, CI/CD, monitoramento, infraestrutura |
| **QA** | Testes automatizados, E2E, testes manuais, documentacao |

### Metodologia Recomendada

- **Sprints de 2 semanas** com planning, daily e review
- **Code review obrigatorio** para todo merge em main
- **Feature branches** com PR para main
- **Continuous Integration** com testes automatizados
- **Deploy automatico** para staging apos merge em main
- **Deploy manual** para producao apos QA em staging

## Criterios de Done

Uma funcionalidade e considerada pronta quando:

1. Endpoint implementado com validacao de entrada (class-validator)
2. Guards de tenant e roles aplicados corretamente
3. Testes unitarios cobrindo casos principais (happy path + erros)
4. Swagger documentado com descricao e exemplos
5. Frontend com tela funcional (formulario/listagem/dashboard)
6. Code review aprovado por pelo menos 1 desenvolvedor
7. Sem regressao em testes existentes (CI verde)
8. Documentacao atualizada se necessario

## Estrategia de Deploy

| Fase | Ambiente | Estrategia |
|------|----------|-----------|
| Desenvolvimento | Local | Docker Compose com hot reload e bind mounts |
| Testes | CI/CD | GitHub Actions com banco efemero e container de teste |
| Staging | Cloud | Docker Compose em VM dedicada ou ECS |
| Producao | Cloud | Blue/Green deployment em EKS com rollback automatico |

### Checklist de Deploy para Producao

- [ ] Trocar todas as senhas padrao (banco, MinIO, Grafana)
- [ ] Gerar JWT_SECRET forte (256+ bits)
- [ ] Configurar HTTPS com certificado TLS valido
- [ ] Configurar CORS apenas para dominios de producao
- [ ] Habilitar rate limiting no Nginx
- [ ] Configurar backups automaticos do PostgreSQL
- [ ] Configurar alertas no Grafana/Prometheus
- [ ] Executar migrations e seed em producao
- [ ] Validar health checks de todos os servicos
- [ ] Realizar teste de carga basico
- [ ] Verificar logs de auditoria funcionando
- [ ] Configurar DNS e certificado SSL

## Metricas de Acompanhamento

| Metrica | Meta | Ferramenta |
|---------|------|-----------|
| Cobertura de testes | > 70% | Jest + Istanbul |
| Tempo de resposta P95 | < 500ms | Prometheus + Grafana |
| Uptime | > 99.5% | Health check + alertas |
| Bugs em producao | < 5/mes | Issue tracker (GitHub Issues) |
| Lead time (commit -> deploy) | < 30min | GitHub Actions |
| Taxa de erro (5xx) | < 1% | Prometheus |
| Satisfacao do usuario | > 4.0/5.0 | Feedback in-app |

## Estimativa de Custos (Infraestrutura Producao)

| Servico | Estimativa Mensal | Provedor |
|---------|:-----------------:|----------|
| VM/Servidor (2vCPU, 4GB RAM) | R$ 150-300 | AWS/DigitalOcean/Hetzner |
| PostgreSQL gerenciado | R$ 100-200 | RDS/Supabase |
| Redis gerenciado | R$ 50-100 | ElastiCache/Upstash |
| Armazenamento S3 (50GB) | R$ 10-20 | S3/Cloudflare R2 |
| Dominio + SSL | R$ 50/ano | Registro.br + Let's Encrypt |
| **Total estimado** | **R$ 350-650/mes** | |

Nota: Custos podem variar conforme o provedor e o volume de uso. Para MVP, uma unica VM com Docker Compose e suficiente.
