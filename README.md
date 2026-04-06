# SaaS - Multi-tenant Blogging Platform

A complete SaaS (Software as a Service) backend built with Node.js, Express, and MongoDB. This platform provides multi-tenant blogging capabilities with subscription management, role-based access control, usage tracking, and billing integration.

## Features

- **Multi-tenancy**: Isolated data per tenant with slug/API key resolution
- **Subscription Plans**: Free, Starter, Professional, and Enterprise tiers
- **Role-Based Access Control (RBAC)**: super_admin, tenant_owner, admin, editor, viewer
- **Usage Tracking**: API requests, stories created, storage used per day
- **Rate Limiting**: Global and per-tenant API rate limiting
- **Billing Integration**: Stripe webhook support for subscription lifecycle
- **API Key Authentication**: Per-tenant API keys for programmatic access
- **User Management**: Registration, activation via email, login, password reset
- **Story Management**: Full CRUD with pagination, status (draft/published/archived)

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Billing**: Stripe
- **Email**: Nodemailer
- **Security**: bcrypt, CORS, rate limiting

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Stripe account (for billing)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd saas

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Seed Plans

After starting the server, seed the default subscription plans:

```bash
curl -X POST http://localhost:5005/api/subscriptions/plans/seed
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| GET | `/api/auth/activate/:token` | Activate account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgotpassword` | Request password reset |
| GET | `/api/auth/verifyRandomString/:token` | Verify reset token |
| PUT | `/api/auth/resetpassword/:token` | Reset password |
| GET | `/api/auth/private` | Get private data (auth required) |

### Tenants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tenants` | Create a tenant |
| GET | `/api/tenants/:id` | Get tenant details |
| PUT | `/api/tenants/:id` | Update tenant |
| DELETE | `/api/tenants/:id` | Deactivate tenant |
| POST | `/api/tenants/:id/regenerate-api-key` | Regenerate API key |
| POST | `/api/tenants/:id/invite` | Invite user to tenant |
| GET | `/api/tenants/:id/members` | List tenant members |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/plans` | List available plans |
| POST | `/api/subscriptions/plans/seed` | Seed default plans |
| GET | `/api/subscriptions/:tenantId` | Get subscription |
| PUT | `/api/subscriptions/:tenantId/change-plan` | Change plan |
| POST | `/api/subscriptions/:tenantId/cancel` | Cancel subscription |
| GET | `/api/subscriptions/:tenantId/usage` | Get usage stats |

### Stories (requires `X-Tenant-Slug` or `X-API-Key` header)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/story/addstory` | Create a story |
| GET | `/api/story/getAllStories` | List stories (paginated) |
| GET | `/api/story/:id` | Get story by ID |
| PUT | `/api/story/:id` | Update a story |
| DELETE | `/api/story/:id` | Delete a story |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

## Subscription Plans

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| Price (monthly) | R$0 | R$29 | R$79 | R$199 |
| Users | 2 | 5 | 25 | 100 |
| Stories | 10 | 100 | 1,000 | Unlimited |
| Storage | 1 GB | 10 GB | 50 GB | 500 GB |
| API Requests/day | 100 | 1,000 | 10,000 | Unlimited |
| Custom Domain | - | - | Yes | Yes |
| Custom Branding | - | - | Yes | Yes |
| Priority Support | - | - | - | Yes |

## Multi-tenancy

Tenants are resolved via HTTP headers:
- `X-Tenant-Slug`: Tenant slug identifier
- `X-API-Key`: Tenant API key

All story operations are scoped to the resolved tenant.

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── auth.js              # Authentication logic
│   ├── story.js             # Story CRUD with tenant scoping
│   ├── subscription.js      # Plans, subscriptions, usage
│   ├── tenant.js            # Tenant management
│   └── webhook.js           # Stripe webhook handler
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── customErrorHandler.js # Error handling
│   ├── rateLimiter.js       # Rate limiting & usage tracking
│   ├── rbac.js              # Role-based access control
│   └── tenantResolver.js    # Multi-tenant resolution
├── models/
│   ├── plan.js              # Subscription plans
│   ├── story.js             # Blog stories
│   ├── subscription.js      # Tenant subscriptions
│   ├── tenant.js            # Tenant/organization
│   ├── usage.js             # Usage tracking
│   └── user.js              # Users with roles
├── routes/
│   ├── auth.js              # Auth routes
│   ├── index.js             # Route aggregator
│   ├── story.js             # Story routes
│   ├── subscription.js      # Subscription routes
│   ├── tenant.js            # Tenant routes
│   └── webhook.js           # Webhook routes
├── utils/
│   ├── deleteImage.js       # Image deletion
│   ├── email.js             # Email sending
│   ├── error.js             # Custom error class
│   ├── jwt.js               # JWT utilities
│   ├── password.js          # Password hashing
│   ├── uploadImage.js       # Image upload
│   └── user.js              # User query helpers
├── .env.example             # Environment variables template
├── package.json
└── server.js                # Application entry point
```

## License

ISC
