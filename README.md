# Desafio DevSecOps 

# Acessível em: http://devsecops-teste.myddns.me

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

# REPORT da ANALISE:

# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 4 |
| Low | 4 |
| Informational | 1 |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: Failure to Define Directive with No Fallback | Medium | 2 |
| Content Security Policy (CSP) Header Not Set | Medium | 1 |
| Cross-Domain Misconfiguration | Medium | 3 |
| Missing Anti-clickjacking Header | Medium | 1 |
| Insufficient Site Isolation Against Spectre Vulnerability | Low | 2 |
| Permissions Policy Header Not Set | Low | 3 |
| Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s) | Low | 3 |
| X-Content-Type-Options Header Missing | Low | 1 |
| Storable and Cacheable Content | Informational | 3 |




## Alert Detail



### [ CSP: Failure to Define Directive with No Fallback ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

The Content Security Policy fails to define one of the directives that has no fallback. Missing/excluding them is the same as allowing anything.

* URL: http://127.0.0.1:5005/robots.txt
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'none'`
  * Other Info: `The directive(s): frame-ancestors, form-action is/are among the directives that do not fallback to default-src.`
* URL: http://127.0.0.1:5005/sitemap.xml
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'none'`
  * Other Info: `The directive(s): frame-ancestors, form-action is/are among the directives that do not fallback to default-src.`

