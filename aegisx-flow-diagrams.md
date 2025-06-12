# AegisX Flow Diagrams Collection

## 📊 Overview

This document contains all the flow diagrams for AegisX Universal Core API project, providing visual representations of various processes, architectures, and user interactions.

---

## 🔐 Authentication Flows

### 1. User Login Flow (OAuth 2.0)
```mermaid
sequenceDiagram
    participant User as 👤 User
    participant App as 📱 Todo App
    participant Gateway as 🌐 API Gateway
    participant Core as 🔐 AegisX Core
    participant DB as 🗄️ Database
    
    User->>App: 1. Access Todo App
    App->>Gateway: 2. Check authentication
    Gateway->>App: 3. Not authenticated
    App->>Core: 4. Redirect to /auth/login
    
    User->>Core: 5. Enter email/password
    Core->>DB: 6. Validate credentials
    DB-->>Core: 7. User data
    Core->>Core: 8. Generate JWT tokens
    Core-->>App: 9. Return access + refresh tokens
    
    App->>App: 10. Store tokens securely
    App-->>User: 11. Login successful, show dashboard
```

### 2. JWT Token Validation Flow
```mermaid
sequenceDiagram
    participant App as 📱 Application
    participant Gateway as 🌐 API Gateway
    participant Core as 🔐 AegisX Core
    participant Cache as ⚡ Redis Cache
    
    App->>Gateway: 1. API Request + JWT
    Gateway->>Gateway: 2. Extract JWT from header
    Gateway->>Cache: 3. Check token blacklist
    Cache-->>Gateway: 4. Token status
    
    alt Token valid and not blacklisted
        Gateway->>Core: 5. Validate JWT signature
        Core-->>Gateway: 6. Token valid + user context
        Gateway->>Gateway: 7. Extract user permissions
        Gateway-->>App: 8. Forward request with user context
    else Token invalid or blacklisted
        Gateway-->>App: 9. 401 Unauthorized
    end
```

### 3. Token Refresh Flow
```mermaid
sequenceDiagram
    participant App as 📱 Application
    participant Core as 🔐 AegisX Core
    participant DB as 🗄️ Database
    participant Cache as ⚡ Redis Cache
    
    App->>Core: 1. POST /auth/refresh (refresh token)
    Core->>DB: 2. Validate refresh token
    DB-->>Core: 3. Token valid + user data
    
    Core->>Core: 4. Generate new access token
    Core->>Cache: 5. Store new token session
    Core->>DB: 6. Update refresh token (optional rotation)
    
    Core-->>App: 7. New access + refresh tokens
    App->>App: 8. Update stored tokens
```

---

## 👤 User Management Flows

### 4. User Registration Flow
```mermaid
flowchart TD
    A[User submits registration] --> B{Validate input}
    B -->|Invalid| C[Return validation errors]
    B -->|Valid| D{Check email exists}
    D -->|Exists| E[Return email already exists]
    D -->|New| F[Hash password with bcrypt]
    F --> G[Create user record]
    G --> H{Multi-tenant enabled?}
    H -->|Yes| I[Assign to default tenant]
    H -->|No| J[Skip tenant assignment]
    I --> K[Assign default role]
    J --> K
    K --> L[Send verification email]
    L --> M[Return success + user ID]
```

### 5. User Profile Update Flow
```mermaid
sequenceDiagram
    participant User as 👤 User
    participant App as 📱 Application
    participant Core as 🔐 AegisX Core
    participant DB as 🗄️ Database
    participant Events as 📢 Event Bus
    
    User->>App: 1. Update profile info
    App->>Core: 2. PUT /users/me (with JWT)
    Core->>Core: 3. Validate JWT & permissions
    Core->>Core: 4. Validate input data
    Core->>DB: 5. Update user record
    DB-->>Core: 6. Updated user data
    Core->>Events: 7. Publish user.updated event
    Core-->>App: 8. Return updated profile
    App-->>User: 9. Show success message
    
    Events->>Events: 10. Notify other services
```

---

## 🛡️ RBAC (Role-Based Access Control) Flows

