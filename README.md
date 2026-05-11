# 🛒 NexCart — Microservices E-Commerce Platform

NexCart is a production-grade, scalable e-commerce platform built on a microservices architecture. It features a premium React frontend, an event-driven Node.js backend, and a fully automated CI/CD pipeline deploying to Kubernetes on AWS.

---

## 🏗️ Architecture Overview

NexCart is designed for high availability and horizontal scalability. Each service is independently deployable, owns its own database, and communicates via synchronous REST APIs or asynchronous messaging through RabbitMQ.

```mermaid
graph TD
    Client[Web Browser] --> Ingress[K8s Ingress]

    subgraph "Kubernetes Cluster — nexcart namespace"
        Ingress --> AGW[API Gateway — Nginx]
        AGW --> FE[Frontend — React SPA]

        AGW --> Auth[Auth Service :3001]
        AGW --> Prod[Products Service :3003]
        AGW --> Cart[Cart Service :3004]
        AGW --> Order[Order Service :3005]
        AGW --> Pay[Payment Service :3006]

        Auth --> Redis[(Redis)]
        Prod --> Redis
        Cart --> Redis

        Auth -- Events --> RMQ[RabbitMQ]
        Prod -- Events --> RMQ
        Order -- Events --> RMQ
        RMQ --> Notif[Notification Service :3002]
    end

    subgraph "monitoring namespace"
        Prom[Prometheus] -- scrapes --> AGW
        Prom -- scrapes --> Auth
        Prom -- scrapes --> Prod
        Prom -- scrapes --> Cart
        Prom -- scrapes --> Order
        Prom -- scrapes --> Pay
        Grafana[Grafana] -- queries --> Prom
    end

    subgraph "External Storage"
        Auth --> ADB[(MongoDB Atlas)]
        Prod --> PDB[(MongoDB Atlas)]
        Cart --> CDB[(MongoDB Atlas)]
        Order --> ODB[(MongoDB Atlas)]
        Pay --> PYDB[(MongoDB Atlas)]
    end
```

---

## 🖼️ UI Screenshots

<p align="center">
  <img src="docs/login-page.png" alt="Login Page" width="80%" />
</p>
<p align="center"><em>Sign In — Clean, minimal authentication page</em></p>

<br/>

<p align="center">
  <img src="docs/product-catalog.png" alt="Product Catalog" width="100%" />
</p>
<p align="center"><em>Product Catalog — Browse, filter, and search across categories</em></p>

<br/>

<p align="center">
  <img src="docs/product-detail.png" alt="Product Detail Page" width="100%" />
</p>
<p align="center"><em>Product Detail — View product info, seller details, and add to cart</em></p>

---

## 📁 Project Structure

```
NexCart/
├── api-gateway/            # Nginx-based API gateway
├── auth-service/           # Authentication & user management
├── products-service/       # Product catalog & management
├── cart-service/           # Shopping cart
├── order-service/          # Order processing & history
├── payment-service/        # Payment processing
├── notification-service/   # Email/SMS notifications (RabbitMQ consumer)
├── frontend/               # React + Vite SPA
├── kubernetes/             # K8s manifests (Deployments, Services, Secrets, Ingress)
├── terraform/              # AWS infrastructure provisioning (IaC)
├── ansible/                # K8s cluster setup & configuration
├── docs/                   # Documentation assets (screenshots, diagrams)
├── docker-compose.yml      # Local development orchestration
└── Jenkinsfile             # CI/CD pipeline definition
```

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | Fast builds & HMR |
| Redux Toolkit | Global state management (Auth, Cart, Orders) |
| React Router | Client-side routing |
| Vanilla CSS | Modern UI — Glassmorphism, micro-animations |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Microservice runtime |
| MongoDB (Atlas) | Per-service database |
| Redis | Caching (products, sessions) |
| RabbitMQ | Async event-driven messaging |
| JWT | Stateless authentication |
| Cloudinary | Image hosting (Product Service) |

### Infrastructure & DevOps
| Technology | Purpose |
|---|---|
| Terraform | AWS EC2 provisioning (IaC) |
| Ansible | Automated K8s cluster bootstrap |
| Kubernetes | Production orchestration (2 replicas per service) |
| Docker | Containerization |
| Jenkins | CI/CD — Build → Push → Deploy to K8s |
| Nginx | API Gateway & frontend serving |

### Monitoring & Observability
| Technology | Purpose |
|---|---|
| Prometheus | Cluster & application metrics collection |
| Grafana | Real-time dashboards & visualization |

---

## 🧩 Microservices

| # | Service | Port | Description |
|---|---|---|---|
| 1 | **Auth Service** | 3001 | Registration, login, JWT auth, OTP via RabbitMQ |
| 2 | **Notification Service** | 3002 | Async email/SMS processing (RabbitMQ consumer) |
| 3 | **Products Service** | 3003 | Product CRUD, search, filtering, Cloudinary images |
| 4 | **Cart Service** | 3004 | Shopping cart with Redis-backed sync |
| 5 | **Order Service** | 3005 | Checkout flow, order history & status tracking |
| 6 | **Payment Service** | 3006 | Secure transaction processing |
| 7 | **API Gateway** | 80 | Nginx reverse proxy, routing, rate limiting |
| 8 | **Frontend** | 80 | React SPA served via Nginx |

---

## 🛠️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- kubectl (for K8s deployment)

