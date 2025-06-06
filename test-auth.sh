#!/bin/bash

# Script สำหรับทดสอบ Auth Routes ทั้งหมด
# รันด้วยคำสั่ง: ./test-auth.sh [api_url]
# api_url เป็น optional parameter, default: http://localhost:3000

# สีที่ใช้แสดงผล
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ตรวจสอบว่ามีการกำหนด API URL หรือไม่
API_URL=${1:-http://localhost:3000}

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}🚀 เริ่มทดสอบ Auth Routes ทั้งหมดบน $API_URL${NC}"
echo -e "${BLUE}====================================================${NC}"

# ตรวจสอบว่ามี npm packages ที่จำเป็นหรือไม่
echo -e "${YELLOW}ตรวจสอบ dependencies ที่จำเป็น...${NC}"

# เข้าไปที่โฟลเดอร์ scripts และติดตั้ง dependencies
(cd scripts && npm install)
if [ $? -ne 0 ]; then
    echo -e "${RED}ไม่สามารถติดตั้ง dependencies ได้${NC}"
    echo -e "${YELLOW}โปรดติดตั้ง dependencies ด้วยตนเอง: cd scripts && npm install${NC}"
    exit 1
fi

# 1. ทดสอบ Auth Routes ทั้งหมด
echo -e "\n${BLUE}📋 ทดสอบ Auth Routes พื้นฐาน...${NC}"
API_URL="$API_URL" node --experimental-vm-modules ./scripts/test-auth-routes.js

# 2. ทดสอบ API Key Authentication
echo -e "\n${BLUE}🔑 ทดสอบ API Key Authentication...${NC}"
API_URL="$API_URL" node --experimental-vm-modules ./scripts/test-api-key-auth.js

echo -e "\n${GREEN}✅ การทดสอบทั้งหมดเสร็จสิ้น!${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "${YELLOW}หมายเหตุ:${NC}"
echo -e "${YELLOW}- หากการทดสอบ reset password ไม่ผ่าน เป็นเพราะใช้ token จำลอง${NC}"
echo -e "${YELLOW}- สำหรับการทดสอบแบบละเอียด โปรดดูที่ logs ของเซิร์ฟเวอร์${NC}"
echo -e "${BLUE}====================================================${NC}"