### 6. Permission Check Flow
```mermaid
flowchart TD
    A[Request with required permission] --> B{User authenticated?}
    B -->|No| C[Return 401 Unauthorized]
    B -->|Yes| D[Get user roles from context]
    D --> E[Load role permissions from cache]
    E --> F{Permission found in roles?}
    F -->|Yes| G{Resource-level check needed?}
    F -->|No| H[Return 403 Forbidden]
    G -->|Yes| I{User owns resource?}
    G -->|No| J[Allow access]
    I -->|Yes| J
    I -->|No| K{User has admin role?}
    K -->|Yes| J
    K -->|No| H
    J --> L[Continue to business logic]
```

### 7. Role Assignment Flow
```mermaid
sequenceDiagram
    participant Admin as 👨‍💼 Admin
    participant UI as 💻 Admin UI
    participant Core as 🔐 AegisX Core
    participant DB as 🗄️ Database
    participant Cache as ⚡ Cache
    participant Events as 📢 Events
    
    Admin->>UI: 1. Select user + role to assign
    UI->>Core: 2. POST /users/:id/roles
    Core->>Core: 3. Check admin permissions
    Core->>DB: 4. Validate user and role exist
    DB-->>Core: 5. Validation result
    Core->>DB: 6. Create user_role assignment
    Core->>Cache: 7. Invalidate user permission cache
    Core->>Events: 8. Publish role.assigned event
    Core-->>UI: 9. Assignment successful
    UI-->>Admin: 10. Show success notification
```

---

## 🏢 Multi-Tenant Flows

### 8. Tenant Switching Flow
```mermaid
sequenceDiagram
    participant User as 👤 User
    participant App as 📱 Application
    participant Core as 🔐 AegisX Core
    participant DB as 🗄️ Database
    participant Cache as ⚡ Cache
    
    User->>App: 1. Select different tenant
    App->>Core: 2. POST /auth/switch-tenant
    Core->>DB: 3. Validate user has access to tenant
    DB-->>Core: 4. Access confirmed
    Core->>DB: 5. Get user roles in new tenant
    DB-->>Core: 6. Tenant-specific roles
    Core->>Core: 7. Generate new JWT with tenant context
    Core->>Cache: 8. Update session with new tenant
    Core-->>App: 9. New JWT + tenant info
    App->>App: 10. Update UI context
    App-->>User: 11. Switched to new tenant
```

### 9. Multi-Tenant Data Isolation Flow
```mermaid
flowchart TD
    A[API Request] --> B{Multi-tenant enabled?}
    B -->|No| C[Process without tenant filter]
    B -->|Yes| D[Extract tenant from JWT]
    D --> E{Tenant ID present?}
    E -->|No| F[Return 400 Bad Request]
    E -->|Yes| G[Add tenant filter to query]
    G --> H[Execute query with tenant isolation]
    H --> I[Return tenant-specific data]
    C --> J[Return global data]
```

---

## 📝 Application Integration Flows

### 10. Todo App Complete Flow
```mermaid
sequenceDiagram
    participant User as 👤 User
    participant TodoWeb as 💻 Todo Web
    participant Gateway as 🌐 Gateway
    participant Core as 🔐 Core API
    participant TodoAPI as 📝 Todo API
    participant DB as 🗄️ Todo DB
    
    Note over User,DB: 1. Authentication Phase
    User->>TodoWeb: Open Todo App
    TodoWeb->>Gateway: Check auth status
    Gateway->>Core: Validate session
    Core-->>Gateway: Not authenticated
    Gateway-->>TodoWeb: Redirect to login
    TodoWeb->>Core: Show login form
    User->>Core: Enter credentials
    Core-->>TodoWeb: Return JWT token
    
    Note over User,DB: 2. Todo Operations
    User->>TodoWeb: View my todos
    TodoWeb->>Gateway: GET /todos (with JWT)
    Gateway->>Core: Validate JWT
    Core-->>Gateway: User context
    Gateway->>TodoAPI: Forward request + user
    TodoAPI->>DB: SELECT todos WHERE user_id
    DB-->>TodoAPI: User's todos
    TodoAPI-->>Gateway: Todo list
    Gateway-->>TodoWeb: Todo data
    TodoWeb-->>User: Display todos
    
    Note over User,DB: 3. Create New Todo
    User->>TodoWeb: Create new todo
    TodoWeb->>Gateway: POST /todos + data
    Gateway->>Core: Check permission (todo:create)
    Core-->>Gateway: Permission granted
    Gateway->>TodoAPI: Create todo + user context
    TodoAPI->>DB: INSERT new todo
    DB-->>TodoAPI: Todo created
    TodoAPI-->>Gateway: Success response
    Gateway-->>TodoWeb: Todo created
    TodoWeb-->>User: Show new todo
```

