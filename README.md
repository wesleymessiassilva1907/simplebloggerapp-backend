# Desafio DevSecOps 


## Infra com Terraform —

Infra básica para subir um **EKS com endpoint público**, VPC e subnets **públicas**, e uma **Lambda** (Python 3.12) que faz `GET` em um endpoint configurável. A Lambda é exposta por **API Gateway (HTTP)** para usar como **webhook do Docker Hub**: a cada publish/push da imagem, o Docker Hub chama o API e a Lambda dispara um `GET` no seu endpoint.

---

## O que este Terraform cria

- **VPC** (`10.0.0.0/16`) com **duas subnets públicas** (duas AZs), **IGW** e rotas.
- Subnets públicas com `map_public_ip_on_launch = true` e tags para ALB (`kubernetes.io/role/elb = 1`).
- **EKS** (versão configurável) com endpoint **público** e **node group** em subnets públicas.
- **Lambda** `call-endpoint` (Python 3.12) + **API Gateway HTTP** com rota `ANY /webhook`.
- Permissões IAM mínimas (logs para a Lambda).

---

## Estrutura de pastas

```
terraform/
├── apigw.tf
├── eks.tf
├── iam.tf
├── lambda.tf
├── main.tf
├── outputs.tf
├── variables.tf
├── versions.tf
└── lambda/
    └── call_endpoint.py
```

---

## Pré-requisitos

- Terraform ≥ **1.5**
- AWS CLI autenticado
- `kubectl` e (opcional) `eksctl`, `helm`

---

## Como usar

1) **Configurar variáveis** (arquivo `terraform.tfvars`):

```hcl
project_name        = "myapp"
aws_region          = "us-east-1"
cluster_version     = "1.30"
node_instance_types = ["t3.medium"]
target_get_endpoint = "https://minha-api.exemplo.com/deploy-hook"
```

2) **Aplicar**:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

3) **Kubeconfig**:

```bash
aws eks update-kubeconfig --name $(terraform output -raw eks_cluster_name) --region us-east-1
```

4) **Configurar o webhook no Docker Hub**:
- Em *Docker Hub → Repositório → Webhooks → Add Webhook*
- URL: pegue `dockerhub_webhook_url` no `terraform output` (ex.: `https://xxxxx.execute-api.us-east-1.amazonaws.com/webhook`)

---

## Variáveis principais

- `project_name`: prefixo para nomear recursos.
- `aws_region`: região AWS.
- `vpc_cidr`: bloco CIDR da VPC (padrão `10.0.0.0/16`).
- `cluster_version`: versão do EKS (ex.: `1.30`).
- `node_instance_types`: tipos de instância do node group (ex.: `["t3.medium"]`).
- `target_get_endpoint`: **endpoint** que a Lambda chamará com `GET`.

---


# Pipeline:
- faz **SAST/DAST** (ESLint, CodeQL, Trivy, OSV-Scanner e **ZAP Baseline**);
- **builda** a imagem e dá **push** no Docker Hub (`:<sha>` e `:latest`, com **retry**);
- faz **deploy blue-green** no **EKS**, com **smoke test** antes/depois e **rollback**;
- usa **Ingress AWS ALB (HTTP-only)**;
- consome **MongoDB** (Bitnami/Helm) via **Secret** em **runtime** (nada de segredo no build).


---

## Visão geral da repo

```
.
├─ Dockerfile
├─ .dockerignore
├─ k8s/
│  └─ templates/
│     ├─ deployment.yaml
│     ├─ service.yaml
│     └─ ingress-alb-http.yaml
└─ .github/
   └─ workflows/
      ├─ ci-security.yml
      ├─ build-dockerhub.yml
      ├─ deploy-eks-bluegreen.yml
      └─ pipeline.yml
```

---

## Pré-requisitos

- **EKS** funcionando e com **AWS Load Balancer Controller** instalado.
- Permissão de `kubectl`
- **Docker Hub**
- **MongoDB** no cluster:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm upgrade --install mongo bitnami/mongodb \
  --namespace app --create-namespace \
  --set architecture=standalone \
  --set auth.rootUser=root --set auth.rootPassword='RootPass123' \
  --set auth.username='appuser' --set auth.password='AppPass123' \
  --set auth.database='blogger'
# DNS esperado: mongo-mongodb.app.svc.cluster.local
```

---

## Secrets no GitHub (Settings → Secrets and variables → Actions)

Obrigatórios:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DB_URI`
- `JWT_SECRET`

---

## Dockerfile (prod, seguro e pequeno)

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN set -eux; \
    if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --omit=dev --no-audit --no-fund; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi

COPY . .
ENV NODE_ENV=production PORT=5005

USER node
EXPOSE 5005
CMD ["node","server.js"]
```

`.dockerignore`:
```gitignore
node_modules
npm-debug.log
.git
.github
.env
coverage
dist
```

---

## Templates Kubernetes

`k8s/templates/deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${APP_NAME}-${COLOR}
  labels: { app: ${APP_NAME}, color: ${COLOR} }
spec:
  replicas: ${REPLICAS}
  selector:
    matchLabels: { app: ${APP_NAME}, color: ${COLOR} }
  template:
    metadata:
      labels: { app: ${APP_NAME}, color: ${COLOR} }
    spec:
      containers:
        - name: api
          image: ${IMAGE}
          ports:
            - containerPort: ${PORT}
          envFrom:
            - secretRef:
                name: app-env 
          readinessProbe:
            httpGet: { path: ${HEALTH_PATH}, port: ${PORT} }
            initialDelaySeconds: 5
          livenessProbe:
            httpGet: { path: ${HEALTH_PATH}, port: ${PORT} }
            initialDelaySeconds: 15
```

`k8s/templates/service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ${SERVICE_NAME}
spec:
  selector:
    app: ${APP_NAME}
    color: ${ACTIVE_COLOR} 
  ports:
    - port: 80
      targetPort: ${PORT}
```

`k8s/templates/ingress-alb-http.yaml` (HTTP-only, internet-facing)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${APP_NAME}-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: ${ALB_SCHEME}    
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80}]' 
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${SERVICE_NAME}
                port: { number: 80 }
```

---

## Workflows

### 1) `.github/workflows/ci-security.yml` (estática + dinâmica)

- Node + deps (condicional `npm ci`/`npm install`).
- **Mongo** como service da job.
- **Fail-fast** do Mongo (porta + `mongosh ping`).
- Start da API com `DB_URI` (timeouts curtos) e `wait-on` da app.
- **ESLint** (config permissiva para não travar build).
- **CodeQL**, **Trivy**, **OSV-Scanner** (workflow oficial), **ZAP Baseline** (suavizado com `rules.tsv`).


### 2) `.github/workflows/build-dockerhub.yml` (build & push com retry)

```yaml
name: build-dockerhub

on:
  workflow_call:
    inputs:
      context:    { type: string,  default: '.' }
      dockerfile: { type: string,  default: 'Dockerfile' }
    secrets:
      dockerhub_username: { required: true }
      dockerhub_token:    { required: true }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.dockerhub_username }}
          password: ${{ secrets.dockerhub_token }}
      - uses: docker/setup-buildx-action@v3
      - name: Build & Push (sha + latest) com retry
        env:
          IMAGE_SHA:    ${{ secrets.dockerhub_username }}/desafio-devsecops:${{ github.sha }}
          IMAGE_LATEST: ${{ secrets.dockerhub_username }}/desafio-devsecops:latest
          CTX:          ${{ inputs.context }}
          DF:           ${{ inputs.dockerfile }}
        shell: bash
        run: |
          set -euo pipefail
          for attempt in 1 2 3; do
            echo "== Tentativa $attempt =="
            if docker buildx build \
                --file "$DF" --push --provenance=false \
                --cache-from=type=gha --cache-to=type=gha,mode=max \
                --tag "$IMAGE_SHA" --tag "$IMAGE_LATEST" \
                "$CTX"; then
              exit 0
            fi
            sleep $((attempt * 15))
          done
          exit 1
```

### 3) `.github/workflows/deploy-eks-bluegreen.yml` (deploy + blue/green + ALB)

Pontos-chave do job:
- Recebe a **imagem já definida** pelo orquestrador (ex.: `user/desafio-devsecops:${{ github.sha }}`).
- Cria/atualiza **Secret `app-env`** **sem template**:
  ```bash
  kubectl -n "$NS" create secret generic app-env \
    --from-literal=DB_URI="${{ secrets.DB_URI }}" \
    --from-literal=JWT_SECRET="${{ secrets.JWT_SECRET }}" \
    --dry-run=client -o yaml | kubectl apply -f -
  ```
- Detecta cor ativa (selector do Service) e faz rollout na cor **inativa**.
- Cria **Service de preview** para a cor inativa:
  ```bash
  kubectl -n "$NS" expose deploy/${APP_NAME}-${COLOR} \
    --name ${APP_NAME}-${COLOR} \
    --port ${PORT} --target-port ${PORT} --type ClusterIP
  ```
