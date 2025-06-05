# ตัวอย่างการตั้งค่า Environment Variables สำหรับ Per-Pod Audit Logs

## 1. Docker Compose (scaling support)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: aegisx-api:latest
    environment:
      - CONTAINER_NAME=${HOSTNAME:-${COMPOSE_PROJECT_NAME}_app_${CONTAINER_NUMBER:-1}}
      # หรือใช้วิธีนี้สำหรับ scaling
      - CONTAINER_NAME={{.Service.Name}}.{{.Task.Slot}}
    deploy:
      replicas: 3  # จะสร้าง app_1, app_2, app_3
```

## 2. Kubernetes Deployment

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegisx-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: aegisx-api
        image: aegisx-api:latest
        env:
        # Pod name จะเป็น aegisx-api-deployment-xxxxx
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        # หรือใช้ hostname ของ pod
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
```

## 3. Docker Swarm

```yaml
# docker-compose.swarm.yml
version: '3.8'

services:
  app:
    image: aegisx-api:latest
    environment:
      - CONTAINER_NAME={{.Service.Name}}.{{.Task.Slot}}.{{.Task.ID}}
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
```

## 4. การทดสอบ Environment Variables

```bash
# ทดสอบ local
export HOSTNAME="test-container-1"
npm run dev

# ทดสอบ pod name
export POD_NAME="aegisx-pod-abc123"
npm run dev

# ทดสอบ container name
export CONTAINER_NAME="aegisx_app_2"
npm run dev
```

## 5. Docker Compose แบบ Scale

```bash
# เริ่ม services
docker-compose up -d --scale app=3

# ตรวจสอบ container names
docker ps --format "table {{.Names}}\t{{.Status}}"

# จะได้
# aegisx_app_1    Up
# aegisx_app_2    Up  
# aegisx_app_3    Up
```

## 6. ใน Production Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegisx-api
spec:
  replicas: 5
  template:
    metadata:
      labels:
        app: aegisx-api
    spec:
      containers:
      - name: api
        image: aegisx-api:latest
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
```

## สรุป: อะไรที่มาเอง อะไรที่ต้องตั้ง

✅ **มาเอง (ไม่ต้องตั้ง)**
- `HOSTNAME` - Docker/K8s ตั้งให้อัตโนมัติ

⚙️ **ต้องตั้งเอง**
- `POD_NAME` - ใน Kubernetes deployment
- `CONTAINER_NAME` - ใน Docker Compose scaling

🎯 **แนะนำ**: ใช้ `HOSTNAME` เป็นหลัก เพราะมาเองในทุกสภาพแวดล้อม!
