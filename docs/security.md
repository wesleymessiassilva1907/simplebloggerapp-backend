# Seguranca - NexusHub

## Visao Geral

O NexusHub implementa multiplas camadas de seguranca para proteger dados sensiveis de pacientes, informacoes financeiras de obras e garantir o isolamento completo entre tenants. Este documento detalha as medidas de seguranca implementadas e as recomendacoes para producao.

## Autenticacao (JWT)

### Fluxo de Autenticacao

```
1. Cliente envia POST /api/auth/login com { email, password }
2. AuthService busca usuario por email no banco
3. Valida senha contra hash bcrypt armazenado
4. Carrega roles do usuario via tabela UserRole
5. Gera JWT com payload: { sub: userId, tenantId, roles }
6. Retorna access_token ao cliente
7. Cliente armazena token e envia em todas as requisicoes:
   Authorization: Bearer <token>
8. JwtStrategy (Passport.js) valida assinatura e expiracao
9. Guards extraem tenantId e roles para autorizacao
```

### Configuracao do JWT

| Parametro | Valor | Descricao |
|-----------|-------|-----------|
| Algoritmo | HS256 | HMAC com SHA-256 |
| Expiracao Access Token | 24h | Tempo de vida do token principal |
| Expiracao Refresh Token | 7d | Tempo de vida do refresh token |
| Secret | Variavel de ambiente | Chave secreta via `JWT_SECRET` |
| Payload | sub, tenantId, roles | Dados minimos no token |

### Boas Praticas Implementadas

- Senhas hasheadas com **bcrypt** (salt rounds: 10, configuravel via `BCRYPT_ROUNDS`)
- JWT secret obrigatoriamente configuravel via variavel de ambiente
- Tokens nao armazenados no servidor (stateless)
- Validacao de expiracao em cada requisicao
- Payload minimo no token (sem dados sensiveis)
- Estrategia Passport.js para validacao padronizada

### Registro de Tenant

O fluxo de registro (`POST /api/auth/register-initial-tenant-admin`) cria simultaneamente:
1. Um novo tenant com slug unico
2. Um usuario administrador (`tenant_admin`) vinculado ao tenant
3. A associacao de role via tabela `UserRole`

Isso garante que todo tenant tenha pelo menos um administrador desde a criacao.

## Autorizacao (RBAC)

### Sistema de Papeis

O NexusHub utiliza RBAC (Role-Based Access Control) com papeis pre-definidos armazenados no banco de dados. Um usuario pode ter multiplos papeis.

| Papel | Escopo | Descricao |
|-------|--------|-----------|
| `super_admin` | Global | Acesso total a plataforma, gerenciar todos os tenants |
| `tenant_admin` | Tenant | Gerenciar usuarios, configuracoes e billing do tenant |
| `clinic_doctor` | Clinica | Pacientes (leitura), agendamentos, prontuarios (CRUD) |
| `clinic_receptionist` | Clinica | Pacientes (CRUD), agendamentos (CRUD), faturamento |
| `construction_manager` | Construcao | Projetos, tarefas, despesas, trabalhadores (CRUD) |
| `construction_worker` | Construcao | Visualizacao de projetos e tarefas (leitura) |

### Pipeline de Guards

Cada requisicao autenticada passa por tres guards em sequencia:

```
Requisicao HTTP
    |
    v
[AuthGuard('jwt')]    --> Valida token JWT (401 se invalido/ausente)
    |
    v
[TenantGuard]         --> Extrai e valida tenantId do token
    |                      Verifica se tenant existe e esta ativo
    |                      (403 se tenant inativo/suspenso)
    |
    v
[RolesGuard]          --> Verifica se usuario possui role exigida
    |                      pelo decorator @Roles() no endpoint
    |                      (403 se role insuficiente)
    |
    v
[Controller]          --> Processa a requisicao normalmente
```

### Decorators Customizados

```typescript
// Definir roles permitidas em um endpoint
@Roles('tenant_admin', 'clinic_doctor')
@Get('medical-records')
findAll() { ... }

// Injetar tenantId automaticamente
@Get()
findAll(@TenantId() tenantId: string) { ... }

// Injetar usuario atual
@Get('me')
getMe(@CurrentUser() user: JwtPayload) { ... }
```

### Matriz de Permissoes por Modulo

#### Core
| Endpoint | super_admin | tenant_admin |
|----------|:-----------:|:------------:|
| GET /api/tenants | Sim | Nao (so o proprio) |
| DELETE /api/tenants/:id | Sim | Nao |
| GET /api/users | Sim | Sim |
| CRUD /api/users | Sim | Sim |
| GET /api/audit | Sim | Sim |
| CRUD /api/roles | Sim | Sim |

