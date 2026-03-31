# 🛒 E-commerce Microservices Architecture

A scalable e-commerce backend built using microservices architecture with independent services for authentication, products, cart, orders, and notifications.

---

## 📌 Tech Stack

- Backend: Node.js, Express  
- Database: MongoDB (separate DB per service)  
- Messaging: RabbitMQ  
- Authentication: JWT  
- API Gateway: Nginx / Express Gateway  
- File Uploads: Cloudinary + Multer  
- Containerization: Docker  

---

## 🧩 Microservices Overview

### 1. Auth Service
- User registration & login  
- JWT generation  
- OTP verification (via Notification Service)  

### 2. Product Service
- Add / update / delete products (seller only)  
- Product search, filter, sort  
- Public product listing  

### 3. Cart Service
- Add/remove items  
- Get user cart  
- Requires authenticated user  

### 4. Order Service
- Place orders  
- Track order status  
- Handles checkout flow  

### 5. Notification Service
- Sends OTP / emails  
- Uses RabbitMQ for async processing  

### 6. API Gateway
- Single entry point  
- Routes requests to services  
- Handles auth middleware (JWT verification)  

---

## 🔐 Authentication Flow

1. User logs in via Auth Service  
2. Auth Service returns JWT  
3. Client sends JWT in headers  
4. Each service verifies JWT using middleware  
5. User info extracted from token  

---

## 🔄 Service Communication

- Sync: REST APIs (via API Gateway)  
- Async: RabbitMQ (for notifications, events)  

---

## 🗂️ Database Design

- Each service has its own database (loose coupling)  

**Example:**
- Auth DB → Users  
- Product DB → Products  
- Order DB → Orders  

---

## ⚙️ Key Concepts

- Stateless services  
- Decentralized data management  
- Event-driven communication  
- Horizontal scalability  

---