Instances: 2

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources ](https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Content Security Policy (CSP) Header Not Set ](https://www.zaproxy.org/docs/alerts/10038/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 1

### Solution

Ensure that your web server, application server, load balancer, etc. is configured to set the Content-Security-Policy header.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Introducing_Content_Security_Policy ](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Introducing_Content_Security_Policy)
* [ https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://w3c.github.io/webappsec-csp/ ](https://w3c.github.io/webappsec-csp/)
* [ https://web.dev/articles/csp ](https://web.dev/articles/csp)
* [ https://caniuse.com/#feat=contentsecuritypolicy ](https://caniuse.com/#feat=contentsecuritypolicy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Cross-Domain Misconfiguration ](https://www.zaproxy.org/docs/alerts/10098/)



##### Medium (Medium)

### Description

Web browser data loading may be possible, due to a Cross Origin Resource Sharing (CORS) misconfiguration on the web server.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: http://127.0.0.1:5005/robots.txt
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: http://127.0.0.1:5005/sitemap.xml
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`

Instances: 3

### Solution

Ensure that sensitive data is not available in an unauthenticated manner (using IP address white-listing, for instance).
Configure the "Access-Control-Allow-Origin" HTTP header to a more restrictive set of domains, or remove all CORS headers entirely, to allow the web browser to enforce the Same Origin Policy (SOP) in a more restrictive manner.

### Reference


* [ https://vulncat.fortify.com/en/detail?id=desc.config.dotnet.html5_overly_permissive_cors_policy ](https://vulncat.fortify.com/en/detail?id=desc.config.dotnet.html5_overly_permissive_cors_policy)


#### CWE Id: [ 264 ](https://cwe.mitre.org/data/definitions/264.html)


#### WASC Id: 14

#### Source ID: 3

### [ Missing Anti-clickjacking Header ](https://www.zaproxy.org/docs/alerts/10020/)



##### Medium (Medium)

### Description

The response does not protect against 'ClickJacking' attacks. It should include either Content-Security-Policy with 'frame-ancestors' directive or X-Frame-Options.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: `x-frame-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 1

### Solution

Modern Web browsers support the Content-Security-Policy and X-Frame-Options HTTP headers. Ensure one of them is set on all web pages returned by your site/app.
If you expect the page to be framed only by pages on your server (e.g. it's part of a FRAMESET) then you'll want to use SAMEORIGIN, otherwise if you never expect the page to be framed, you should use DENY. Alternatively consider implementing Content Security Policy's "frame-ancestors" directive.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)


#### CWE Id: [ 1021 ](https://cwe.mitre.org/data/definitions/1021.html)


#### WASC Id: 15

#### Source ID: 3

### [ Insufficient Site Isolation Against Spectre Vulnerability ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Embedder-Policy header is a response header that prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 2

### Solution

Ensure that the application/web server sets the Cross-Origin-Embedder-Policy header appropriately, and that it sets the Cross-Origin-Embedder-Policy header to 'require-corp' for documents.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Embedder-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-embedder-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Permissions Policy Header Not Set ](https://www.zaproxy.org/docs/alerts/10063/)



##### Low (Medium)

### Description

Permissions Policy Header is an added layer of security that helps to restrict from unauthorized access or usage of browser/client features by web resources. This policy ensures the user privacy by limiting or specifying the features of the browsers can be used by the web resources. Permissions Policy provides a set of standard HTTP headers that allow website owners to limit which features of browsers can be used by the page such as camera, microphone, location, full screen etc.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://127.0.0.1:5005/robots.txt
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://127.0.0.1:5005/sitemap.xml
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 3

### Solution

Ensure that your web server, application server, load balancer, etc. is configured to set the Permissions-Policy header.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)
* [ https://developer.chrome.com/blog/feature-policy/ ](https://developer.chrome.com/blog/feature-policy/)
* [ https://scotthelme.co.uk/a-new-security-header-feature-policy/ ](https://scotthelme.co.uk/a-new-security-header-feature-policy/)
* [ https://w3c.github.io/webappsec-feature-policy/ ](https://w3c.github.io/webappsec-feature-policy/)
* [ https://www.smashingmagazine.com/2018/12/feature-policy/ ](https://www.smashingmagazine.com/2018/12/feature-policy/)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s) ](https://www.zaproxy.org/docs/alerts/10037/)



##### Low (Medium)

### Description

The web/application server is leaking information via one or more "X-Powered-By" HTTP response headers. Access to such information may facilitate attackers identifying other frameworks/components your web application is reliant upon and the vulnerabilities such components may be subject to.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Express`
  * Other Info: ``
* URL: http://127.0.0.1:5005/robots.txt
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Express`
  * Other Info: ``
* URL: http://127.0.0.1:5005/sitemap.xml
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `X-Powered-By: Express`
  * Other Info: ``

Instances: 3

### Solution

Ensure that your web server, application server, load balancer, etc. is configured to suppress "X-Powered-By" headers.

### Reference


* [ https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework ](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework)
* [ https://www.troyhunt.com/2012/02/shhh-dont-let-your-response-headers.html ](https://www.troyhunt.com/2012/02/shhh-dont-let-your-response-headers.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ X-Content-Type-Options Header Missing ](https://www.zaproxy.org/docs/alerts/10021/)



##### Low (Medium)

### Description

The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'. This allows older versions of Internet Explorer and Chrome to perform MIME-sniffing on the response body, potentially causing the response body to be interpreted and displayed as a content type other than the declared content type. Current (early 2014) and legacy versions of Firefox will use the declared content type (if one is set), rather than performing MIME-sniffing.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: `x-content-type-options`
  * Attack: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`

Instances: 1

### Solution

Ensure that the application/web server sets the Content-Type header appropriately, and that it sets the X-Content-Type-Options header to 'nosniff' for all web pages.
If possible, ensure that the end user uses a standards-compliant and modern web browser that does not perform MIME-sniffing at all, or that can be directed by the web application/web server to not perform MIME-sniffing.

### Reference


* [ https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85) ](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85))
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: http://127.0.0.1:5005/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://127.0.0.1:5005/robots.txt
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://127.0.0.1:5005/sitemap.xml
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`

Instances: 3

### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3



## Screenshots

<p align="center">
  <img src="https://i.ibb.co/TM6fngWt/Captura-de-Tela-2025-09-03-a-s-13-00-32.png" alt="Lambda - call-endpoint" width="960"><br>
  <img src="https://i.ibb.co/ZRB8nytf/Captura-de-Tela-2025-09-03-a-s-13-01-11.png" alt="Lambda - código" width="960"><br>
  <img src="https://i.ibb.co/5x5HDpzF/Captura-de-Tela-2025-09-03-a-s-13-01-25.png" alt="API Gateway - rota /webhook" width="960"><br>
  <img src="https://i.ibb.co/JWZY8Ygw/Captura-de-Tela-2025-09-03-a-s-13-05-40.png" alt="Docker Hub - Webhooks" width="960">
</p>



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
