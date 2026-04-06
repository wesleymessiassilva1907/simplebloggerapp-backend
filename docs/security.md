# Segurança - NexusHub

## Visão Geral

O NexusHub implementa múltiplas camadas de segurança para proteger dados sensíveis de pacientes, informações financeiras e garantir o isolamento entre tenants.

## Autenticação (JWT)

### Fluxo de Autenticação

```
1. Cliente envia POST /api/auth/login com { email, password }
2. Backend valida credenciais contra hash bcrypt no banco
3. Backend gera JWT com payload: { sub: userId, tenantId, roles }
4. Cliente armazena token e envia em todas as requisições:
   Authorization: Bearer <token>
5. JwtStrategy valida assinatura e expiração do token
6. Guards extraem tenantId e roles para autorização
```

### Configuração do JWT

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| Algoritmo | HS256 | HMAC com SHA-256 |
| Expiração | 24h | Tempo de vida do access token |
| Secret | Variável de ambiente | Chave secreta via `JWT_SECRET` |
| Payload | sub, tenantId, roles | Dados do usuário no token |

### Boas Práticas Implementadas

- Senhas hasheadas com **bcrypt** (salt rounds: 10)
- JWT secret configurável via variável de ambiente
- Tokens não armazenados no servidor (stateless)
- Validação de expiração em cada requisição

## Autorização (RBAC)

### Perfis e Permissões

| Perfil | Escopo | Permissões |
|--------|--------|-----------|
| `super_admin` | Global | Acesso total, gerenciar tenants |
| `tenant_admin` | Tenant | Gerenciar usuários, configurações, billing |
| `clinic_doctor` | Clínica | Pacientes (leitura), agendamentos, prontuários (CRUD) |
| `clinic_receptionist` | Clínica | Pacientes (CRUD), agendamentos (CRUD), faturamento |
| `construction_manager` | Construção | Projetos, tarefas, despesas (CRUD), trabalhadores |
| `construction_worker` | Construção | Tarefas (próprias), despesas (criar) |
| `barbershop_barber` | Barbearia | Agendamentos (próprios), clientes, comandas |
| `barbershop_receptionist` | Barbearia | Agendamentos, clientes, comandas, produtos |

### Implementação dos Guards

```
Requisição HTTP
    │
    ▼
[JwtAuthGuard]        → Valida token JWT (401 se inválido)
    │
    ▼
[TenantGuard]         → Extrai e valida tenantId (403 se inativo)
    │
    ▼
[RolesGuard]          → Verifica @Roles() decorator (403 se não autorizado)
    │
    ▼
[Controller]          → Processa a requisição
```

### Decorator @Roles

```typescript
@Roles('clinic_doctor', 'tenant_admin')
@Get('medical-records')
findAll() { ... }
```

Somente usuários com os perfis especificados podem acessar o endpoint.

## Isolamento Multi-Tenant

### Camadas de Proteção

| Camada | Mecanismo | Descrição |
|--------|-----------|-----------|
| 1. JWT | Token contém tenantId | Tenant extraído do token autenticado |
| 2. TenantGuard | Validação no guard | Verifica se tenant existe e está ativo |
| 3. Service Layer | Filtro em queries | Todas as queries incluem WHERE tenantId = ? |
| 4. Prisma | Middleware de escrita | Garante tenantId em operações de INSERT |
| 5. Índices | Banco de dados | Índices compostos com tenantId para performance |

### Proteção contra Acesso Cruzado

- Usuário do Tenant A **nunca** consegue acessar dados do Tenant B
- Mesmo que um ID de recurso seja conhecido, o filtro por tenantId impede o acesso
- Super admins têm acesso cross-tenant para gestão da plataforma

## Auditoria

### Logs de Auditoria

Todas as operações de escrita (CREATE, UPDATE, DELETE) são registradas na tabela `audit_log`:

| Campo | Descrição |
|-------|-----------|
| id | Identificador do log |
| tenantId | Tenant onde a ação ocorreu |
| userId | Usuário que executou a ação |
| action | Tipo: CREATE, UPDATE, DELETE |
| entity | Entidade afetada (Patient, Project, etc.) |
| entityId | ID do registro afetado |
| changes | JSON com dados anteriores e novos |
| ipAddress | IP do cliente |
| userAgent | User-Agent do navegador |
| createdAt | Data e hora da ação |

### Imutabilidade

Logs de auditoria são **somente inserção** (append-only). Não existem endpoints de UPDATE ou DELETE para auditoria.

## Conformidade com LGPD

### Medidas Implementadas

| Requisito LGPD | Implementação |
|----------------|--------------|
| Consentimento | Aceite de termos no registro |
| Finalidade | Dados coletados apenas para funcionalidades do sistema |
| Minimização | Apenas campos necessários são obrigatórios |
| Acesso | Usuário pode consultar seus dados via API |
| Portabilidade | Endpoint de exportação de dados em JSON |
| Eliminação | Endpoint de anonimização de dados pessoais |
| Segurança | Criptografia, RBAC, auditoria |
| Notificação | Log de auditoria para rastreamento de acessos |

### Dados Sensíveis

- **Prontuários médicos**: acesso restrito a médicos e admin
- **CPF/RG**: armazenados com máscara, exibição parcial na listagem
- **Senhas**: hash bcrypt, nunca armazenadas em texto plano
- **Tokens**: JWT com expiração, sem persistência no servidor

## Segurança de Infraestrutura

| Componente | Medida |
|------------|--------|
| Nginx | Rate limiting, headers de segurança (X-Frame-Options, CSP) |
| PostgreSQL | Usuário dedicado, senha forte, acesso apenas via rede Docker |
| Redis | Sem exposição externa em produção, senha configurável |
| MinIO | Credenciais via variáveis de ambiente, buckets privados |
| Docker | Imagens Alpine (superfície reduzida), non-root user |

## Recomendações para Produção

1. Usar HTTPS com certificado TLS válido (Let's Encrypt)
2. Rotacionar JWT_SECRET periodicamente
3. Habilitar rate limiting por IP no Nginx
4. Configurar backups automáticos do PostgreSQL
5. Monitorar logs de auditoria para acessos suspeitos
6. Implementar 2FA para perfis administrativos
7. Usar secrets manager (AWS Secrets Manager, Vault) para credenciais
8. Habilitar WAF (Web Application Firewall) em produção
