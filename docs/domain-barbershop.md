# Domínio: Barbearia

## Visão Geral

O módulo de Barbearia permite a gestão completa de uma barbearia ou salão, incluindo cadastro de barbeiros, catálogo de serviços, agendamento online, gestão de clientes, controle de produtos, sistema de comandas e financeiro.

## Entidades

### Barber (Barbeiro)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tenant_id | UUID | Tenant proprietário |
| user_id | UUID | Referência ao usuário do sistema |
| name | String | Nome completo |
| nickname | String | Apelido / nome artístico |
| phone | String | Telefone |
| specialties | JSON | Especialidades (corte, barba, coloração, etc.) |
| commission_percent | Decimal | Percentual de comissão (padrão: 40%) |
| available_hours | JSON | Horários de trabalho por dia da semana |
| photo_url | String | URL da foto de perfil (MinIO) |
| is_active | Boolean | Status ativo/inativo |

### Service (Serviço)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tenant_id | UUID | Tenant proprietário |
| name | String | Nome do serviço (ex: Corte Degradê) |
| description | Text | Descrição do serviço |
| price | Decimal | Preço |
| duration_minutes | Integer | Duração estimada em minutos |
| category | Enum | HAIRCUT, BEARD, COMBO, COLOR, TREATMENT, OTHER |
| is_active | Boolean | Disponível para agendamento |

### Client (Cliente)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tenant_id | UUID | Tenant proprietário |
| name | String | Nome completo |
| phone | String | Telefone (WhatsApp) |
| email | String | E-mail (opcional) |
| date_of_birth | Date | Data de nascimento |
| notes | Text | Preferências e observações |
| total_visits | Integer | Total de visitas (calculado) |
| last_visit | DateTime | Data da última visita |
| created_at | DateTime | Data de cadastro |

### Booking (Agendamento)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tenant_id | UUID | Tenant proprietário |
| client_id | UUID | Cliente |
| barber_id | UUID | Barbeiro |
| service_id | UUID | Serviço |
| date_time | DateTime | Data e hora do agendamento |
| duration_minutes | Integer | Duração (herdada do serviço) |
| status | Enum | SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| price | Decimal | Preço no momento do agendamento |
| notes | Text | Observações do cliente |

### Product (Produto)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tenant_id | UUID | Tenant proprietário |
| name | String | Nome do produto |
| description | Text | Descrição |
| price | Decimal | Preço de venda |
| cost_price | Decimal | Preço de custo |
| stock_quantity | Integer | Quantidade em estoque |
| min_stock | Integer | Estoque mínimo para alerta |
| category | Enum | POMADE, GEL, OIL, SHAMPOO, AFTERSHAVE, ACCESSORY, OTHER |
| is_active | Boolean | Disponível para venda |

### Order (Comanda)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tenant_id | UUID | Tenant proprietário |
| client_id | UUID | Cliente |
| barber_id | UUID | Barbeiro que atendeu |
| booking_id | UUID | Agendamento vinculado (opcional) |
| items | JSON | Lista de serviços e produtos |
| subtotal | Decimal | Subtotal |
| discount | Decimal | Desconto aplicado |
| total | Decimal | Valor total |
| payment_method | Enum | CASH, CREDIT_CARD, DEBIT_CARD, PIX |
| status | Enum | OPEN, CLOSED, CANCELLED |
| created_at | DateTime | Data de criação |
| closed_at | DateTime | Data de fechamento |

## Regras de Negócio

1. **Agendamento**: Não permitir conflito de horários para o mesmo barbeiro
2. **Agendamento**: Respeitar os horários disponíveis do barbeiro
3. **Comissão**: Comissão do barbeiro calculada automaticamente sobre serviços realizados
4. **Estoque**: Alertar quando produto atingir estoque mínimo
5. **Estoque**: Decrementar automaticamente ao fechar comanda com produtos
6. **Cancelamento**: Agendamentos podem ser cancelados com até 2h de antecedência
7. **Comanda**: Uma comanda aberta pode acumular múltiplos serviços e produtos
8. **Fidelidade**: Incrementar `total_visits` do cliente ao completar atendimento

## Endpoints da API

### Barbeiros
| Método | Rota | Perfis Permitidos |
|--------|------|-------------------|
| GET | `/api/barbershop/barbers` | all authenticated |
| GET | `/api/barbershop/barbers/:id` | all authenticated |
| POST | `/api/barbershop/barbers` | admin |
| PUT | `/api/barbershop/barbers/:id` | admin |

### Serviços
| Método | Rota | Perfis Permitidos |
|--------|------|-------------------|
| GET | `/api/barbershop/services` | all authenticated |
| POST | `/api/barbershop/services` | admin |
| PUT | `/api/barbershop/services/:id` | admin |
| DELETE | `/api/barbershop/services/:id` | admin |

### Clientes
| Método | Rota | Perfis Permitidos |
|--------|------|-------------------|
| GET | `/api/barbershop/clients` | barber, receptionist, admin |
| GET | `/api/barbershop/clients/:id` | barber, receptionist, admin |
| POST | `/api/barbershop/clients` | barber, receptionist, admin |
| PUT | `/api/barbershop/clients/:id` | receptionist, admin |

### Agendamentos
| Método | Rota | Perfis Permitidos |
|--------|------|-------------------|
| GET | `/api/barbershop/bookings` | barber, receptionist, admin |
| POST | `/api/barbershop/bookings` | barber, receptionist, admin |
| PATCH | `/api/barbershop/bookings/:id/status` | barber, receptionist, admin |
| GET | `/api/barbershop/bookings/available-slots` | all authenticated |

### Produtos
| Método | Rota | Perfis Permitidos |
|--------|------|-------------------|
| GET | `/api/barbershop/products` | barber, receptionist, admin |
| POST | `/api/barbershop/products` | admin |
| PUT | `/api/barbershop/products/:id` | admin |
| PATCH | `/api/barbershop/products/:id/stock` | admin |

### Comandas
| Método | Rota | Perfis Permitidos |
|--------|------|-------------------|
| GET | `/api/barbershop/orders` | barber, receptionist, admin |
| POST | `/api/barbershop/orders` | barber, receptionist, admin |
| POST | `/api/barbershop/orders/:id/items` | barber, receptionist |
| PATCH | `/api/barbershop/orders/:id/close` | barber, receptionist, admin |

## Fluxo Principal: Atendimento

```
1. Cliente agenda online ou por telefone (booking)
2. Cliente chega → Recepcionista confirma presença
3. Barbeiro inicia atendimento (status: IN_PROGRESS)
4. Sistema abre comanda automaticamente vinculada ao booking
5. Barbeiro pode adicionar produtos à comanda durante o atendimento
6. Barbeiro finaliza serviço (status: COMPLETED)
7. Recepcionista fecha comanda com forma de pagamento
8. Sistema calcula comissão do barbeiro e atualiza estoque
```

## Dashboard

Exibe: agendamentos do dia por barbeiro, faturamento diário/semanal/mensal, ranking de barbeiros por atendimentos, produtos com estoque baixo, taxa de no-show e clientes frequentes.
