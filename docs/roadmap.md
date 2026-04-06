# Roadmap - NexusHub

## Visão Geral

Plano de evolução da plataforma NexusHub em 3 fases ao longo de 90 dias, seguido de um backlog de longo prazo. Cada fase entrega valor incremental e pode ser validada com usuários.

---

## Fase 1: Fundação e Qualidade (Dias 1-30)

### Objetivo
Consolidar a base existente com testes, melhorias de UX e funcionalidades essenciais que faltam.

### Entregas

| Semana | Entrega | Prioridade | Vertical |
|--------|---------|-----------|----------|
| 1 | Testes unitários para módulo Core (auth, tenants, users) | Alta | Core |
| 1 | Testes unitários para módulo Clínica (patients, appointments) | Alta | Clínica |
| 2 | Testes unitários para módulo Construção (projects, tasks) | Alta | Construção |
| 2 | Testes unitários para módulo Barbearia (barbers, bookings) | Alta | Barbearia |
| 2 | Testes de integração (API end-to-end) | Alta | Core |
| 3 | Upload de arquivos com MinIO (fotos, comprovantes, exames) | Alta | Core |
| 3 | Notificações por e-mail (confirmação de agendamento, lembretes) | Média | Clínica/Barbearia |
| 4 | Melhorias de UX no frontend (loading states, error handling, toast) | Média | Frontend |
| 4 | Validação completa de formulários no frontend | Média | Frontend |
| 4 | Pipeline CI/CD com GitHub Actions (lint, test, build) | Alta | DevOps |

### Métricas de Sucesso
- Cobertura de testes acima de 70%
- Zero erros críticos em produção
- Pipeline CI/CD funcional e estável

---

## Fase 2: Monetização e Observabilidade (Dias 31-60)

### Objetivo
Implementar integração de pagamento real, dashboards de monitoramento e funcionalidades avançadas.

### Entregas

| Semana | Entrega | Prioridade | Vertical |
|--------|---------|-----------|----------|
| 5 | Integração com Stripe (assinaturas, webhooks, faturas) | Alta | Core |
| 5 | Portal de billing para tenant admin (trocar plano, ver faturas) | Alta | Core |
| 6 | Dashboards Grafana customizados (métricas de negócio) | Média | DevOps |
| 6 | Alertas Prometheus (latência alta, erros 5xx, disco cheio) | Média | DevOps |
| 7 | Relatórios PDF (faturamento clínica, resumo de obra, comissões) | Alta | Todos |
| 7 | Exportação de dados (CSV/Excel) para listagens | Média | Todos |
| 8 | Sistema de busca avançada com filtros combinados | Média | Todos |
| 8 | Paginação e ordenação melhoradas no frontend | Média | Frontend |

### Métricas de Sucesso
- Fluxo de pagamento completo funcionando
- Dashboards com métricas de negócio em tempo real
- Relatórios PDF gerados corretamente

---

## Fase 3: Expansão e Engajamento (Dias 61-90)

### Objetivo
Expandir alcance com app mobile, integrações externas e funcionalidades avançadas por vertical.

### Entregas

| Semana | Entrega | Prioridade | Vertical |
|--------|---------|-----------|----------|
| 9 | App mobile (React Native ou PWA) com funcionalidades essenciais | Alta | Mobile |
| 9 | Push notifications para agendamentos e lembretes | Alta | Mobile |
| 10 | Integração WhatsApp (confirmação de agendamento, lembretes) | Alta | Clínica/Barbearia |
| 10 | Módulo financeiro avançado (fluxo de caixa, DRE simplificado) | Média | Todos |
| 11 | Agendamento online público (link compartilhável sem login) | Alta | Clínica/Barbearia |
| 11 | Galeria de fotos para barbearia (antes/depois) | Média | Barbearia |
| 12 | Multi-idioma (i18n) - Português e Espanhol | Baixa | Core |
| 12 | Tema customizável por tenant (cores, logo) | Média | Core |

### Métricas de Sucesso
- App mobile publicado nas lojas (ou PWA funcional)
- WhatsApp integrado com confirmação automática
- Agendamento público gerando conversões

---

## Backlog de Longo Prazo (90+ dias)

### Novos Verticais

| Vertical | Descrição | Complexidade |
|----------|-----------|-------------|
| Educação | Gestão de escolas, alunos, turmas, notas, frequência | Alta |
| Restaurante | Cardápio digital, pedidos, mesas, cozinha, delivery | Alta |
| Imobiliária | Imóveis, contratos, visitas, comissões | Média |
| Pet Shop | Animais, serviços, agendamentos, produtos | Média |

### Funcionalidades Avançadas

| Funcionalidade | Descrição |
|---------------|-----------|
| Marketplace de plugins | Extensões por vertical criadas por terceiros |
| API pública com OAuth2 | Integrações externas autenticadas |
| IA generativa real | Integração com OpenAI/Claude para resumos e análises |
| Multi-filial | Suporte a múltiplas unidades por tenant |
| Webhook configurável | Tenant define webhooks para eventos do sistema |
| Modo offline | PWA com sincronização quando reconectar |

### Infraestrutura

| Item | Descrição |
|------|-----------|
| Kubernetes | Migração de Docker Compose para K8s em produção |
| CDN | Distribuição global de assets estáticos |
| Read replicas | PostgreSQL com réplicas de leitura para relatórios |
| Event sourcing | Auditoria completa com replay de eventos |
| Feature flags | Lançamento gradual de funcionalidades por tenant |

---

## Priorização

A priorização segue a matriz **Impacto x Esforço**:

| | Baixo Esforço | Alto Esforço |
|---|---|---|
| **Alto Impacto** | Fazer primeiro (quick wins) | Planejar e executar |
| **Baixo Impacto** | Fazer quando possível | Evitar ou postergar |