### Local Development
```bash
# Start the full stack locally
docker compose up --build
```

### Infrastructure Provisioning (AWS)
```bash
cd terraform
terraform init
terraform apply
```

### Kubernetes Cluster Setup
```bash
cd ansible
ansible-playbook site.yml -i inventory.ini
```

### Kubernetes Deployment
```bash
# Create the namespace
kubectl apply -f kubernetes/namespaces/namespace.yml

# Deploy all services
kubectl apply -f kubernetes/ -R
```

---

## ⚙️ CI/CD Pipeline

The Jenkins pipeline (`Jenkinsfile`) automates the full delivery lifecycle:

```mermaid
graph LR
    A[Checkout Code] --> B[Build & Tag Docker Images]
    B --> C[Login to DockerHub]
    C --> D[Push Images — latest + build number]
    D --> E[Deploy to Kubernetes]
    E --> F[Rolling Update — Zero Downtime]
```

### Pipeline Stages

| Stage | Description |
|---|---|
| **Checkout** | Pulls latest code from GitHub |
| **Build & Tag** | Builds Docker images for all 8 services, tagged with `latest` and build number |
| **Push** | Pushes all images to DockerHub (`shresth2725/*`) |
| **Deploy** | Rolling update via `kubectl set image` + `kubectl rollout status` in `nexcart` namespace |

### Services Deployed
- `auth-service`, `notification-service`, `products-service`, `cart-service`, `order-service`, `payment-service`, `frontend`, `api-gateway`

Each K8s deployment runs **2 replicas** with rolling update strategy for zero-downtime deployments.

---

## 🔐 Security

- **JWT Authentication** — Stateless, gateway-level token verification.
- **Secrets Management** — K8s Secrets for environment variables; `.env` files excluded via `.gitignore`.
- **Credential Isolation** — Jenkins manages DockerHub and Kubeconfig credentials securely.
- **Network Isolation** — Services communicate internally within the K8s cluster; only the Ingress/Gateway is externally exposed.

---

## 📈 Performance

- **Redis Caching** — Reduces MongoDB load for frequent reads (products, sessions, cart).
- **Async Messaging** — RabbitMQ decouples heavy operations (notifications, events).
- **Optimized Frontend** — Vite code-splitting, lazy loading, and Nginx static serving.
- **Horizontal Scaling** — Stateless services scale independently via K8s replica sets.

---

## 📊 Monitoring & Observability

NexCart uses **Prometheus** and **Grafana** for full-stack monitoring of the Kubernetes cluster and application services.

### Stack

| Component | Role |
|---|---|
| **Prometheus** | Scrapes and stores time-series metrics from K8s nodes, pods, and services |
| **Grafana** | Visualizes metrics via pre-configured dashboards with real-time alerts |
| **kube-state-metrics** | Exposes cluster-level resource metrics (pods, deployments, replicas) |
| **node-exporter** | Exposes host-level metrics (CPU, memory, disk, network) |

### Kubernetes Dashboard

<p align="center">
  <img src="docs/grafana-dashboard.png" alt="Grafana Kubernetes Dashboard" width="100%" />
</p>

The Grafana dashboard provides real-time visibility into:

- **Cluster Resources** — Global CPU & RAM usage (real, requests, limits)
- **Node Health** — Node count, namespace distribution, running pod counts
- **Pod Distribution** — Visual breakdown of pods across namespaces (`nexcart`, `kube-system`, `monitoring`, `ingress-nginx`)
- **Utilization Metrics** — Per-namespace CPU and memory utilization percentages
- **Network & Disk I/O** — Traffic and disk metrics across the cluster

### Deployment

Prometheus and Grafana are deployed in the `monitoring` namespace via Helm:

```bash
# Add the Prometheus community Helm chart
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install the kube-prometheus-stack (Prometheus + Grafana + Alertmanager)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

### Accessing the Dashboards

Both Grafana and Prometheus are exposed via **NodePort** services in the `monitoring` namespace:

```bash
# Check the assigned NodePorts
kubectl get svc -n monitoring
```

| Service | NodePort | URL |
|---|---|---|
| **Grafana** | `<NodePort>` | `http://<Node-IP>:<NodePort>` |
| **Prometheus** | `<NodePort>` | `http://<Node-IP>:<NodePort>` |

**Grafana Credentials:**
- **Username:** `admin`
- **Password:** Retrieve from the K8s secret:
  ```bash
  kubectl get secret monitoring-grafana -n monitoring \
    -o jsonpath="{.data.admin-password}" | base64 --decode
  ```

Navigate to **Dashboards → Kubernetes** in Grafana to view cluster metrics.

---

## 🔮 Roadmap

- [x] Microservices architecture with event-driven messaging
- [x] Containerized with Docker & Docker Compose
- [x] Kubernetes manifests (Deployments, Services, Secrets, Ingress)
- [x] Terraform IaC for AWS infrastructure
- [x] Ansible automation for K8s cluster setup
- [x] Jenkins CI/CD pipeline with K8s deployment
- [ ] ArgoCD — GitOps-based continuous delivery
- [x] Monitoring — Prometheus + Grafana dashboards
- [ ] Logging — ELK stack (Elasticsearch, Logstash, Kibana)
- [ ] Service Mesh — Istio/Linkerd for traffic management & observability

---

Developed with ❤️ by [Shresth](https://github.com/Shresth2725)