---

## 🏗️ System Architecture Flows

### 11. System Startup Flow
```mermaid
flowchart TD
    A[System Start] --> B[Load Environment Config]
    B --> C{Multi-tenant enabled?}
    C -->|Yes| D[Initialize tenant schemas]
    C -->|No| E[Initialize single-tenant schema]
    D --> F[Connect to PostgreSQL]
    E --> F
    F --> G[Connect to Redis Cache]
    G --> H[Connect to RabbitMQ]
    H --> I[Run Database Migrations]
    I --> J[Seed Initial Data]
    J --> K[Start Health Checks]
    K --> L[Register API Routes]
    L --> M[Start HTTP Server]
    M --> N[System Ready]
```

### 12. Event-Driven Communication Flow
```mermaid
sequenceDiagram
    participant UserAPI as 👤 User API
    participant EventBus as 📢 Event Bus
    participant TodoAPI as 📝 Todo API
    participant NotifyAPI as 📧 Notification API
    participant AuditAPI as 📊 Audit API
    
    UserAPI->>EventBus: 1. Publish user.created event
    EventBus->>TodoAPI: 2. user.created event
    EventBus->>NotifyAPI: 3. user.created event
    EventBus->>AuditAPI: 4. user.created event
    
    TodoAPI->>TodoAPI: 5. Create default todo list
    NotifyAPI->>NotifyAPI: 6. Send welcome email
    AuditAPI->>AuditAPI: 7. Log user creation
    
    TodoAPI->>EventBus: 8. Publish todo.list_created
    NotifyAPI->>EventBus: 9. Publish email.sent
    AuditAPI->>EventBus: 10. Publish audit.logged
```

---

## 🚀 Deployment Flows

### 13. CI/CD Pipeline Flow
```mermaid
flowchart TD
    A[Code Commit] --> B[GitHub Actions Trigger]
    B --> C[Checkout Code]
    C --> D[Setup Node.js 22]
    D --> E[Install Dependencies]
    E --> F[Run Linting]
    F --> G{Lint Passed?}
    G -->|No| H[Report Lint Errors]
    G -->|Yes| I[Run Unit Tests]
    I --> J{Tests Passed?}
    J -->|No| K[Report Test Failures]
    J -->|Yes| L[Run Integration Tests]
    L --> M{Integration Tests Passed?}
    M -->|No| N[Report Integration Failures]
    M -->|Yes| O[Build Docker Image]
    O --> P[Security Scan]
    P --> Q{Security Check Passed?}
    Q -->|No| R[Report Security Issues]
    Q -->|Yes| S[Push to Registry]
    S --> T[Deploy to Staging]
    T --> U[Run E2E Tests]
    U --> V{E2E Tests Passed?}
    V -->|No| W[Rollback Staging]
    V -->|Yes| X[Deploy to Production]
    X --> Y[Health Check]
    Y --> Z[Deployment Complete]
```

### 14. Application Scaling Flow
```mermaid
flowchart TD
    A[Monitor System Metrics] --> B{CPU > 80%?}
    B -->|No| C{Memory > 85%?}
    C -->|No| D{Response Time > 500ms?}
    D -->|No| A
    B -->|Yes| E[Trigger Auto-scaling]
    C -->|Yes| E
    D -->|Yes| E
    E --> F[Create New Pod Instance]
    F --> G[Health Check New Instance]
    G --> H{Health Check Passed?}
    H -->|No| I[Terminate Failed Instance]
    I --> J[Alert Operations Team]
    H -->|Yes| K[Add to Load Balancer]
    K --> L[Monitor Performance]
    L --> M{Load Decreased?}
    M -->|No| L
    M -->|Yes| N[Scale Down Instances]
    N --> A
```

