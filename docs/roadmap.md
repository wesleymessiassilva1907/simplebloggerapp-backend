# Roadmap - Vertix

## Visao Geral

Plano de evolucao da plataforma Vertix organizado em 3 fases ao longo de 90 dias, seguido de um backlog de longo prazo. Cada fase entrega valor incremental e pode ser validada com usuarios reais.

---

## Fase 1: Fundacao e Qualidade (Dias 1-30)

### Objetivo
Consolidar a base existente com testes automatizados, melhorias de UX e funcionalidades essenciais que completam o MVP.

### Entregas

| Semana | Entrega | Prioridade | Vertical |
|:------:|---------|:----------:|----------|
| 1 | Testes unitarios para modulo Core (auth, tenants, users, roles) | Alta | Core |
| 1 | Testes unitarios para modulo Clinica (patients, appointments, medical-records) | Alta | Clinica |
| 2 | Testes unitarios para modulo Construcao (projects, tasks, expenses, workers) | Alta | Construcao |
| 2 | Testes de integracao (API end-to-end com banco de testes) | Alta | Core |
| 2 | Cobertura minima de 70% em todos os modulos | Alta | Todos |
| 3 | Upload de arquivos com MinIO (fotos de pacientes, comprovantes de despesas, exames) | Alta | Core |
| 3 | Notificacoes por email (confirmacao de agendamento, lembretes) | Media | Clinica |
| 3 | Validacao completa de entrada com class-validator em todos os DTOs | Alta | Todos |
| 4 | Melhorias de UX no frontend (loading states, error handling, toasts) | Media | Frontend |
| 4 | Validacao completa de formularios no frontend | Media | Frontend |
| 4 | Pipeline CI/CD completa com GitHub Actions (lint, test, build, deploy) | Alta | DevOps |

### Metricas de Sucesso
- Cobertura de testes acima de 70%
- Zero erros criticos em producao
- Pipeline CI/CD funcional e estavel
- Tempo de build inferior a 5 minutos

### Riscos da Fase 1

| Risco | Mitigacao |
|-------|-----------|
| Testes lentos por dependencia do banco | Usar banco em memoria ou container efemero |
| MinIO com configuracao complexa | Documentar setup e criar script de inicializacao |
| Frontend desatualizado com backend | Definir contrato de API (OpenAPI) antes de implementar |

---

## Fase 2: Monetizacao e Observabilidade (Dias 31-60)

### Objetivo
Implementar integracao de pagamento real, dashboards de monitoramento e funcionalidades avancadas de relatorios.

### Entregas

| Semana | Entrega | Prioridade | Vertical |
|:------:|---------|:----------:|----------|
| 5 | Integracao com Stripe (assinaturas recorrentes, webhooks) | Alta | Core |
| 5 | Portal de billing para tenant admin (trocar plano, ver faturas, historico) | Alta | Core |
| 5 | Webhooks Stripe para ciclo de vida da assinatura | Alta | Core |
| 6 | Dashboards Grafana customizados (metricas de negocio por vertical) | Media | DevOps |
| 6 | Alertas Prometheus (latencia alta, erros 5xx, disco cheio, banco lento) | Media | DevOps |
| 6 | Metricas de negocio (consultas/dia, projetos ativos, receita mensal) | Media | Todos |
| 7 | Relatorios PDF (faturamento da clinica, resumo de obra, orcamento) | Alta | Clinica/Construcao |
| 7 | Exportacao de dados CSV/Excel para todas as listagens | Media | Todos |
| 8 | Sistema de busca avancada com filtros combinados | Media | Todos |
| 8 | Paginacao e ordenacao melhoradas no frontend (sort por coluna, filtros) | Media | Frontend |

### Metricas de Sucesso
- Fluxo de pagamento Stripe completo funcionando (criar, atualizar, cancelar assinatura)
- Dashboards Grafana com metricas de negocio em tempo real
- Relatorios PDF gerados corretamente para clinica e construcao
- Exportacao CSV funcional em todas as listagens

### Riscos da Fase 2

| Risco | Mitigacao |
|-------|-----------|
| Complexidade da integracao Stripe | Usar modo teste, webhooks com retry |
| Geracao de PDF lenta | Usar fila assincrona (BullMQ) para geracao em background |
| Dashboards Grafana sem dados suficientes | Popular com dados realistas via seed |

---

## Fase 3: Expansao e Engajamento (Dias 61-90)

### Objetivo
Expandir alcance com funcionalidades de engajamento, integracoes externas e funcionalidades avancadas por vertical.

### Entregas

| Semana | Entrega | Prioridade | Vertical |
|:------:|---------|:----------:|----------|
| 9 | PWA (Progressive Web App) com funcionalidades offline basicas | Alta | Mobile |
| 9 | Push notifications para agendamentos e lembretes | Alta | Clinica |
| 10 | Integracao WhatsApp via API (confirmacao de agendamento, lembretes) | Alta | Clinica |
| 10 | Modulo financeiro avancado (fluxo de caixa, DRE simplificado) | Media | Todos |
| 11 | Agendamento online publico (link compartilhavel sem login) | Alta | Clinica |
| 11 | Dashboard avancado de obras (timeline, Gantt simplificado) | Media | Construcao |
| 12 | Tema customizavel por tenant (cores, logo, branding) | Media | Core |
| 12 | Documentacao de API publica para integracoes externas | Media | Core |

