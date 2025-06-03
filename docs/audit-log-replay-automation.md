# Audit Log Replay Automation (RabbitMQ Recovery)

This guide explains how to automate the replay of offline audit logs (`logs/audit-offline.jsonl`) to RabbitMQ when it becomes available again. Two deployment scenarios are covered:

- **Docker Compose**
- **Kubernetes**

---

## 1. Docker Compose: Audit Replay Automation

### **Approach: Sidecar or Dedicated Service**

Add a new service to your `docker-compose.yml` that runs the replay script in a loop (e.g., every 60 seconds). This service shares the logs and scripts with your main app.

#### **Example Service**
```yaml
services:
  app:
    # ... your main app config ...
    volumes:
      - ./logs:/app/logs
      - ./scripts:/app/scripts
      - ./src:/app/src
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq

  audit-replay:
    image: node:20
    working_dir: /app
    command: sh -c "while true; do npx ts-node scripts/replay-audit-offline.ts; sleep 60; done"
    volumes:
      - ./logs:/app/logs
      - ./scripts:/app/scripts
      - ./src:/app/src
      - ./package.json:/app/package.json
      - ./tsconfig.json:/app/tsconfig.json
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
```

- The `audit-replay` service will check and replay offline logs every 60 seconds.
- Both containers share the `logs` volume, so the replay script can access the offline log.
- You can adjust the interval as needed.

---

## 2. Kubernetes: Audit Replay Automation

### **Approach 1: CronJob**

Use a Kubernetes `CronJob` to run the replay script on a schedule (e.g., every 5 minutes). Ensure the logs are stored in a PersistentVolumeClaim (PVC) shared with your main app.

#### **Example CronJob**
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: audit-replay
spec:
  schedule: "*/5 * * * *" # Every 5 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: audit-replay
              image: node:20
              command: ["npx", "ts-node", "scripts/replay-audit-offline.ts"]
              volumeMounts:
                - name: audit-logs
                  mountPath: /app/logs
                - name: scripts
                  mountPath: /app/scripts
                - name: src
                  mountPath: /app/src
          restartPolicy: OnFailure
          volumes:
            - name: audit-logs
              persistentVolumeClaim:
                claimName: audit-logs-pvc
            - name: scripts
              hostPath:
                path: /path/to/your/scripts
            - name: src
              hostPath:
                path: /path/to/your/src
```
- Make sure your main app also mounts the same `audit-logs-pvc` for log sharing.

### **Approach 2: Sidecar Container**

Add a sidecar container to your main app's Pod. The sidecar runs the replay script in a loop and shares the logs volume with the main app.

#### **Example Pod Spec (Sidecar)**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: aegisx-app
spec:
  containers:
    - name: main-app
      image: your-app-image
      volumeMounts:
        - name: audit-logs
          mountPath: /app/logs
    - name: audit-replay
      image: node:20
      command: ["sh", "-c", "while true; do npx ts-node scripts/replay-audit-offline.ts; sleep 60; done"]
      volumeMounts:
        - name: audit-logs
          mountPath: /app/logs
  volumes:
    - name: audit-logs
      persistentVolumeClaim:
        claimName: audit-logs-pvc
```
- The sidecar will continuously check and replay offline logs.
- Both containers share the same logs volume.

---

## **Best Practices**
- Use a PersistentVolume (PVC) for logs in Kubernetes to ensure durability.
- Adjust the replay interval as needed for your environment.
- Monitor logs for replay errors or failures.
- The replay script is safe: it only deletes the offline log if RabbitMQ is healthy and all events are sent.

---

**Choose the approach that fits your deployment. Both methods ensure audit logs are reliably replayed when RabbitMQ is available.**