---

## 🔄 Data Flow Diagrams

### 15. Request Processing Flow
```mermaid
flowchart LR
    A[Client Request] --> B[Load Balancer]
    B --> C[API Gateway]
    C --> D{Authentication Required?}
    D -->|No| E[Route to Service]
    D -->|Yes| F[Validate JWT]
    F --> G{Valid Token?}
    G -->|No| H[Return 401]
    G -->|Yes| I{Check Permissions}
    I --> J{Authorized?}
    J -->|No| K[Return 403]
    J -->|Yes| L{Rate Limit OK?}
    L -->|No| M[Return 429]
    L -->|Yes| N[Route to Service]
    E --> O[Process Business Logic]
    N --> O
    O --> P[Access Database]
    P --> Q[Return Response]
    Q --> R[Log Request]
    R --> S[Return to Client]
```

### 16. Database Transaction Flow
```mermaid
sequenceDiagram
    participant API as 📱 API Service
    participant DB as 🗄️ Database
    participant Cache as ⚡ Redis
    participant Events as 📢 Event Bus
    
    API->>DB: 1. BEGIN TRANSACTION
    API->>DB: 2. INSERT user data
    API->>DB: 3. INSERT user_roles
    API->>DB: 4. INSERT audit_log
    
    alt All operations successful
        API->>DB: 5. COMMIT TRANSACTION
        API->>Cache: 6. Cache user data
        API->>Events: 7. Publish user.created
        API-->>API: 8. Return success
    else Any operation fails
        API->>DB: 5. ROLLBACK TRANSACTION
        API-->>API: 6. Return error
    end
```

---

## 📊 Monitoring & Analytics Flows

### 17. Health Check Flow
```mermaid
flowchart TD
    A[Health Check Request] --> B[Check API Server]
    B --> C{API Healthy?}
    C -->|No| D[Return 503]
    C -->|Yes| E[Check Database]
    E --> F{DB Healthy?}
    F -->|No| D
    F -->|Yes| G[Check Redis Cache]
    G --> H{Cache Healthy?}
    H -->|No| D
    H -->|Yes| I[Check RabbitMQ]
    I --> J{Queue Healthy?}
    J -->|No| D
    J -->|Yes| K[Check External Services]
    K --> L{All Services Healthy?}
    L -->|No| M[Return 200 with warnings]
    L -->|Yes| N[Return 200 healthy]
```

### 18. Error Handling Flow
```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type?}
    B -->|Validation| C[Return 400 + details]
    B -->|Authentication| D[Return 401 + reason]
    B -->|Authorization| E[Return 403 + required permission]
    B -->|Not Found| F[Return 404 + resource]
    B -->|Rate Limit| G[Return 429 + retry after]
    B -->|Server Error| H[Log Error Details]
    H --> I[Generate Error ID]
    I --> J[Alert Monitoring]
    J --> K[Return 500 + error ID]
    C --> L[Log Request]
    D --> L
    E --> L
    F --> L
    G --> L
    K --> L
    L --> M[Update Metrics]
```

---

## 🎯 Summary

These flow diagrams provide comprehensive visual documentation for:

- **Authentication & Authorization**: Complete OAuth 2.0 and JWT flows
- **User Management**: Registration, updates, and profile management
- **RBAC System**: Permission checking and role assignments
- **Multi-tenant Operations**: Tenant switching and data isolation
- **Application Integration**: End-to-end application flows
- **System Architecture**: Startup, scaling, and event-driven communication
- **Deployment**: CI/CD pipelines and scaling strategies
- **Data Processing**: Request handling and database transactions
- **Monitoring**: Health checks and error handling

Each diagram can be rendered using Mermaid and serves as both documentation and implementation guidance for the AegisX Universal Core API project. 