#### Clinica
| Endpoint | tenant_admin | clinic_doctor | clinic_receptionist |
|----------|:------------:|:-------------:|:-------------------:|
| Pacientes (leitura) | Sim | Sim | Sim |
| Pacientes (escrita) | Sim | Nao | Sim |
| Medicos (CRUD) | Sim | Nao | Nao |
| Agendamentos (leitura) | Sim | Sim | Sim |
| Agendamentos (escrita) | Sim | Nao | Sim |
| Prontuarios | Sim | Sim | **Nao** |
| Faturamento | Sim | Nao | Sim |

#### Construcao
| Endpoint | tenant_admin | construction_manager | construction_worker |
|----------|:------------:|:-------------------:|:-------------------:|
| Projetos (leitura) | Sim | Sim | Sim |
| Projetos (escrita) | Sim | Sim | Nao |
| Tarefas (leitura) | Sim | Sim | Sim |
| Tarefas (escrita) | Sim | Sim | Nao |
| Despesas | Sim | Sim | Nao |
| Trabalhadores | Sim | Sim | Nao |

## Isolamento Multi-Tenant

### Camadas de Protecao

| Camada | Mecanismo | Descricao |
|--------|-----------|-----------|
| 1. JWT | Token contem tenantId | Tenant extraido do token autenticado |
| 2. TenantGuard | Validacao no guard | Verifica se tenant existe e esta ativo |
| 3. @TenantId() | Decorator de injecao | Injeta tenantId no controller automaticamente |
| 4. Service Layer | Filtro em queries | Todas as queries incluem `WHERE tenantId = ?` |
| 5. Indices | Banco de dados | Indices compostos com tenantId para performance |

### Protecao contra Acesso Cruzado

- Usuario do Tenant A **nunca** consegue acessar dados do Tenant B
- Mesmo que um ID de recurso (UUID) seja conhecido, o filtro por `tenantId` impede o acesso
- Todas as operacoes de leitura e escrita sao filtradas pelo tenant do usuario autenticado
- Super admins tem acesso cross-tenant para gestao da plataforma
- Status do tenant e verificado em cada requisicao (tenants suspensos sao bloqueados)

### Exemplo de Query Protegida

```typescript
// Service - Toda query SEMPRE inclui tenantId
async findAll(tenantId: string, page: number, limit: number) {
  return this.prisma.clinicPatient.findMany({
    where: { tenantId },  // Filtro obrigatorio
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

## Auditoria (Audit Logging)

### Logs de Auditoria

O modulo de auditoria registra acoes sensiveis na tabela `audit_logs`:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador do log |
| tenantId | UUID | Tenant onde a acao ocorreu |
| userId | UUID | Usuario que executou a acao |
| action | String | Tipo da acao (CREATE, UPDATE, DELETE, LOGIN, etc) |
| entity | String | Entidade afetada (Patient, Project, User, etc) |
| entityId | UUID | ID do registro afetado |
| metadata | JSON | Dados adicionais (payload, IP, user-agent) |
| createdAt | DateTime | Data e hora da acao |

### AuditInterceptor

O interceptor de auditoria registra automaticamente operacoes de escrita:

```typescript
// Aplicado globalmente ou por controller
@UseInterceptors(AuditInterceptor)
```

### Imutabilidade

Logs de auditoria sao **somente insercao** (append-only). O endpoint de auditoria (`GET /api/audit`) e somente leitura, acessivel apenas por `super_admin` e `tenant_admin`.

## Conformidade com LGPD

### Medidas Implementadas

| Requisito LGPD | Implementacao |
|----------------|--------------|
| **Consentimento** | Aceite de termos no registro de tenant |
| **Finalidade** | Dados coletados apenas para funcionalidades do sistema |
| **Minimizacao** | Apenas campos necessarios sao obrigatorios (nome no paciente, etc) |
| **Acesso** | Usuario pode consultar seus dados via `GET /api/auth/me` |
| **Seguranca** | Criptografia bcrypt, RBAC, auditoria, isolamento multi-tenant |
| **Notificacao** | Log de auditoria para rastreamento de acessos a dados sensiveis |

### Dados Sensiveis

| Dado | Protecao |
|------|----------|
| **Prontuarios medicos** | Acesso restrito a `clinic_doctor` e `tenant_admin` |
| **CPF** | Campo opcional, armazenado de forma segura |
| **Senhas** | Hash bcrypt com salt, nunca armazenadas em texto plano |
| **Tokens JWT** | Expiracao configuravel, sem persistencia no servidor |
| **Dados financeiros** | Acesso restrito por role (faturamento clinico e despesas de obra) |

### Recomendacoes Futuras para LGPD

1. Implementar endpoint de exportacao de dados pessoais (portabilidade)
2. Implementar endpoint de anonimizacao/exclusao de dados (direito ao esquecimento)
3. Adicionar consentimento explicito por tipo de dados coletados
4. Criar relatorio de DPO (Data Protection Officer) automatizado
5. Implementar retencao de dados com exclusao automatica apos periodo definido

## Criptografia

### Em Transito

| Componente | Protocolo | Observacao |
|------------|-----------|-----------|
| Frontend <-> Nginx | HTTPS (producao) | TLS 1.2+ com certificado valido |
| Nginx <-> Backend | HTTP (rede interna Docker) | Comunicacao interna segura |
| Backend <-> PostgreSQL | TCP (rede interna Docker) | Configuravel com SSL |
| Backend <-> Redis | TCP (rede interna Docker) | Configuravel com TLS |

### Em Repouso

| Dado | Metodo |
|------|--------|
| Senhas | bcrypt com 10 salt rounds |
| JWT Secret | Variavel de ambiente (nao hardcoded) |
| Dados no banco | Criptografia nativa do PostgreSQL (pgcrypto - futuro) |
| Arquivos no MinIO | Criptografia server-side (SSE - configuravel) |

## CORS (Cross-Origin Resource Sharing)

Configuracao de CORS definida via variavel de ambiente:

```
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