- **Smoke test pré-switch** (porta correta):
  ```bash
  kubectl -n "$NS" run curl-pre --restart=Never --image=curlimages/curl:8.9.1 \
    --attach --rm -- curl -fsS "http://${APP_NAME}-${COLOR}:${PORT}${HEALTH_PATH}"
  ```
- **Switch** do Service estável (aplica `ACTIVE_COLOR`), **Ingress ALB HTTP-only**, **smoke pós-switch** em `http://${SERVICE_NAME}:${PORT}${HEALTH_PATH}`.
- **Scale down** do lado antigo; **rollback** automático se pós-switch falhar.
- **Remove** o Service de preview no final.

### 4) `.github/workflows/pipeline.yml` (orquestrador)


```yaml
name: pipeline
on:
  push:
    branches: [ "main" ]

jobs:
  ci-security:
    uses: ./.github/workflows/ci-security.yml

  build:
    needs: ci-security
    uses: ./.github/workflows/build-dockerhub.yml
    secrets:
      dockerhub_username: ${{ secrets.DOCKERHUB_USERNAME }}
      dockerhub_token:    ${{ secrets.DOCKERHUB_TOKEN }}

  deploy:
    needs: build
    uses: ./.github/workflows/deploy-eks-bluegreen.yml
    with:
      aws_region: us-east-1
      eks_cluster: <SEU_EKS_CLUSTER_NAME>
      namespace: app
      app_name: desafio-devsecops
      service_name: desafio-devsecops-svc
      image: ${{ secrets.DOCKERHUB_USERNAME }}/desafio-devsecops:${{ github.sha }}
      port: '5005'
      health_path: '/'
      replicas: 2
      alb_scheme: internet-facing
    secrets:
      aws_access_key_id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      DB_URI:                ${{ secrets.DB_URI }}
      JWT_SECRET:            ${{ secrets.JWT_SECRET }}
```

---

## Como rodar

1. Configure os **Secrets** (acima).
2. Instale o **Mongo** (comando Helm).
3. Dê um **push** na branch monitorada:
   - `ci-security.yml` roda os checks de segurança;
   - `build-dockerhub.yml` publica a imagem (`:<sha>` e `:latest`);
   - `deploy-eks-bluegreen.yml` faz o rollout blue-green com a imagem `:<sha>`.

---




# REPO DOCUMENTATION

# Simple Blogger App Capstone Backend

Welcome to the README for the Simple Blogger App Capstone Backend. This document provides an overview of the backend application, including how to set it up, run it, and other essential information.

This backend is live and deployed at [https://simplebloggerapp.onrender.com](https://simplebloggerapp.onrender.com). The source code is hosted on GitHub at [https://github.com/anandhakumarmca/simplebloggerapp-backend.git](https://github.com/anandhakumarmca/simplebloggerapp-backend.git).

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Simple Blogger App Capstone Backend is the server-side component of a blogging application. It provides RESTful APIs to manage blog posts, user authentication, and other essential functions. It is built using Node.js, Express.js, and MongoDB.

## Prerequisites

Before you can run the Simple Blogger App Capstone Backend, you need to have the following prerequisites:

- Node.js (v14 or higher): [Installation Guide](https://nodejs.org/)
- NPM (Node Package Manager): Included with Node.js
- MongoDB: [Installation Guide](https://docs.mongodb.com/manual/installation/)

## Getting Started

To get started with the backend, follow these steps:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/anandhakumarmca/simplebloggerapp-backend.git
   
## Setting Up the Project

1. **Navigate to the project directory:**

    ```bash
    cd simplebloggerapp-backend
    ```

2. **Install the project dependencies:**

    ```bash
    npm install
    ```

## Project Structure

The project directory follows this structure:

- **app.js**: The main application entry point.
- **routes/**: Directory containing route definitions.
- **controllers/**: Directory for handling business logic.
- **models/**: Directory for defining database models using Mongoose.
- ...

## Environment Variables

The backend relies on environment variables to work correctly. Please make sure to set the following environment variables before running the application:

- **PORT**: The port on which the server will listen.
- **MONGODB_URI**: The URI to your MongoDB database.
- **JWT_SECRET**: Secret key for JSON Web Token (JWT) authentication.

Make sure to define these variables appropriately for your environment to ensure the proper functioning of the application.

## Deployment

The backend for the Simple Blogger App Capstone project is live and deployed at [https://simplebloggerapp.onrender.com](https://simplebloggerapp.onrender.com).

## API Documentation

You can find detailed API documentation for the backend on Postman. Please refer to the [API Documentation](https://documenter.getpostman.com/view/593035/2s9YXe8jZd) for comprehensive information on the available API endpoints and usage.

**Note**: Ensure that the backend is running and accessible before using the provided API documentation.