### Metricas de Sucesso
- PWA funcional com experiencia mobile adequada
- WhatsApp integrado com confirmacao automatica de agendamentos
- Agendamento publico gerando novas conversoes
- Pelo menos 3 tenants reais usando a plataforma

### Riscos da Fase 3

| Risco | Mitigacao |
|-------|-----------|
| API do WhatsApp com limitacoes | Usar provedor intermediario (Evolution API, Twilio) |
| PWA com suporte limitado em iOS | Testar em multiplos dispositivos, fallback para web responsiva |
| Agendamento publico com spam | Implementar CAPTCHA e rate limiting |

---

## Backlog de Longo Prazo (90+ dias)

### Novos Verticais

| Vertical | Descricao | Complexidade | Prioridade |
|----------|-----------|:----------:|:----------:|
| Educacao | Gestao de escolas, alunos, turmas, notas, frequencia | Alta | Media |
| Restaurante | Cardapio digital, pedidos, mesas, cozinha, delivery | Alta | Media |
| Imobiliaria | Imoveis, contratos, visitas, comissoes | Media | Baixa |
| Pet Shop | Animais, servicos, agendamentos, produtos | Media | Baixa |

### Funcionalidades Avancadas

| Funcionalidade | Descricao | Complexidade |
|---------------|-----------|:----------:|
| Marketplace de plugins | Extensoes por vertical criadas por terceiros | Alta |
| API publica com OAuth2 | Integracoes externas autenticadas | Media |
| IA generativa real | Integracao com OpenAI/Claude para resumos e analises | Media |
| Multi-filial | Suporte a multiplas unidades por tenant | Alta |
| Webhook configuravel | Tenant define webhooks para eventos do sistema | Media |
| Modo offline completo | PWA com sincronizacao quando reconectar | Alta |
| Multi-idioma (i18n) | Portugues, Espanhol, Ingles | Media |
| White-label | Personalizacao completa por tenant | Alta |

### Infraestrutura

| Item | Descricao | Prioridade |
|------|-----------|:----------:|
| Kubernetes | Migracao de Docker Compose para K8s em producao | Alta |
| CDN | Distribuicao global de assets estaticos | Media |
| Read replicas | PostgreSQL com replicas de leitura para relatorios | Media |
| Event sourcing | Auditoria completa com replay de eventos | Baixa |
| Feature flags | Lancamento gradual de funcionalidades por tenant | Media |
| Microservicos | Extracao de modulos verticais como servicos independentes | Baixa |

---

## MVP - Clinica Medica

Funcionalidades minimas para lancamento do vertical de clinica:

| Funcionalidade | Status | Prioridade |
|---------------|:------:|:----------:|
| Cadastro de pacientes (CRUD) | Implementado | P0 |
| Cadastro de medicos (CRUD) | Implementado | P0 |
| Agendamento de consultas | Implementado | P0 |
| Prontuario eletronico | Implementado | P0 |
| Faturamento basico | Implementado | P0 |
| Dashboard financeiro | Implementado | P1 |
| Upload de exames (MinIO) | Pendente | P1 |
| Notificacao por email | Pendente | P1 |
| Integracao WhatsApp | Pendente | P2 |
| Agendamento online publico | Pendente | P2 |

## MVP - Construcao Civil

Funcionalidades minimas para lancamento do vertical de construcao:

| Funcionalidade | Status | Prioridade |
|---------------|:------:|:----------:|
| Gestao de projetos/obras (CRUD) | Implementado | P0 |
| Gestao de tarefas | Implementado | P0 |
| Controle de despesas | Implementado | P0 |
| Cadastro de trabalhadores | Implementado | P0 |
| Alocacao de equipe | Implementado | P0 |
| Dashboard de construcao | Implementado | P1 |
| Upload de comprovantes (MinIO) | Pendente | P1 |
| Relatorio PDF de obra | Pendente | P1 |
| Timeline/Gantt de tarefas | Pendente | P2 |
| App mobile para trabalhadores | Pendente | P2 |

---

## Priorizacao

A priorizacao segue a matriz **Impacto x Esforco**:

|  | Baixo Esforco | Alto Esforco |
|---|---|---|
| **Alto Impacto** | Fazer primeiro (quick wins): testes, validacoes, CI/CD | Planejar e executar: Stripe, WhatsApp, PDF |
| **Baixo Impacto** | Fazer quando possivel: melhorias de UX, busca avancada | Evitar ou postergar: novos verticais, marketplace |

## Criterios de Priorizacao

1. **P0 (Critico)**: Bloqueia lancamento ou causa perda de dados
2. **P1 (Importante)**: Necessario para uso real e retencao de usuarios
3. **P2 (Desejavel)**: Melhora experiencia mas nao impede uso
4. **P3 (Futuro)**: Backlog de longo prazo