- Apenas origens autorizadas podem fazer requisicoes ao backend
- Headers permitidos: Content-Type, Authorization
- Metodos permitidos: GET, POST, PUT, DELETE, PATCH
- Credenciais habilitadas para cookies/tokens

## Headers de Seguranca

### Nginx (Recomendado para Producao)

```nginx
# Prevenir clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevenir MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Habilitar XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;

# Strict Transport Security (HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Seguranca de Infraestrutura

| Componente | Medida de Seguranca |
|------------|-------------------|
| **Docker** | Imagens Alpine (superficie reduzida), non-root user recomendado |
| **PostgreSQL** | Usuario dedicado, senha forte, acesso apenas via rede Docker interna |
| **Redis** | Sem exposicao externa em producao, senha configuravel |
| **MinIO** | Credenciais via variaveis de ambiente, buckets privados |
| **Nginx** | Rate limiting, proxy reverso, sem exposicao direta do backend |
| **Rede Docker** | Bridge network isolada (`nexushub-network`) |
| **Volumes** | Dados persistentes isolados por servico |

## Health Checks de Seguranca

```yaml
# PostgreSQL - verifica conectividade
pg_isready -U nexushub

# Redis - verifica disponibilidade
redis-cli ping

# Backend - verifica servicos
wget --spider http://localhost:3001/api/health

# MinIO - verifica status
mc ready local
```

## CI/CD e Seguranca

O projeto possui pipeline de seguranca em `.github/workflows/ci-security.yml`:

- Verificacao de vulnerabilidades em dependencias (npm audit)
- Analise estatica de codigo
- Scan de secrets em commits
- Build de containers com verificacao de seguranca

## Recomendacoes para Producao

### Obrigatorias

1. **HTTPS**: Usar certificado TLS valido (Let's Encrypt) no Nginx
2. **JWT_SECRET**: Gerar chave forte (minimo 256 bits) e rotacionar periodicamente
3. **Senhas do Banco**: Trocar senhas padrao por senhas fortes e unicas
4. **CORS**: Configurar apenas dominios de producao
5. **Variaveis Sensiveis**: Usar secrets manager (AWS Secrets Manager, Vault, etc)
6. **Backups**: Configurar backups automaticos do PostgreSQL (pg_dump diario)
7. **Rate Limiting**: Habilitar rate limiting por IP no Nginx

### Recomendadas

8. **2FA**: Implementar autenticacao de dois fatores para perfis administrativos
9. **WAF**: Habilitar Web Application Firewall (CloudFlare, AWS WAF)
10. **Logs Centralizados**: Configurar agregacao de logs (ELK Stack, Loki)
11. **Alertas**: Configurar alertas no Grafana para acessos suspeitos
12. **Penetration Testing**: Realizar testes de penetracao antes do lancamento
13. **Politica de Senhas**: Exigir senhas fortes (minimo 8 caracteres, maiusculas, numeros)
14. **Sessao**: Implementar logout forcar e revogacao de tokens
15. **Network Policies**: Em Kubernetes, configurar network policies para isolar pods
